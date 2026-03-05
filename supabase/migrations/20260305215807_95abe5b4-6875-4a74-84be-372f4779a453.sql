
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'couple');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Weddings table
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner1_name TEXT NOT NULL DEFAULT '',
  partner2_name TEXT NOT NULL DEFAULT '',
  wedding_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat DOUBLE PRECISION,
  venue_lng DOUBLE PRECISION,
  story TEXT,
  dress_code TEXT,
  faq JSONB DEFAULT '[]'::jsonb,
  website_slug TEXT UNIQUE,
  website_colors JSONB DEFAULT '{"primary": "#d4637b", "secondary": "#e8a87c", "accent": "#c5a44e"}'::jsonb,
  website_published BOOLEAN DEFAULT false,
  gallery_urls TEXT[] DEFAULT '{}',
  schedule JSONB DEFAULT '[]'::jsonb,
  registry_enabled BOOLEAN DEFAULT false,
  registry_items JSONB DEFAULT '[]'::jsonb,
  plan TEXT DEFAULT 'starter',
  max_guests INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can view their own wedding" ON public.weddings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Couples can update their own wedding" ON public.weddings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Couples can insert their own wedding" ON public.weddings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all weddings" ON public.weddings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view published weddings" ON public.weddings
  FOR SELECT USING (website_published = true);

-- Guest groups table
CREATE TABLE public.guest_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their groups" ON public.guest_groups
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = wedding_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all groups" ON public.guest_groups
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.guest_groups(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
  plus_ones INTEGER DEFAULT 0,
  meal_choice TEXT,
  allergies TEXT,
  needs_transport BOOLEAN DEFAULT false,
  notes TEXT,
  table_number INTEGER,
  invitation_sent BOOLEAN DEFAULT false,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  rsvp_answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their guests" ON public.guests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = wedding_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all guests" ON public.guests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tables (seating) table
CREATE TABLE public.seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  table_name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their tables" ON public.seating_tables
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = wedding_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all tables" ON public.seating_tables
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON public.weddings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
