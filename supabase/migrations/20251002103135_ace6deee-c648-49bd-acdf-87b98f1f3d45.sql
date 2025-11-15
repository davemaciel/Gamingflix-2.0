-- Remove a view (não funciona bem com RLS)
DROP VIEW IF EXISTS public.public_games;

-- Cria função RPC para retornar apenas campos públicos dos jogos
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

-- Permite acesso anônimo e autenticado à função
GRANT EXECUTE ON FUNCTION public.get_public_games() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_games() TO authenticated;