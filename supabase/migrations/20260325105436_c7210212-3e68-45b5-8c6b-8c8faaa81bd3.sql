
-- Fix: activity log inserts should only be by authenticated users
DROP POLICY "System can insert logs" ON public.activity_log;
CREATE POLICY "Authenticated users can insert logs" ON public.activity_log 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
