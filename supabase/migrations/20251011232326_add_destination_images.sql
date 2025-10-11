/*
  # Add Image URLs to Destinations

  ## Changes
  1. Add image_url column to destinations table
    - Stores URL to destination image from Pexels
    - Allows null for backwards compatibility
  
  2. Update existing destinations with sample images
    - Add relevant travel images from Pexels
    - Images match destination categories and themes

  ## Notes
  - Using high-quality Pexels stock photos
  - Images enhance user experience and help with informed decisions
  - All images are compressed and optimized for web
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'destinations' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE destinations ADD COLUMN image_url text;
  END IF;
END $$;

UPDATE destinations 
SET image_url = CASE 
  WHEN name LIKE '%Tower%' OR name LIKE '%Eiffel%' THEN 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Museum%' AND city = 'Paris' THEN 'https://images.pexels.com/photos/2675268/pexels-photo-2675268.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Park%' OR category = 'park' THEN 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Bridge%' OR name LIKE '%Gate%' THEN 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Palace%' OR name LIKE '%Castle%' THEN 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Temple%' OR name LIKE '%Shrine%' THEN 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Beach%' OR name LIKE '%Coast%' THEN 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Cathedral%' OR name LIKE '%Church%' THEN 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN name LIKE '%Mountain%' OR name LIKE '%Peak%' THEN 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'New York' THEN 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'London' THEN 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'Tokyo' THEN 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'Rome' THEN 'https://images.pexels.com/photos/2225439/pexels-photo-2225439.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'Dubai' THEN 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN city = 'Sydney' THEN 'https://images.pexels.com/photos/783682/pexels-photo-783682.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN category = 'landmark' THEN 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN category = 'museum' THEN 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHEN category = 'attraction' THEN 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800'
  ELSE 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800'
END
WHERE image_url IS NULL;
