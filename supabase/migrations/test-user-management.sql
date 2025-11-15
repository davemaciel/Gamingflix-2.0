-- =====================================================
-- TESTE - Verificar se sistema de gestão está funcionando
-- =====================================================
-- Execute este SQL no Supabase para diagnosticar o problema
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_all_users_for_admin';

-- 2. Testar chamada da função
SELECT * FROM public.get_all_users_for_admin();

-- 3. Verificar permissões da função
SELECT 
    p.proname as function_name,
    pg_get_userbyid(p.proowner) as owner,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'get_all_users_for_admin';

-- 4. Verificar se seu usuário atual é admin
SELECT 
    id,
    email,
    is_admin
FROM public.profiles
WHERE id = auth.uid();

-- 5. Verificar quantos usuários existem
SELECT COUNT(*) as total_users FROM auth.users;

-- 6. Testar acesso direto aos dados
SELECT 
    u.id,
    u.email,
    p.is_admin,
    p.whatsapp
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LIMIT 5;