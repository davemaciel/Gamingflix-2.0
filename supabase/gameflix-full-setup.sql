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

-- ========================================
-- 9. IMPORTACAO DOS JOGOS PADRAO (DERIVADOS DO TRELLO)
-- Total de jogos importados: 57
-- Gerado em: 2025-10-09T19:44:24.257Z
-- ========================================

-- Limpar dependencias e a tabela de jogos antes de inserir os dados padrao
TRUNCATE TABLE public.user_game_selections, public.games RESTART IDENTITY;
-- Game 1: Inzoi
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Inzoi',
  '/covers/inzoi.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'InzoiMHZ',
  'KillerThesims2025',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix, se necessário;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Desative o Nuvem Steam nas configurações para evitar conflitos de salvamento.","Baixe o programa Firewall App Blocker 1.9 ([https://www.sordum.org/downloads/?firewall-app-blocker](https://www.sordum.org/downloads/?firewall-app-blocker \"‌\")), após isso descompacte o arquivo em qualquer pasta que desejar, abra o programa usando seu Windows que deve ser 64 bits. Fab_x64.exe. Com o programa aberto na aba regras de saída, clique no botão + para adicionar um programa, procure pela pasta do STEAM, padrão é C:\\Program Files (x86)\\Steam. Escolha o arquivo Steam.exe","Vai ficar com o simbolo de proibido como na imagem: ([https://imgur.com/a/P6PEUDP](https://imgur.com/a/P6PEUDP \"‌\"))"]'::jsonb
);

-- Game 2: Monster Hunter Wilds
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Monster Hunter Wilds',
  '/covers/monster-hunter-wilds.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'kddgames02',
  'Best1423@@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix, se necessário;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 3: Stellar Blade
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Stellar Blade',
  '/covers/stellar-blade.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'sbladeMHZ01',
  'SellerThunderMHZ4865',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix, se necessário;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 4: The First Berseker Kazhan
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'The First Berseker Kazhan',
  '/covers/the-first-berseker-kazhan.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'KhazanFLIX',
  'KhazanFlix@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix, se necessário;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 5: The Elder Scrolls IV Oblivion: Remastered
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'The Elder Scrolls IV Oblivion: Remastered',
  '/covers/the-elder-scrolls-iv-oblivion-remastered.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'kazakh_zzzzzrr13',
  'ZZZZZrr1330',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 6: Expedition 33
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Expedition 33',
  '/covers/expedition-33.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'expedition33ggmax',
  'Loja:sorvete_storyGGMAX',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 7: Bleach Rebirth of Souls
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Bleach Rebirth of Souls',
  '/covers/bleach-rebirth-of-souls.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'BleachRebirthFlix',
  'BankaiFlix@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 8: AC Shadows
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'AC Shadows',
  '/covers/ac-shadows.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'acshadowsflix',
  'ACshadows@',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 9: Assassin's Creed Mirage
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Assassin''s Creed Mirage',
  '/covers/assassin-s-creed-mirage.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Ubisoft',
  'from-blue-600 to-gray-800',
  'ACMirage@gamingflix.space',
  'Gm1AC!r9x',
  NULL,
  '["Baixe o Ubisoft Connect neste link: [https://ubi.li/4vxt9​;](https://ubi.li/4vxt9%E2%80%8B; \"‌\")","Adquira o jogo diretamente através de sua conta;","Inicie o Ubisoft Connect e insira as credenciais fornecidas junto com o código de verificação em dois passos que será enviado;","Após acessar a conta, navegue até \"configurações\" e DESMARQUE as opções \"ativar sincronização na nuvem\" e \"habilitar atualizações automáticas para os últimos jogos acessados\". Sim, desabilite essas duas funções;","Selecione o jogo e, abaixo da opção de \"download\", clique em \"localizar instalação\" e direcione para a pasta onde o jogo foi baixado via torrent;","Ao carregar os arquivos do jogo, clique em jogar e encerre o jogo assim que os menus principais forem exibidos. Se o jogo solicitar atualizações para instalação, proceda com a instalação. Isso é necessário pois o jogo não será iniciado sem as atualizações recentes;","Depois de iniciar o jogo, alcançar os menus principais e encerrá-lo, retorne ao Ubisoft Connect e selecione Opções de Internet;","No Ubisoft Connect, escolha a opção \"ficar off-line\";","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!","Por fim, para assegurar uma ativação mais estável, é possível abrir o Firewall App Blocker e bloquear os processos relacionados ao Ubisoft Connect para prevenir o acesso à internet, evitando assim, possíveis problemas futuros!"]'::jsonb
);

