-- Tạo database và enable PostGIS
CREATE DATABASE webgis_db;

-- Connect vào database vừa tạo
\c webgis_db

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tạo user (optional, nếu muốn)
-- CREATE USER webgis_user WITH PASSWORD 'webgis_password';
-- GRANT ALL PRIVILEGES ON DATABASE webgis_db TO webgis_user;
