-- ================================================
-- CLEAR ALL GIS DATA FROM DATABASE
-- ================================================
-- This script will delete all GIS data but keep table structures
-- Run this in pgAdmin or via psql

-- 1. Clear Points of Interest (điểm quan tâm)
DELETE FROM points_of_interest;
ALTER SEQUENCE points_of_interest_id_seq RESTART WITH 1;
SELECT setval('points_of_interest_id_seq', 1, false);

-- 2. Clear Routes (tuyến đường)
DELETE FROM routes;
ALTER SEQUENCE routes_id_seq RESTART WITH 1;
SELECT setval('routes_id_seq', 1, false);

-- 3. Clear Boundaries (ranh giới)
DELETE FROM boundaries;
ALTER SEQUENCE boundaries_id_seq RESTART WITH 1;
SELECT setval('boundaries_id_seq', 1, false);

-- 4. Clear Vietnam Provinces (tỉnh thành VN)
DELETE FROM vietnam_provinces;

-- Print results
SELECT 'Points of Interest count: ' || COUNT(*) FROM points_of_interest;
SELECT 'Routes count: ' || COUNT(*) FROM routes;
SELECT 'Boundaries count: ' || COUNT(*) FROM boundaries;
SELECT 'Vietnam Provinces count: ' || COUNT(*) FROM vietnam_provinces;

-- ================================================
-- VERIFICATION
-- ================================================
-- Run these to verify all data is cleared:
-- SELECT COUNT(*) FROM points_of_interest;
-- SELECT COUNT(*) FROM routes;
-- SELECT COUNT(*) FROM boundaries;
-- SELECT COUNT(*) FROM vietnam_provinces;

-- All should return 0

-- ================================================
-- NOTES
-- ================================================
-- 1. This keeps table structures intact
-- 2. This resets auto-increment IDs to 1
-- 3. To recreate tables, see migration files in backend/apps/gis_data/migrations/
-- 4. To add new data, use Django admin or API endpoints
-- 5. gis_layers table is managed by Django models, not direct SQL
