-- Remove política pública atual
DROP POLICY IF EXISTS "Everyone can view games" ON public.games;

-- Cria política apenas para usuários autenticados verem todos os detalhes
CREATE POLICY "Authenticated users can view all game details" 
ON public.games 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Cria view pública com apenas campos seguros (sem credenciais)
CREATE OR REPLACE VIEW public.public_games AS
SELECT 
  id, 
  title, 
  cover_url, 
  gradient,
  description,
  created_at
FROM public.games;

-- Permite acesso anônimo à view pública
GRANT SELECT ON public.public_games TO anon;
GRANT SELECT ON public.public_games TO authenticated;