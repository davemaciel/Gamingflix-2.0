-- =====================================================
-- CRIAR ADMIN: PLANO ULTIMATE + TAG FOUNDERS + ADMIN
-- =====================================================
-- Use este SQL para criar um administrador com:
-- ✅ Plano ULTIMATE
-- ✅ Tag Founders (preço especial vitalício R$ 67,90)
-- ✅ Privilégios de ADMIN (acesso total ao sistema)
-- =====================================================

DO $$
DECLARE
    v_user_id UUID := 'COLE_O_UUID_DO_USUARIO_AQUI'; -- ⚠️ TROCAR ESTE UUID
    v_whatsapp TEXT := '5511999999999'; -- ⚠️ TROCAR O WHATSAPP
    v_ultimate_plan_id UUID;
    v_user_email TEXT;
BEGIN
    -- Buscar email do usuário na tabela auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado com UUID: %', v_user_id;
    END IF;

    -- Buscar ID do plano ULTIMATE
    SELECT id INTO v_ultimate_plan_id
    FROM public.subscription_plans
    WHERE UPPER(name) = 'ULTIMATE'
    LIMIT 1;

    IF v_ultimate_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plano ULTIMATE não encontrado';
    END IF;

    -- 1. Marcar usuário como Founder E Admin no perfil
    INSERT INTO public.profiles (id, email, is_founder, whatsapp, is_admin)
    VALUES (v_user_id, v_user_email, TRUE, v_whatsapp, TRUE)
    ON CONFLICT (id) 
    DO UPDATE SET 
        is_founder = TRUE,
        whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp),
        is_admin = TRUE;

    -- 2. Desativar assinaturas antigas
    UPDATE public.subscriptions
    SET status = 'inactive'
    WHERE user_id = v_user_id;

    -- 3. Criar nova assinatura ULTIMATE com preço Founder
    INSERT INTO public.subscriptions (user_id, plan_id, status, founder_price)
    VALUES (v_user_id, v_ultimate_plan_id, 'active', 67.90);

    -- 4. Adicionar role de ADMIN (tabela user_roles - ESSENCIAL!)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE '✅ Admin criado: Plano ULTIMATE + Tag Founders (R$ 67,90) + Acesso Admin';
END $$;

-- =====================================================
-- COMO USAR:
-- =====================================================
-- 1. Substitua 'COLE_O_UUID_DO_USUARIO_AQUI' pelo UUID real
-- 2. Substitua '5511999999999' pelo WhatsApp do admin
-- 3. Execute no Supabase SQL Editor
-- =====================================================

-- EXEMPLO PREENCHIDO:
-- v_user_id UUID := '33141ad9-7183-4d5c-a6c4-4c7cd9f1218d';
-- v_whatsapp TEXT := '5511987654321';