-- ========================================
-- GAMEFLIX CATALOG - SETUP COMPLETO DO BANCO DE DADOS
-- Execute este arquivo no SQL Editor do Supabase
-- ========================================

-- ========================================
-- 1. CRIAR TIPOS E ENUMS
-- ========================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- ========================================
-- 2. CRIAR TABELAS PRINCIPAIS
-- ========================================

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  description TEXT NOT NULL,
  gradient TEXT NOT NULL,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  family_code TEXT,
  tutorial JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_games INTEGER NOT NULL,
  description TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_game_selections table
CREATE TABLE public.user_game_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- ========================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_selections ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CRIAR FUNÇÕES
-- ========================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Set default role as client
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Function to get public games (without credentials)
CREATE OR REPLACE FUNCTION public.get_public_games()
RETURNS TABLE (
  id uuid,
  title text,
  cover_url text,
  gradient text,
  description text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, cover_url, gradient, description, created_at
  FROM public.games
  ORDER BY created_at DESC;
$$;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND expires_at > now()
  )
$$;

-- Function to get user's subscription plan
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS TABLE(plan_slug text, max_games integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.slug, sp.max_games
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = _user_id
    AND s.status = 'active'
    AND s.expires_at > now()
  LIMIT 1
$$;

-- ========================================
-- 5. CRIAR TRIGGERS
-- ========================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 6. CRIAR POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Games policies
CREATE POLICY "Authenticated users can view all game details" 
  ON public.games 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert games"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update games"
  ON public.games FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete games"
  ON public.games FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User game selections policies
CREATE POLICY "Users can view their own game selections"
  ON public.user_game_selections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own game selections"
  ON public.user_game_selections
  FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- 7. CONCEDER PERMISSÕES
-- ========================================

-- Grant access to public functions
GRANT EXECUTE ON FUNCTION public.get_public_games() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_games() TO authenticated;

-- ========================================
-- 8. INSERIR DADOS INICIAIS
-- ========================================

-- Insert the 3 subscription plans
INSERT INTO public.subscription_plans (name, slug, price, max_games, description, features) VALUES
(
  'Basic',
  'basic',
  29.90,
  3,
  'Perfeito para começar sua jornada gamer',
  '["Acesso a 3 jogos simultâneos", "Troca de jogos a qualquer momento", "Garantia de 30 dias", "Suporte prioritário", "Acesso offline"]'::jsonb
),
(
  'Gamer',
  'gamer',
  59.90,
  10,
  'Para quem quer variedade e mais opções',
  '["Acesso a 10 jogos simultâneos", "Troca ilimitada de jogos", "Garantia de 30 dias", "Suporte prioritário", "Acesso offline", "Lançamentos recentes"]'::jsonb
),
(
  'Ultimate',
  'ultimate',
  99.90,
  999999,
  'Acesso completo ao catálogo inteiro',
  '["Acesso ILIMITADO a todos os jogos", "Troca ilimitada de jogos", "Garantia de 30 dias", "Suporte VIP 24/7", "Acesso offline", "Todos os lançamentos", "Acesso antecipado a novos jogos"]'::jsonb
);

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================
-- Agora você pode:
-- 1. Executar: npm run import:games
-- 2. Criar usuários no Supabase Auth
-- 3. Iniciar a aplicação: npm run dev
-- ========================================