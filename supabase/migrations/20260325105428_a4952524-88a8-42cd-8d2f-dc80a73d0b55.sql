
-- =============================================
-- AIA LOMELLINA COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. ROLES ENUM AND USER ROLES TABLE
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'editor')
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  -- Default role: member
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SITE SETTINGS (singleton for global contacts etc.)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT DEFAULT 'Via Don A. Ceriotti 19, 27029 Vigevano (PV), Italy',
  phone1 TEXT DEFAULT '+39 0381 327014',
  phone2 TEXT DEFAULT '+39 373 7832227',
  email TEXT DEFAULT 'lomellina@aia-figc.it',
  whatsapp TEXT DEFAULT '+39 373 7832227',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/sezioneaialomellina',
  x_url TEXT DEFAULT 'https://x.com/aialomellina',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/aialomellina/',
  youtube_url TEXT DEFAULT 'https://www.youtube.com/AiaLomellina',
  telegram_url TEXT DEFAULT 'https://t.me/aialomellina',
  next_course_date TEXT DEFAULT 'Settembre 2026',
  hero_title TEXT DEFAULT 'Il Calcio ha bisogno di te. Diventa Arbitro.',
  hero_subtitle TEXT DEFAULT 'Entra a far parte della famiglia arbitrale.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.site_settings DEFAULT VALUES;

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. STAFF MEMBERS
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'board', -- board, collaborator, audit
  photo_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read staff" ON public.staff_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage staff" ON public.staff_members FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert real staff data
INSERT INTO public.staff_members (full_name, role, category, sort_order) VALUES
('Marco BEDIN', 'Presidente – OTS – Resp. Calcio a 5', 'board', 1),
('Oreste BOTTAZZO', 'Vice Presidente – Responsabile OA', 'board', 2),
('Oscar Luigi D''ADDIEGO', 'Segretario', 'board', 3),
('Luca IUORIO', 'Tesoriere', 'board', 4),
('Simone Pietro DEGRA''', 'Resp. Progetto Mini Talent', 'board', 5),
('Giulio INCARBONE', 'Resp. Corso Arbitri', 'board', 6),
('Alberto COLLI FRANZONE', 'Segreteria Tecnica', 'board', 7),
('Nicholas LINO', 'Referente Atletico', 'board', 8),
('Matteo NASTA', 'Responsabile Social Media', 'board', 9),
('Luca CORDANI', 'Referente Calcio a 5', 'collaborator', 10),
('Hevan YOUSSEF', 'Ref. Forniture & Logistica / Segreteria Corso Arbitri', 'collaborator', 11),
('Filippo Thomas RAGG', 'Ref. Area Accoglienza e Ristoro', 'collaborator', 12),
('Edoardo LEONE', 'Ref. Area Accoglienza e Ristoro', 'collaborator', 13),
('Filippo BRANCHINI', 'Coll. Progetto Mini Talent', 'collaborator', 14),
('Federica DE PAOLI', 'Referente Area Medica', 'collaborator', 15),
('Simone Emanuele DORONZO', 'Resp. Attività Ricreativa', 'collaborator', 16),
('Federico ODIERNA', 'Referente RTO', 'collaborator', 17),
('Giulio Nicolas NECHIFOR', 'Componente unico', 'audit', 18);

-- 6. NEWS
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT DEFAULT 'Generale',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news is public" ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can read all news" ON public.news FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  is_published BOOLEAN DEFAULT false,
  registration_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published events are public" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can read all events" ON public.events FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. MEDIA
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  file_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image', -- image, video, youtube
  gallery TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media is public" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON public.media FOR ALL USING (public.is_admin(auth.uid()));

-- 9. COURSE REGISTRATIONS
CREATE TABLE public.course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, approved, archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit registration" ON public.course_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage registrations" ON public.course_registrations FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.course_registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. CONTACT SUBMISSIONS
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, read, replied, archived
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contacts" ON public.contact_submissions FOR ALL USING (public.is_admin(auth.uid()));

-- 11. RTO DATES
CREATE TABLE public.rto_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  rto_date DATE NOT NULL,
  rto_time TEXT,
  location TEXT,
  notice_url TEXT,
  notes TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rto_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published RTO is public for members" ON public.rto_dates FOR SELECT USING (true);
CREATE POLICY "Admins can manage RTO" ON public.rto_dates FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_rto_updated_at BEFORE UPDATE ON public.rto_dates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. ABSENCE JUSTIFICATIONS
CREATE TABLE public.absence_justifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  rto_date_id UUID REFERENCES public.rto_dates(id),
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.absence_justifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit justifications" ON public.absence_justifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own justifications" ON public.absence_justifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage justifications" ON public.absence_justifications FOR ALL USING (public.is_admin(auth.uid()));

-- 13. REIMBURSEMENT TABLES
CREATE TABLE public.reimbursement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- e.g., 'Calcio 11', 'Calcio a 5'
  role TEXT NOT NULL, -- e.g., 'Arbitro', 'Assistente'
  distance_bracket TEXT NOT NULL, -- e.g., '0-30 km', '31-60 km'
  amount DECIMAL(10,2) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reimbursement_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reimbursements readable by members" ON public.reimbursement_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage reimbursements" ON public.reimbursement_rules FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON public.reimbursement_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. REPORT SETTINGS
CREATE TABLE public.report_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  instructions TEXT,
  destination_email TEXT,
  deadline TEXT,
  template_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.report_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Report settings readable by members" ON public.report_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage report settings" ON public.report_settings FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.report_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. MEDICAL CENTERS
CREATE TABLE public.medical_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  instructions TEXT,
  required_docs TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medical centers readable" ON public.medical_centers FOR SELECT USING (true);
CREATE POLICY "Admins can manage medical centers" ON public.medical_centers FOR ALL USING (public.is_admin(auth.uid()));

-- 16. ATHLETIC CONTENT
CREATE TABLE public.athletic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general', -- yo-yo, sds, training, plans
  file_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.athletic_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletic content readable by members" ON public.athletic_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage athletic content" ON public.athletic_content FOR ALL USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_athletic_updated_at BEFORE UPDATE ON public.athletic_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. INTERNAL COMMUNICATIONS (for members area notices)
CREATE TABLE public.internal_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read communications" ON public.internal_communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage communications" ON public.internal_communications FOR ALL USING (public.is_admin(auth.uid()));

-- 18. DOCUMENTS (downloadable files for members)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents readable by members" ON public.documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.is_admin(auth.uid()));

-- 19. ACTIVITY LOG (admin audit)
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view activity log" ON public.activity_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert logs" ON public.activity_log FOR INSERT WITH CHECK (true);

-- 20. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Media publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_admin(auth.uid()));

CREATE POLICY "Documents publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Avatars publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
