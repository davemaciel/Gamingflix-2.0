-- =====================================================
-- CRIAR CLIENTE: PLANO SELECT + TAG FOUNDERS
-- =====================================================
-- Use este SQL para criar um cliente comum com:
-- ✅ Plano SELECT
-- ✅ Tag Founders (preço especial vitalício R$ 67,90)
-- ❌ SEM privilégios de admin
-- =====================================================

DO $$
DECLARE
    v_user_id UUID := 'COLE_O_UUID_DO_USUARIO_AQUI'; -- ⚠️ TROCAR ESTE UUID
    v_whatsapp TEXT := '5511999999999'; -- ⚠️ TROCAR O WHATSAPP
    v_select_plan_id UUID;
    v_user_email TEXT;
BEGIN
    -- Buscar email do usuário na tabela auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado com UUID: %', v_user_id;
    END IF;

    -- Buscar ID do plano SELECT
    SELECT id INTO v_select_plan_id
    FROM public.subscription_plans
    WHERE UPPER(name) = 'SELECT'
    LIMIT 1;

    IF v_select_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plano SELECT não encontrado';
    END IF;

    -- 1. Marcar usuário como Founder no perfil
    INSERT INTO public.profiles (id, email, is_founder, whatsapp, is_admin)
    VALUES (v_user_id, v_user_email, TRUE, v_whatsapp, FALSE)
    ON CONFLICT (id) 
    DO UPDATE SET 
        is_founder = TRUE,
        whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp),
        is_admin = FALSE;

    -- 2. Desativar assinaturas antigas
    UPDATE public.subscriptions
    SET status = 'inactive'
    WHERE user_id = v_user_id;

    -- 3. Criar nova assinatura SELECT com preço Founder
    INSERT INTO public.subscriptions (user_id, plan_id, status, founder_price)
    VALUES (v_user_id, v_select_plan_id, 'active', 67.90);

    -- 4. Garantir que NÃO é admin (remover se existir)
    DELETE FROM public.user_roles 
    WHERE user_id = v_user_id AND role = 'admin';

    RAISE NOTICE '✅ Cliente criado: Plano SELECT + Tag Founders (R$ 67,90)';
END $$;

-- =====================================================
-- COMO USAR:
-- =====================================================
-- 1. Substitua 'COLE_O_UUID_DO_USUARIO_AQUI' pelo UUID real
-- 2. Substitua '5511999999999' pelo WhatsApp do cliente
-- 3. Execute no Supabase SQL Editor
-- =====================================================