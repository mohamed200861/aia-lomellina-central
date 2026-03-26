
-- Referees table
CREATE TABLE public.referees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name text NOT NULL,
  first_name text NOT NULL,
  qualification text NOT NULL DEFAULT 'AE',
  technical_body text NOT NULL DEFAULT 'OTS',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referees are public" ON public.referees FOR SELECT USING (true);
CREATE POLICY "Admins can manage referees" ON public.referees FOR ALL USING (is_admin(auth.uid()));

-- Press review articles table
CREATE TABLE public.press_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_date date NOT NULL,
  year integer NOT NULL,
  newspaper text NOT NULL,
  page text,
  external_url text,
  file_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.press_review ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Press review is public" ON public.press_review FOR SELECT USING (true);
CREATE POLICY "Admins can manage press review" ON public.press_review FOR ALL USING (is_admin(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_referees_updated_at BEFORE UPDATE ON public.referees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
