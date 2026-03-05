
-- Allow anonymous users to search guests by name for RSVP on published weddings
CREATE POLICY "Public can search guests for RSVP"
ON public.guests
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = guests.wedding_id
    AND weddings.website_published = true
  )
);

-- Allow anonymous users to update RSVP status on published weddings
CREATE POLICY "Public can update RSVP on published weddings"
ON public.guests
FOR UPDATE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = guests.wedding_id
    AND weddings.website_published = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = guests.wedding_id
    AND weddings.website_published = true
  )
);

-- Create storage bucket for wedding gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-gallery', 'wedding-gallery', true);

-- Allow authenticated users to upload to their wedding folder
CREATE POLICY "Couples can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wedding-gallery'
);

-- Allow authenticated users to delete their gallery images
CREATE POLICY "Couples can delete gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'wedding-gallery'
);

-- Allow public read access to gallery images
CREATE POLICY "Public can view gallery images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'wedding-gallery'
);
