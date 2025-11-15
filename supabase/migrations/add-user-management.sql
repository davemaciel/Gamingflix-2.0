-- =====================================================
-- GESTÃO DE CLIENTES - Sistema Completo
-- =====================================================
-- Permite ao admin gerenciar usuários individualmente:
-- - Selecionar jogos específicos por usuário
-- - Alterar planos
-- - Tornar admin
-- - Editar informações
-- =====================================================

-- 1. Criar tabela para jogos customizados por usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_custom_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id), -- Admin que adicionou
    notes TEXT, -- Notas opcionais sobre por que esse jogo foi dado
    UNIQUE(user_id, game_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_custom_games_user ON public.user_custom_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_games_game ON public.user_custom_games(game_id);

-- 2. Adicionar campo whatsapp na tabela profiles (caso não exista)
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 3. Função para verificar se usuário tem acesso a um jogo
-- =====================================================
-- Atualizar ou criar função que verifica TODAS as formas de acesso
-- Dropar função existente se houver (para permitir mudança de parâmetros)
DROP FUNCTION IF EXISTS public.user_has_game_access(UUID, UUID);

CREATE OR REPLACE FUNCTION public.user_has_game_access(
    p_user_id UUID,
    p_game_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_id UUID;
    v_plan_name TEXT;
    v_max_games INTEGER;
    v_selected_count INTEGER;
BEGIN
    -- 1. Verificar se usuário tem acesso customizado (admin deu acesso direto)
    IF EXISTS (
        SELECT 1 FROM public.user_custom_games 
        WHERE user_id = p_user_id AND game_id = p_game_id
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Buscar assinatura ativa do usuário
    SELECT s.id, sp.name, sp.max_games
    INTO v_subscription_id, v_plan_name, v_max_games
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Se não tem assinatura ativa, não tem acesso
    IF v_subscription_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 3. PLANO ULTIMATE - Acesso a TODOS os jogos
    IF UPPER(v_plan_name) = 'ULTIMATE' THEN
        RETURN TRUE;
    END IF;

    -- 4. PLANO SELECT - Acesso aos jogos selecionados pelo admin
    IF UPPER(v_plan_name) = 'SELECT' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.select_plan_games 
            WHERE game_id = p_game_id
        );
    END IF;

    -- 5. OUTROS PLANOS (Basic, Gamer) - Verifica seleções do usuário
    -- Primeiro verifica se o jogo está na lista de seleções
    IF NOT EXISTS (
        SELECT 1 FROM public.user_game_selections
        WHERE user_id = p_user_id AND game_id = p_game_id
    ) THEN
        RETURN FALSE;
    END IF;

    -- Verifica se não excedeu o limite
    SELECT COUNT(*)
    INTO v_selected_count
    FROM public.user_game_selections
    WHERE user_id = p_user_id;

    RETURN v_selected_count <= v_max_games;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para obter jogos disponíveis do usuário
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_available_games(UUID);

CREATE OR REPLACE FUNCTION public.get_user_available_games(p_user_id UUID)
RETURNS TABLE (
    game_id UUID,
    access_type TEXT -- 'custom', 'ultimate', 'select', 'selection'
) AS $$
DECLARE
    v_subscription_id UUID;
    v_plan_name TEXT;
BEGIN
    -- Buscar plano do usuário
    SELECT s.id, sp.name
    INTO v_subscription_id, v_plan_name
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Retornar jogos customizados (sempre tem prioridade)
    RETURN QUERY
    SELECT ucg.game_id, 'custom'::TEXT
    FROM public.user_custom_games ucg
    WHERE ucg.user_id = p_user_id;

    -- Se é ULTIMATE, retornar todos os jogos
    IF UPPER(v_plan_name) = 'ULTIMATE' THEN
        RETURN QUERY
        SELECT g.id, 'ultimate'::TEXT
        FROM public.games g
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_custom_games 
            WHERE user_id = p_user_id AND game_id = g.id
        );
        RETURN;
    END IF;

    -- Se é SELECT, retornar jogos do plano select
    IF UPPER(v_plan_name) = 'SELECT' THEN
        RETURN QUERY
        SELECT spg.game_id, 'select'::TEXT
        FROM public.select_plan_games spg
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_custom_games 
            WHERE user_id = p_user_id AND game_id = spg.game_id
        );
        RETURN;
    END IF;

    -- Outros planos: retornar seleções do usuário
    RETURN QUERY
    SELECT ugs.game_id, 'selection'::TEXT
    FROM public.user_game_selections ugs
    WHERE ugs.user_id = p_user_id
    AND NOT EXISTS (
        SELECT 1 FROM public.user_custom_games 
        WHERE user_id = p_user_id AND game_id = ugs.game_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para listar todos os usuários (para admin)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_all_users_for_admin();

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    whatsapp TEXT,
    is_admin BOOLEAN,
    plan_name TEXT,
    plan_id UUID,
    subscription_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    custom_games_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        p.whatsapp,
        COALESCE(p.is_admin, FALSE),
        sp.name,
        sp.id,
        s.status,
        u.created_at,
        (SELECT COUNT(*) FROM public.user_custom_games WHERE user_id = u.id)
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN LATERAL (
        SELECT s.plan_id, s.status
        FROM public.subscriptions s
        WHERE s.user_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 1
    ) s ON TRUE
    LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para obter jogos customizados de um usuário
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_custom_games(UUID);

CREATE OR REPLACE FUNCTION public.get_user_custom_games(p_user_id UUID)
RETURNS TABLE (
    game_id UUID,
    game_title TEXT,
    added_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ucg.game_id,
        g.title,
        ucg.added_at,
        ucg.notes
    FROM public.user_custom_games ucg
    JOIN public.games g ON ucg.game_id = g.id
    WHERE ucg.user_id = p_user_id
    ORDER BY ucg.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.user_custom_games ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios jogos customizados
CREATE POLICY "users_view_own_custom_games" ON public.user_custom_games
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins podem ver todos os jogos customizados
CREATE POLICY "admins_view_all_custom_games" ON public.user_custom_games
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins podem inserir jogos customizados
CREATE POLICY "admins_insert_custom_games" ON public.user_custom_games
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins podem deletar jogos customizados
CREATE POLICY "admins_delete_custom_games" ON public.user_custom_games
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Permitir admins atualizar profiles (para whatsapp, is_admin, etc)
DROP POLICY IF EXISTS "admins_update_profiles" ON public.profiles;
CREATE POLICY "admins_update_profiles" ON public.profiles
    FOR UPDATE
    USING (
        auth.uid() = id OR -- Próprio perfil
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Permitir admins criar/atualizar assinaturas
DROP POLICY IF EXISTS "admins_manage_subscriptions" ON public.subscriptions;
CREATE POLICY "admins_manage_subscriptions" ON public.subscriptions
    FOR ALL
    USING (
        auth.uid() = user_id OR -- Própria assinatura
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 8. Grants de permissão
-- =====================================================
GRANT SELECT, INSERT, DELETE ON public.user_custom_games TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_game_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_available_games TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_custom_games TO authenticated;

-- =====================================================
-- SUCESSO! Sistema de gestão de clientes instalado
-- =====================================================
-- Agora o admin pode:
-- ✅ Ver lista de todos os usuários
-- ✅ Editar WhatsApp de cada usuário
-- ✅ Alterar plano de assinatura
-- ✅ Tornar usuário admin
-- ✅ Dar acesso customizado a jogos específicos
-- ✅ Tudo pela interface, sem precisar usar SQL
-- =====================================================