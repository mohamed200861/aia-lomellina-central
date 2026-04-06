
-- 1. Fix email_templates: restrict SELECT to admins only
DROP POLICY IF EXISTS "Email templates are readable" ON public.email_templates;
CREATE POLICY "Email templates readable by admins"
  ON public.email_templates FOR SELECT
  USING (is_admin(auth.uid()));

-- 2. Fix activity_log: bind INSERT user_id to auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.activity_log;
CREATE POLICY "Users can insert own logs"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Fix site_settings: replace public SELECT with admin-only
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;
CREATE POLICY "Admins can read all settings"
  ON public.site_settings FOR SELECT
  USING (is_admin(auth.uid()));

-- Create a public view excluding sensitive fields
CREATE OR REPLACE VIEW public.public_site_settings AS
  SELECT
    id, site_name, hero_title, hero_subtitle, next_course_date,
    address, phone1, phone2, whatsapp, email,
    facebook_url, instagram_url, x_url, youtube_url, telegram_url,
    logo_url, footer_text, updated_at
  FROM public.site_settings
  LIMIT 1;

-- Grant access to the view for anon and authenticated
GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- Create a security definer function to read public settings
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS SETOF public.public_site_settings
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.public_site_settings LIMIT 1;
$$;

-- 4. Fix report_settings: restrict to authenticated users
DROP POLICY IF EXISTS "Report settings readable by members" ON public.report_settings;
CREATE POLICY "Report settings readable by authenticated"
  ON public.report_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. Make documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'documents';