-- Game 10: Assassin’s Creed Valhalla
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Assassin’s Creed Valhalla',
  '/covers/assassin-s-creed-valhalla.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Ubisoft',
  'from-blue-600 to-gray-800',
  'ACValhalla@gamingflix.space',
  'Santana@2121',
  NULL,
  '["Baixe o Ubisoft Connect neste link: [https://ubi.li/4vxt9​;](https://ubi.li/4vxt9%E2%80%8B; \"‌\")","Adquira o jogo diretamente através de sua conta;","Inicie o Ubisoft Connect e insira as credenciais fornecidas junto com o código de verificação em dois passos que será enviado;","Após acessar a conta, navegue até \"configurações\" e DESMARQUE as opções \"ativar sincronização na nuvem\" e \"habilitar atualizações automáticas para os últimos jogos acessados\". Sim, desabilite essas duas funções;","Selecione o jogo e, abaixo da opção de \"download\", clique em \"localizar instalação\" e direcione para a pasta onde o jogo foi baixado via torrent;","Ao carregar os arquivos do jogo, clique em jogar e encerre o jogo assim que os menus principais forem exibidos. Se o jogo solicitar atualizações para instalação, proceda com a instalação. Isso é necessário pois o jogo não será iniciado sem as atualizações recentes;","Depois de iniciar o jogo, alcançar os menus principais e encerrá-lo, retorne ao Ubisoft Connect e selecione Opções de Internet;","No Ubisoft Connect, escolha a opção \"ficar off-line\";","Por fim, para assegurar uma ativação mais estável, é possível abrir o Firewall App Blocker e bloquear os processos relacionados ao Ubisoft Connect para prevenir o acesso à internet, evitando assim, possíveis problemas futuros!"]'::jsonb
);

