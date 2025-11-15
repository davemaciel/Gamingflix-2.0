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

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_selections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (everyone can view active plans)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for subscriptions
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

-- RLS Policies for user_game_selections
CREATE POLICY "Users can view their own game selections"
ON public.user_game_selections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own game selections"
ON public.user_game_selections
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

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

-- Create function to check if user has active subscription
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

-- Create function to get user's subscription plan
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