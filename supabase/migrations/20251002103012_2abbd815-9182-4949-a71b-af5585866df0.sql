-- Recria a view com SECURITY INVOKER para respeitar RLS do usuário
CREATE OR REPLACE VIEW public.public_games 
WITH (security_invoker=on) AS
SELECT 
  id, 
  title, 
  cover_url, 
  gradient,
  description,
  created_at
FROM public.games;