-- Game 11: Baldur's Gate 3
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Baldur''s Gate 3',
  '/covers/baldur-s-gate-3.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'eesskk3749',
  'Wd73wjsplay',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 12: Black Myth: Wukong
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Black Myth: Wukong',
  '/covers/black-myth-wukong.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'wukongflix',
  'MonkeY@ggf24',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 13: Cyberpunk 2077
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Cyberpunk 2077',
  '/covers/cyberpunk-2077.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-yellow-400 to-pink-600',
  'phantomspace2077',
  'L1b3Rty7720',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 14: Dead Island 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Dead Island 2',
  '/covers/dead-island-2.jpg',
  'Jogo disponivel em: Games Offline',
  'from-blue-600 to-purple-600',
  'DeadIsland2@gamingflix.space',
  'D3ADSl@nd2024',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 15: Dragon Ball Sparking Zero
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Dragon Ball Sparking Zero',
  '/covers/dragon-ball-sparking-zero.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-orange-500 to-blue-500',
  'sparkinggflix',
  'DBZsparking@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 16: Dragon's Dogma 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Dragon''s Dogma 2',
  '/covers/dragon-s-dogma-2.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'dragonsdogmagflix',
  'dR@g0nsDgM2!',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 17: EA FC 2024
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'EA FC 2024',
  '/covers/ea-fc-2024.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-green-500 to-blue-600',
  'annie_floyd1995',
  'FifaFlix@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 18: EA FC 2025
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'EA FC 2025',
  '/covers/ea-fc-2025.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-green-500 to-blue-600',
  'duz51213',
  '1984731433',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 19: Elden Ring
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Elden Ring',
  '/covers/elden-ring.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-yellow-600 to-gray-800',
  'eldenflix2024',
  'ElD3Nr1NGS402',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 20: Enigma do Medo
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Enigma do Medo',
  '/covers/enigma-do-medo.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'EnigmaFlix',
  'EnigmaOfFlix@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 21: Final Fantasy 16
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Final Fantasy 16',
  '/covers/final-fantasy-16.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-purple-600 to-blue-700',
  'ffantasy16flix',
  'F1n@LX@24',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 22: Final Fantasy 7 Rebirth
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Final Fantasy 7 Rebirth',
  '/covers/final-fantasy-7-rebirth.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-purple-600 to-blue-700',
  '**Senha:**',
  '**Passo a Passo**',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 23: Ghost of Tsushima
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Ghost of Tsushima',
  '/covers/ghost-of-tsushima.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-600 to-yellow-500',
  'tsushimaflix',
  'GhosTsuSh1m4@2420',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 24: God of War + Ragnarok
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'God of War + Ragnarok',
  '/covers/god-of-war-ragnarok.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-600 to-gray-900',
  'gowgamingflix',
  'God0fW@flix2418',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 25: Granblue Fantasy Relink
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Granblue Fantasy Relink',
  '/covers/granblue-fantasy-relink.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'granbluegflix',
  'Gr@nblU3flix01',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 26: Hogwarts Legacy
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Hogwarts Legacy',
  '/covers/hogwarts-legacy.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-purple-600 to-yellow-600',
  'davehogwarts',
  'D@v3hogw4rts',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 27: Horizon Forbidden West
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Horizon Forbidden West',
  '/covers/horizon-forbidden-west.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-500 to-orange-600',
  'horizonforbgflix',
  'H0r1ZoNw3sT2',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play e a Nuvem Steam nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 28: Mortal Kombat 1
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Mortal Kombat 1',
  '/covers/mortal-kombat-1.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-yellow-500 to-red-700',
  'kombatspace01',
  'Mortk0b@T1',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 29: NBA 2K24
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'NBA 2K24',
  '/covers/nba-2k24.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'luckycurt',
  'NBA2K24LojadoXityyxz&jottartz',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 30: Red Dead Redemption 1
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Red Dead Redemption 1',
  '/covers/red-dead-redemption-1.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-700 to-orange-600',
  'rdr1off',
  'ks827323666sw',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GGFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em Ficar Offline;","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 31: Red Dead Redemption 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Red Dead Redemption 2',
  '/covers/red-dead-redemption-2.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-700 to-orange-600',
  'w5Png0482',
  '2Rgh97556',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GGFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em Ficar Offline;","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 32: Resident Evil 2 Remake
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Resident Evil 2 Remake',
  '/covers/resident-evil-2-remake.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-600 to-black',
  'steamok1090006',
  'steamok2645488235',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Caso necessário, solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 33: Resident Evil 4 Remake
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Resident Evil 4 Remake',
  '/covers/resident-evil-4-remake.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-red-600 to-black',
  'davere4remake',
  'D@viRE4#1',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 34: Split Fiction
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Split Fiction',
  '/covers/split-fiction.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'gcxmrv6659',
  'VDfifwg71N',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 35: Silent Hill 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Silent Hill 2',
  '/covers/silent-hill-2.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-gray-600 to-red-800',
  'oconnerhill1',
  'Joao1423',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 36: Stalker 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Stalker 2',
  '/covers/stalker-2.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'minjackswirter1970',
  'wO7BVwBnJJ1997',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 37: Star Wars Outlaws
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Star Wars Outlaws',
  '/covers/star-wars-outlaws.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Ubisoft',
  'from-blue-600 to-purple-600',
  'starwarsoutlaw@gamingflix.space',
  'StarFlixo#2424',
  NULL,
  '["Baixe o Ubisoft Connect neste link: [https://ubi.li/4vxt9​;](https://ubi.li/4vxt9%E2%80%8B; \"‌\")","Adquira o jogo diretamente através de sua conta;","Inicie o Ubisoft Connect e insira as credenciais fornecidas junto com o código de verificação em dois passos que será enviado;","Após acessar a conta, navegue até \"configurações\" e DESMARQUE as opções \"ativar sincronização na nuvem\" e \"habilitar atualizações automáticas para os últimos jogos acessados\". Sim, desabilite essas duas funções;","Selecione o jogo e, abaixo da opção de \"download\", clique em \"localizar instalação\" e direcione para a pasta onde o jogo foi baixado via torrent;","Ao carregar os arquivos do jogo, clique em jogar e encerre o jogo assim que os menus principais forem exibidos. Se o jogo solicitar atualizações para instalação, proceda com a instalação. Isso é necessário pois o jogo não será iniciado sem as atualizações recentes;","Depois de iniciar o jogo, alcançar os menus principais e encerrá-lo, retorne ao Ubisoft Connect e selecione Opções de Internet;","No Ubisoft Connect, escolha a opção \"ficar off-line\";","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!","Por fim, para assegurar uma ativação mais estável, é possível abrir o Firewall App Blocker e bloquear os processos relacionados ao Ubisoft Connect para prevenir o acesso à internet, evitando assim, possíveis problemas futuros!"]'::jsonb
);

