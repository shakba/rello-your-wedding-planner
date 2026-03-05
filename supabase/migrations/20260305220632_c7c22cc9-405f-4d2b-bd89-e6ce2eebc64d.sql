
-- Drop all restrictive policies and recreate as permissive

-- guest_groups
DROP POLICY IF EXISTS "Admins can manage all groups" ON public.guest_groups;
DROP POLICY IF EXISTS "Couples can manage their groups" ON public.guest_groups;
CREATE POLICY "Admins can manage all groups" ON public.guest_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Couples can manage their groups" ON public.guest_groups FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = guest_groups.wedding_id AND user_id = auth.uid()));

-- guests
DROP POLICY IF EXISTS "Admins can manage all guests" ON public.guests;
DROP POLICY IF EXISTS "Couples can manage their guests" ON public.guests;
CREATE POLICY "Admins can manage all guests" ON public.guests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Couples can manage their guests" ON public.guests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = guests.wedding_id AND user_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- seating_tables
DROP POLICY IF EXISTS "Admins can manage all tables" ON public.seating_tables;
DROP POLICY IF EXISTS "Couples can manage their tables" ON public.seating_tables;
CREATE POLICY "Admins can manage all tables" ON public.seating_tables FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Couples can manage their tables" ON public.seating_tables FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = seating_tables.wedding_id AND user_id = auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- weddings
DROP POLICY IF EXISTS "Admins can manage all weddings" ON public.weddings;
DROP POLICY IF EXISTS "Couples can insert their own wedding" ON public.weddings;
DROP POLICY IF EXISTS "Couples can update their own wedding" ON public.weddings;
DROP POLICY IF EXISTS "Couples can view their own wedding" ON public.weddings;
DROP POLICY IF EXISTS "Public can view published weddings" ON public.weddings;
CREATE POLICY "Couples can view their own wedding" ON public.weddings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Couples can update their own wedding" ON public.weddings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Couples can insert their own wedding" ON public.weddings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all weddings" ON public.weddings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view published weddings" ON public.weddings FOR SELECT USING (website_published = true);
