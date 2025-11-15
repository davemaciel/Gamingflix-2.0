-- =====================================================
-- TORNAR USUÁRIO ATUAL ADMIN
-- =====================================================
-- Execute este SQL para tornar seu usuário atual admin
-- =====================================================

-- Ver seu usuário atual
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE id = auth.uid();

-- Tornar admin (cria profile se não existir)
INSERT INTO public.profiles (id, is_admin)
VALUES (auth.uid(), TRUE)
ON CONFLICT (id) 
DO UPDATE SET is_admin = TRUE;

-- Verificar se funcionou
SELECT 
    id,
    email,
    is_admin
FROM public.profiles
WHERE id = auth.uid();