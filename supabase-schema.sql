-- ClickTales Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
-- This ensures users can only access their own data

-- Photos table
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_collage BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Album Photos junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.album_photos (
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (album_id, photo_id)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, photo_id)
);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Photos
CREATE POLICY "Users can view their own photos" ON public.photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON public.photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON public.photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.photos
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Albums
CREATE POLICY "Users can view their own albums" ON public.albums
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own albums" ON public.albums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums" ON public.albums
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums" ON public.albums
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Album Photos
CREATE POLICY "Users can view their own album photos" ON public.album_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.albums 
            WHERE albums.id = album_photos.album_id 
            AND albums.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own album photos" ON public.album_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.albums 
            WHERE albums.id = album_photos.album_id 
            AND albums.user_id = auth.uid()
        )
    );

-- RLS Policies for Favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON public.albums(user_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON public.album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_photo_id ON public.album_photos(photo_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_photos_updated_at 
    BEFORE UPDATE ON public.photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at 
    BEFORE UPDATE ON public.albums 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for photos (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage RLS policies
-- CREATE POLICY "Users can upload their own photos" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own photos" ON storage.objects
--     FOR SELECT USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own photos" ON storage.objects
--     FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);