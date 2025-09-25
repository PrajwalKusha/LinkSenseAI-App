-- LinkSense AI Database Update
-- Run this SQL in your Supabase SQL Editor to fix missing columns

-- First, check if the table exists and add missing columns
DO $$
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shortened_urls' AND column_name = 'title'
    ) THEN
        ALTER TABLE shortened_urls ADD COLUMN title TEXT;
    END IF;
    
    -- Add click_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shortened_urls' AND column_name = 'click_count'
    ) THEN
        ALTER TABLE shortened_urls ADD COLUMN click_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shortened_urls' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE shortened_urls ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_shortened_urls_original_url ON shortened_urls(original_url);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_created_at ON shortened_urls(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shortened_urls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow public read access" ON shortened_urls;
DROP POLICY IF EXISTS "Allow public insert" ON shortened_urls;

-- Create policies
CREATE POLICY "Allow public read access" ON shortened_urls
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON shortened_urls
    FOR INSERT WITH CHECK (true);

-- Create or replace the click count function
CREATE OR REPLACE FUNCTION increment_click_count(short_code VARCHAR(6))
RETURNS void AS $$
BEGIN
    UPDATE shortened_urls 
    SET click_count = click_count + 1 
    WHERE id = short_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_click_count(VARCHAR(6)) TO anon;
GRANT EXECUTE ON FUNCTION increment_click_count(VARCHAR(6)) TO authenticated;
