-- Supabase Setup Script
-- Execute this in your Supabase SQL Editor after running the main schema

-- 1. Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for photos bucket
-- Allow authenticated users to upload photos to their own folder
CREATE POLICY "Users can upload photos to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view photos in their own folder
CREATE POLICY "Users can view photos in their own folder" ON storage.objects
FOR SELECT USING (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete photos from their own folder
CREATE POLICY "Users can delete photos from their own folder" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow public read access to photos (for sharing)
CREATE POLICY "Allow public read access to photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Note: After running this, you may need to manually enable RLS on storage.objects table
-- if it's not already enabled in your Supabase project.