
-- Drop function first (it depends on view type), then view
DROP FUNCTION IF EXISTS public.get_public_site_settings();
DROP VIEW IF EXISTS public.public_site_settings;

-- Recreate function without view dependency
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  id uuid,
  site_name text,
  hero_title text,
  hero_subtitle text,
  next_course_date text,
  address text,
  phone1 text,
  phone2 text,
  whatsapp text,
  email text,
  facebook_url text,
  instagram_url text,
  x_url text,
  youtube_url text,
  telegram_url text,
  logo_url text,
  footer_text text,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, site_name, hero_title, hero_subtitle, next_course_date,
    address, phone1, phone2, whatsapp, email,
    facebook_url, instagram_url, x_url, youtube_url, telegram_url,
    logo_url, footer_text, updated_at
  FROM public.site_settings
  LIMIT 1;
$$;