-- Game 38: Street Fighter 6
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Street Fighter 6',
  '/covers/street-fighter-6.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-red-600',
  'streetflix6',
  'StRe3tFXxv@6',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 39: WWE 2K25
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'WWE 2K25',
  '/covers/wwe-2k25.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'lclstoregamewwe2k25ggmax',
  'lcl@store@game@2025wwe2k25',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 40: Naruto Storm Connections
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Naruto Storm Connections',
  '/covers/naruto-storm-connections.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-orange-500 to-blue-600',
  'narutocolecaoclaigames',
  'CompradoEm4356:ggmax\_com\_br/perfil/ClaiGames',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 41: TEKKEN 8
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'TEKKEN 8',
  '/covers/tekken-8.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-purple-600 to-red-600',
  'Tekken8gflix',
  'T3Kken8@24',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 42: The Last of Us 1+2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'The Last of Us 1+2',
  '/covers/the-last-of-us-1-2.jpg',
  'Jogo disponivel em: Games Offline | Plataforma: Steam',
  'from-green-700 to-gray-800',
  'gftlou1',
  'G@meTh3l4st1',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 43: Call of Duty: Modern Warfare(2019)
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Call of Duty: Modern Warfare(2019)',
  '/covers/call-of-duty-modern-warfare-2019.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Battle.net',
  'from-orange-500 to-red-600',
  'codmw1@gamingflix.space',
  'Za123456@',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 44: Call of Duty Modern Warfare 3
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Call of Duty Modern Warfare 3',
  '/covers/call-of-duty-modern-warfare-3.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Steam',
  'from-orange-500 to-red-600',
  'vodkablackmw3',
  'MW3Flix@@',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Jogue e aproveite sempre em Modo Online, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 45: Call of Duty Black Ops 6
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Call of Duty Black Ops 6',
  '/covers/call-of-duty-black-ops-6.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Steam',
  'from-orange-500 to-red-600',
  'BlackOps6Flix1',
  'CODBO6flix@!',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Jogue e aproveite sempre em Modo Online, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 46: Helldivers 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Helldivers 2',
  '/covers/helldivers-2.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'helldiversflix',
  'HelldiV3rs2Gflix',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 47: Red Dead Redemption (Social Club)
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Red Dead Redemption (Social Club)',
  '/covers/red-dead-redemption-social-club.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Steam',
  'from-red-700 to-orange-600',
  'davereddead',
  'D@vi#2022',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 48: Suicide Squad: Kill the Justice League
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Suicide Squad: Kill the Justice League',
  '/covers/suicide-squad-kill-the-justice-league.jpg',
  'Jogo disponivel em: Games Online | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'suicidesquadgflix',
  'SqU@dSuic1DE24',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 49: Horizon Zero Dawn / Marvel Midnight Suns
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Horizon Zero Dawn / Marvel Midnight Suns',
  '/covers/horizon-zero-dawn-marvel-midnight-suns.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Steam',
  'from-blue-500 to-orange-600',
  'rodriquez214',
  'hor1z0nflix9',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 50: Tomb Raider Collection
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Tomb Raider Collection',
  '/covers/tomb-raider-collection.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Epic Games',
  'from-brown-600 to-gray-700',
  '**contato@gamingflix.space**',
  'GGFLIXtombraider1',
  NULL,
  '["Instalar a Epic Games e entrar com o Login e Senha direcionados;","Solicite o código Verificação de Duas Etapas ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Epic;","Clique no canto superior direito no ícone do Perfil e depois em ‘''Configurações’''; Após isso habilite a opção ‘''Navegação Offline’''.","Clique novamente no ícone do perfil e depois em Sair. Agora basta clicar em ‘''Entrar Depois’'' nas opções de Login.","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 51: Batman Arkham Collection
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Batman Arkham Collection',
  '/covers/batman-arkham-collection.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'viw90778',
  'xpy52228',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline, descumprir tal pode ocasionar na suspensão do seu acesso!"]'::jsonb
);

