-- =====================================================
-- ADICIONAR USUÁRIO COMO ADMIN + FOUNDERS + ULTIMATE
-- =====================================================
-- ID: 33141ad9-7183-4d5c-a6c4-4c7cd9f1218d
-- =====================================================

-- 1. Criar/Atualizar profile como ADMIN + FOUNDER (com email da tabela auth.users)
INSERT INTO public.profiles (id, email, is_admin, is_founder)
SELECT 
    '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d',
    email,
    TRUE,
    TRUE
FROM auth.users
WHERE id = '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d'
ON CONFLICT (id) 
DO UPDATE SET 
    is_admin = TRUE,
    is_founder = TRUE;

-- 2. Desativar assinaturas antigas (se houver)
UPDATE public.subscriptions
SET status = 'inactive'
WHERE user_id = '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d'
  AND status = 'active';

-- 3. Buscar ID do plano Ultimate
DO $$
DECLARE
    v_ultimate_plan_id UUID;
BEGIN
    SELECT id INTO v_ultimate_plan_id
    FROM public.subscription_plans
    WHERE UPPER(name) = 'ULTIMATE'
    LIMIT 1;

    -- 4. Criar assinatura Ultimate com preço Founder (R$ 67,90)
    INSERT INTO public.subscriptions (
        user_id, 
        plan_id, 
        status, 
        founder_price,
        started_at,
        expires_at
    )
    VALUES (
        '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d',
        v_ultimate_plan_id,
        'active',
        67.90,
        NOW(),
        NOW() + INTERVAL '999 years' -- Vitalício
    );
END $$;

-- =====================================================
-- ✅ VERIFICAÇÃO - Execute para confirmar
-- =====================================================
SELECT 
    u.id,
    u.email,
    p.is_admin,
    p.is_founder,
    sp.name AS plano,
    s.status,
    s.founder_price,
    s.expires_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
WHERE u.id = '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d';