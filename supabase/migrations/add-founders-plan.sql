-- =====================================================
-- PLANO ULTIMATE FOUNDERS - Preço Vitalício R$ 67,90
-- =====================================================
-- Tag especial para primeiros clientes com preço especial para sempre
-- =====================================================

-- 1. Adicionar campo is_founder na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campo founder_price na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS founder_price NUMERIC(10,2) DEFAULT NULL;

-- Comentar a coluna para documentação
COMMENT ON COLUMN public.profiles.is_founder IS 'Indica se o usuário é um Founder (paga R$ 67,90 para sempre)';
COMMENT ON COLUMN public.subscriptions.founder_price IS 'Preço especial do Founder, se aplicável (ex: 67.90)';

-- 3. Atualizar plano Ultimate para deixar claro que é o único foco
UPDATE public.subscription_plans 
SET 
  description = 'FOUNDERS - Acesso ILIMITADO a todos os jogos + Preço vitalício de R$ 67,90',
  is_active = TRUE
WHERE UPPER(name) = 'ULTIMATE';

-- 4. Desativar outros planos (manter no banco mas não mostrar)
UPDATE public.subscription_plans 
SET is_active = FALSE
WHERE UPPER(name) IN ('BASIC', 'GAMER', 'SELECT');

-- 5. Função para criar assinatura Founder
CREATE OR REPLACE FUNCTION public.create_founder_subscription(
    p_user_id UUID,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_ultimate_plan_id UUID;
BEGIN
    -- Buscar ID do plano Ultimate
    SELECT id INTO v_ultimate_plan_id
    FROM public.subscription_plans
    WHERE UPPER(name) = 'ULTIMATE'
    LIMIT 1;

    IF v_ultimate_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plano Ultimate não encontrado';
    END IF;

    -- Marcar usuário como Founder
    INSERT INTO public.profiles (id, is_founder, whatsapp)
    VALUES (p_user_id, TRUE, p_whatsapp)
    ON CONFLICT (id) 
    DO UPDATE SET 
        is_founder = TRUE,
        whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp);

    -- Desativar assinaturas antigas
    UPDATE public.subscriptions
    SET status = 'inactive'
    WHERE user_id = p_user_id;

    -- Criar nova assinatura Founder com preço especial
    INSERT INTO public.subscriptions (user_id, plan_id, status, founder_price)
    VALUES (p_user_id, v_ultimate_plan_id, 'active', 67.90);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para verificar se usuário é Founder
CREATE OR REPLACE FUNCTION public.is_founder_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id AND is_founder = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Atualizar função get_all_users_for_admin para incluir info de Founder
DROP FUNCTION IF EXISTS public.get_all_users_for_admin();

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    whatsapp TEXT,
    is_admin BOOLEAN,
    is_founder BOOLEAN,
    founder_price NUMERIC,
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
        COALESCE(p.is_founder, FALSE),
        s.founder_price,
        sp.name,
        sp.id,
        s.status,
        u.created_at,
        (SELECT COUNT(*) FROM public.user_custom_games WHERE user_id = u.id)
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    LEFT JOIN LATERAL (
        SELECT s.plan_id, s.status, s.founder_price
        FROM public.subscriptions s
        WHERE s.user_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 1
    ) s ON TRUE
    LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_founder ON public.profiles(is_founder) WHERE is_founder = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscriptions_founder_price ON public.subscriptions(founder_price) WHERE founder_price IS NOT NULL;

-- 9. Grants de permissão
GRANT EXECUTE ON FUNCTION public.create_founder_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_founder_user TO authenticated;

-- =====================================================
-- SUCESSO! Sistema Founders instalado
-- =====================================================
-- Agora você pode:
-- ✅ Marcar usuários como Founders (tag especial)
-- ✅ Definir preço vitalício de R$ 67,90
-- ✅ Focar apenas no plano Ultimate
-- ✅ Gerenciar via WhatsApp antes de ter checkout
-- =====================================================

-- EXEMPLO DE USO:
-- Para criar um Founder manualmente via SQL:
-- SELECT public.create_founder_subscription(
--     'USER_UUID_AQUI'::UUID,
--     '5511999999999'
-- );