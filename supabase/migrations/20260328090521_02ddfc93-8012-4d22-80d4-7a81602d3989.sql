ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS site_name text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS footer_text text,
ADD COLUMN IF NOT EXISTS notification_email_primary text,
ADD COLUMN IF NOT EXISTS notification_email_secondary text,
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS sender_email text,
ADD COLUMN IF NOT EXISTS email_confirm_course boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_confirm_contact boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_confirm_absence boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_confirm_welcome boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL,
  heading text,
  body text NOT NULL,
  cta_label text,
  footer_note text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_templates' AND policyname = 'Email templates are readable'
  ) THEN
    CREATE POLICY "Email templates are readable"
    ON public.email_templates
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_templates' AND policyname = 'Super admins can manage email templates'
  ) THEN
    CREATE POLICY "Super admins can manage email templates"
    ON public.email_templates
    FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can insert their own member role'
  ) THEN
    CREATE POLICY "Users can insert their own member role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role = 'member');
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();