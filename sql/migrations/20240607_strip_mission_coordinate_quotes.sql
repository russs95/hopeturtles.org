-- Remove stray quote characters from mission target coordinates
-- and coerce them back into DECIMAL values.

UPDATE missions_tb
SET
  target_lat = CASE
    WHEN target_lat IS NULL THEN NULL
    ELSE CAST(REPLACE(TRIM(target_lat), '"', '') AS DECIMAL(10,7))
  END,
  target_lng = CASE
    WHEN target_lng IS NULL THEN NULL
    ELSE CAST(REPLACE(TRIM(target_lng), '"', '') AS DECIMAL(10,7))
  END
WHERE target_lat REGEXP '"'
   OR target_lng REGEXP '"';
