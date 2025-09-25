-- LinkSense AI Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create the shortened_urls table
CREATE TABLE IF NOT EXISTS shortened_urls (
    id VARCHAR(6) PRIMARY KEY,
    original_url TEXT NOT NULL,
    summary TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shortened_urls_original_url ON shortened_urls(original_url);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_created_at ON shortened_urls(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shortened_urls ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for redirects)
CREATE POLICY "Allow public read access" ON shortened_urls
    FOR SELECT USING (true);

-- Create policy to allow public insert (for creating short URLs)
CREATE POLICY "Allow public insert" ON shortened_urls
    FOR INSERT WITH CHECK (true);

-- Optional: Create a function to increment click count
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
