-- Add white-label columns to schools table
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "primary": "#0066cc",
  "secondary": "#0066cc",
  "accent": "#0066cc",
  "background": "#f5f5f5",
  "foreground": "#1a1a1a",
  "primaryFont": "Inter",
  "headingFont": "Inter",
  "borderRadius": "0.5"
}'::jsonb,
ADD COLUMN IF NOT EXISTS homepage_config JSONB DEFAULT '{
  "title": "Welcome to School",
  "description": "Leading education institution",
  "showHero": true,
  "showNotices": true,
  "showEvents": true,
  "showTeachers": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS is_website_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS website_domain TEXT UNIQUE;

-- Create pages table for CMS
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(school_id, slug)
);

-- Create events table for public website
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_published BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create teachers_public table (teachers visible on public website)
CREATE TABLE IF NOT EXISTS public.teachers_public (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualification TEXT,
  experience_years INTEGER,
  bio TEXT,
  subject TEXT,
  photo_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(school_id, profile_id)
);

-- Enable RLS on new tables
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers_public ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "Admin users can manage pages"
  ON public.pages FOR ALL
  USING (school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
  ));

CREATE POLICY "Public can view published pages"
  ON public.pages FOR SELECT
  USING (is_published = true);

-- RLS Policies for events
CREATE POLICY "Admin users can manage events"
  ON public.events FOR ALL
  USING (school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
  ));

CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (is_published = true);

-- RLS Policies for teachers_public
CREATE POLICY "Admin users can manage public teachers"
  ON public.teachers_public FOR ALL
  USING (school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
  ));

CREATE POLICY "Public can view visible teachers"
  ON public.teachers_public FOR SELECT
  USING (is_visible = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_school_slug ON public.pages(school_id, slug);
CREATE INDEX IF NOT EXISTS idx_events_school_date ON public.events(school_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_teachers_public_school ON public.teachers_public(school_id);
