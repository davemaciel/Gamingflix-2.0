-- Update cover URLs to point to public folder so unauthenticated users can load images
UPDATE public.games SET cover_url = '/covers/ac-mirage.jpg' WHERE title = 'Assassin''s Creed Mirage';
UPDATE public.games SET cover_url = '/covers/cyberpunk.jpg' WHERE title = 'Cyberpunk 2077';
UPDATE public.games SET cover_url = '/covers/elden-ring.jpg' WHERE title = 'Elden Ring';
UPDATE public.games SET cover_url = '/covers/gta5.jpg' WHERE title = 'GTA V';
UPDATE public.games SET cover_url = '/covers/rdr2.jpg' WHERE title = 'Red Dead Redemption 2';
UPDATE public.games SET cover_url = '/covers/spiderman.jpg' WHERE title = 'Spider-Man';