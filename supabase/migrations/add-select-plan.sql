-- ========================================
-- PLANO SELECT - Acesso a jogos selecionados
-- Execute este arquivo no SQL Editor do Supabase
-- ========================================

-- ========================================
-- 1. CRIAR TABELA DE JOGOS DO PLANO SELECT
-- ========================================

-- Tabela para mapear quais jogos estão disponíveis no plano Select
CREATE TABLE IF NOT EXISTS public.select_plan_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(game_id)
);

-- ========================================
-- 2. HABILITAR ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.select_plan_games ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. CRIAR POLÍTICAS RLS
-- ========================================

-- Todos usuários autenticados podem ver quais jogos estão no plano Select
CREATE POLICY "Authenticated users can view select plan games"
  ON public.select_plan_games
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem adicionar jogos ao plano Select
CREATE POLICY "Admins can add games to select plan"
  ON public.select_plan_games
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem remover jogos do plano Select
CREATE POLICY "Admins can remove games from select plan"
  ON public.select_plan_games
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 4. CRIAR FUNÇÃO PARA VERIFICAR ACESSO A JOGOS
-- ========================================

-- Função para verificar se o usuário tem acesso a um jogo específico
CREATE OR REPLACE FUNCTION public.user_has_game_access(_user_id uuid, _game_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan_slug text;
BEGIN
  -- Pegar o plano do usuário
  SELECT sp.slug INTO user_plan_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = _user_id
    AND s.status = 'active'
    AND s.expires_at > now()
  LIMIT 1;
  
  -- Se não tem assinatura ativa, não tem acesso
  IF user_plan_slug IS NULL THEN
    RETURN false;
  END IF;
  
  -- Se for plano Ultimate, tem acesso a todos os jogos
  IF user_plan_slug = 'ultimate' THEN
    RETURN true;
  END IF;
  
  -- Se for plano Select, verificar se o jogo está na lista do plano
  IF user_plan_slug = 'select' THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.select_plan_games
      WHERE game_id = _game_id
    );
  END IF;
  
  -- Para outros planos (Basic, Gamer), verificar se o jogo foi selecionado pelo usuário
  RETURN EXISTS (
    SELECT 1
    FROM public.user_game_selections
    WHERE user_id = _user_id AND game_id = _game_id
  );
END;
$$;

-- Função para obter jogos disponíveis para o plano do usuário
CREATE OR REPLACE FUNCTION public.get_available_games(_user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  cover_url text,
  gradient text,
  description text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan_slug text;
BEGIN
  -- Pegar o plano do usuário
  SELECT sp.slug INTO user_plan_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = _user_id
    AND s.status = 'active'
    AND s.expires_at > now()
  LIMIT 1;
  
  -- Se for plano Ultimate, retornar todos os jogos
  IF user_plan_slug = 'ultimate' THEN
    RETURN QUERY
    SELECT g.id, g.title, g.cover_url, g.gradient, g.description, g.created_at
    FROM public.games g
    ORDER BY g.created_at DESC;
    RETURN;
  END IF;
  
  -- Se for plano Select, retornar apenas jogos selecionados para o plano
  IF user_plan_slug = 'select' THEN
    RETURN QUERY
    SELECT g.id, g.title, g.cover_url, g.gradient, g.description, g.created_at
    FROM public.games g
    INNER JOIN public.select_plan_games spg ON g.id = spg.game_id
    ORDER BY g.created_at DESC;
    RETURN;
  END IF;
  
  -- Para outros planos, retornar todos os jogos (o limite é controlado pela seleção do usuário)
  RETURN QUERY
  SELECT g.id, g.title, g.cover_url, g.gradient, g.description, g.created_at
  FROM public.games g
  ORDER BY g.created_at DESC;
END;
$$;

-- ========================================
-- 5. INSERIR PLANO SELECT
-- ========================================

INSERT INTO public.subscription_plans (name, slug, price, max_games, description, features)
VALUES (
  'Select',
  'select',
  49.90,
  999999,
  'Acesso aos jogos mais populares selecionados',
  '["Acesso aos jogos SELECIONADOS pela equipe", "Catálogo curado com os melhores títulos", "Troca ilimitada dentro do catálogo Select", "Garantia de 30 dias", "Suporte prioritário", "Acesso offline", "Novos jogos adicionados mensalmente"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_games = EXCLUDED.max_games,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ========================================
-- 6. CONCEDER PERMISSÕES
-- ========================================

GRANT EXECUTE ON FUNCTION public.user_has_game_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_games(uuid) TO authenticated;

-- ========================================
-- ✅ PLANO SELECT CRIADO COM SUCESSO!
-- ========================================
-- Agora você pode:
-- 1. Adicionar jogos ao plano Select via admin
-- 2. Usuários com plano Select verão apenas os jogos selecionados
-- 3. Usuários com plano Ultimate continuam vendo todos os jogos
-- ========================================