-- Game 52: Resident Evil 4 / 5 / 6
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Resident Evil 4 / 5 / 6',
  '/covers/resident-evil-4-5-6.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Steam',
  'from-red-600 to-black',
  'sqzul318',
  'marp446813U',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline!"]'::jsonb
);

-- Game 53: Red Dead 2 / Resident Evil Village
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Red Dead 2 / Resident Evil Village',
  '/covers/red-dead-2-resident-evil-village.jpg',
  'Red Dead 2 / Resident Evil Village - Disponivel para jogar na GameFlix.',
  'from-red-600 to-black',
  'Consultar suporte',
  'Consultar suporte',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 54: Mortal Kombat Bundle / Injustice 2
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Mortal Kombat Bundle / Injustice 2',
  '/covers/mortal-kombat-bundle-injustice-2.jpg',
  'Mortal Kombat Bundle / Injustice 2 - Disponivel para jogar na GameFlix.',
  'from-yellow-500 to-red-700',
  'Consultar suporte',
  'Consultar suporte',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);

-- Game 55: Spider-Man / Miles Morales
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Spider-Man / Miles Morales',
  '/covers/spider-man-miles-morales.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Steam',
  'from-red-600 to-blue-600',
  'spidermanflix',
  'Miranha@1993',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GGFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em Ficar Offline;","Jogue e aproveite sempre em Modo Offline!"]'::jsonb
);

-- Game 56: The Evil Within Collection
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'The Evil Within Collection',
  '/covers/the-evil-within-collection.jpg',
  'Jogo disponivel em: GamePacks | Plataforma: Steam',
  'from-blue-600 to-purple-600',
  'hqwb12933',
  '7wAEo93rZF',
  NULL,
  '["Instalar a Steam e entrar com o Login e Senha direcionados;","Solicite o código Steam Guard ao Suporte da GamingFlix;","Realize o Download do Jogo;","Clique em jogar, vá ao menu principal, feche o jogo e volte à Steam;","Desative o Steam Remote Play nas configurações para evitar conflitos de Login.","Clique no canto superior esquerdo em Steam e depois em ‘''Ficar Offline’'';","Jogue e aproveite sempre em Modo Offline!"]'::jsonb
);

-- Game 57: Horizon Zero Dawn / Marvel Midnight Suns
INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)
VALUES (
  'Horizon Zero Dawn / Marvel Midnight Suns',
  '/covers/horizon-zero-dawn-marvel-midnight-suns.jpg',
  'Horizon Zero Dawn / Marvel Midnight Suns - Disponivel para jogar na GameFlix.',
  'from-blue-500 to-orange-600',
  'Consultar suporte',
  'Consultar suporte',
  NULL,
  '["Acesse a plataforma com as credenciais fornecidas.","Baixe o jogo dentro da biblioteca.","Inicie o jogo e aproveite."]'::jsonb
);
