
-- Social feed posts managed from admin
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'facebook',
  image_url TEXT,
  caption TEXT,
  post_date DATE,
  external_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social posts are public" ON public.social_posts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage social posts" ON public.social_posts
  FOR ALL USING (is_admin(auth.uid()));

-- Add thumbnail and description to press_review
ALTER TABLE public.press_review ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.press_review ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
