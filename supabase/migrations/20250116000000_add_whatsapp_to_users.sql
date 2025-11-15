-- Migration: Add WhatsApp field to user metadata for remarketing
-- Created: 2025-01-16
-- Description: Adds WhatsApp phone number to auth.users raw_user_meta_data for marketing purposes

-- Note: The WhatsApp is stored in auth.users.raw_user_meta_data as JSON
-- This is done automatically by Supabase Auth when we pass it in the signUp options.data
-- No table alterations needed, but we can create a helper view if needed

-- Create a view to easily access user WhatsApp numbers for remarketing
CREATE OR REPLACE VIEW public.user_contacts AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'whatsapp' as whatsapp,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
WHERE deleted_at IS NULL;

-- Grant access to authenticated users to see their own data
ALTER VIEW public.user_contacts SET (security_barrier = true);

-- Create RLS policy (if you want admins to access this view)
-- Uncomment the lines below if you want to enable RLS

-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view user contacts
CREATE POLICY "Admins can view all user contacts"
ON auth.users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Grant SELECT on the view to authenticated users (admins will use this for remarketing)
GRANT SELECT ON public.user_contacts TO authenticated;

-- Create an index on raw_user_meta_data for faster queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_whatsapp 
ON auth.users USING gin (raw_user_meta_data);

-- Comments for documentation
COMMENT ON VIEW public.user_contacts IS 'View to access user contact information including WhatsApp for remarketing purposes. Only accessible by admin users.';