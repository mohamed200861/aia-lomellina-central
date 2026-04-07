
-- Create homepage_counters table
CREATE TABLE public.homepage_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value integer NOT NULL DEFAULT 0,
  suffix text DEFAULT '+',
  label text NOT NULL,
  icon_name text DEFAULT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  auto_sync_table text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_counters ENABLE ROW LEVEL SECURITY;

-- Public can read active counters
CREATE POLICY "Active counters are public"
  ON public.homepage_counters
  FOR SELECT
  USING (true);

-- Admins can manage counters
CREATE POLICY "Admins can manage counters"
  ON public.homepage_counters
  FOR ALL
  USING (is_admin(auth.uid()));

-- Timestamp trigger
CREATE TRIGGER update_homepage_counters_updated_at
  BEFORE UPDATE ON public.homepage_counters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_counters;

-- Seed default counters
INSERT INTO public.homepage_counters (value, suffix, label, icon_name, sort_order, auto_sync_table) VALUES
  (82, '+', 'Associati / Arbitri Attivi', 'Users', 1, NULL),
  (77, '+', 'Anni di Tradizione Arbitrale', 'Award', 2, NULL),
  (1600, '+', 'Gare Arbitrate / Anno', 'Calendar', 3, NULL),
  (15, '+', 'Nuovi Arbitri / Anno', 'TrendingUp', 4, NULL);
