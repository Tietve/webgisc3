"""
Script to import Vietnam province boundaries from GeoJSON into PostGIS database.

This script handles large GeoJSON files (33MB+) efficiently by:
1. Reading GeoJSON file in one go (faster than line-by-line for valid JSON)
2. Using Django ORM with bulk operations
3. Converting coordinates to PostGIS geometry using GeometryField
"""
import os
import sys
import django
import json
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.gis.geos import GEOSGeometry
from apps.gis_data.models import Province

def import_provinces_from_geojson(file_path):
    """
    Import province boundaries from GeoJSON file into database.

    Args:
        file_path: Path to the GeoJSON file
    """
    print(f'🚀 Starting import from: {file_path}')
    print(f'📦 File size: {Path(file_path).stat().st_size / 1024 / 1024:.2f} MB\n')

    # Read GeoJSON file
    print('📖 Reading GeoJSON file...')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
    except Exception as e:
        print(f'❌ Error reading file: {e}')
        return

    print(f'✅ Loaded {len(geojson_data.get("features", []))} features\n')

    # Clear existing data (optional - comment out if you want to keep existing data)
    print('🗑️  Clearing existing provinces...')
    Province.objects.all().delete()
    print('✅ Cleared existing data\n')

    # Process features
    print('💾 Importing provinces...')
    provinces_to_create = []
    errors = []

    for idx, feature in enumerate(geojson_data.get('features', []), 1):
        try:
            properties = feature.get('properties', {})
            geometry = feature.get('geometry')

            if not geometry:
                errors.append(f'Feature {idx}: No geometry found')
                continue

            # Convert GeoJSON geometry to GEOS geometry
            geos_geom = GEOSGeometry(json.dumps(geometry))

            # Create Province object
            province = Province(
                ma_tinh=properties.get('ma_tinh', ''),
                ten_tinh=properties.get('ten_tinh', ''),
                sap_nhap=properties.get('sap_nhap', ''),
                quy_mo=properties.get('quy_mo', ''),
                tru_so=properties.get('tru_so', ''),
                loai=properties.get('loai', ''),
                cap=properties.get('cap', 1),
                stt=properties.get('stt', 0),
                dtich_km2=properties.get('dtich_km2', 0.0),
                dan_so=properties.get('dan_so', 0),
                matdo_km2=properties.get('matdo_km2', 0.0),
                geom=geos_geom
            )

            provinces_to_create.append(province)

            # Print progress every 10 provinces
            if idx % 10 == 0:
                print(f'  Processed {idx} provinces...')

        except Exception as e:
            errors.append(f'Feature {idx} ({properties.get("ten_tinh", "Unknown")}): {str(e)}')
            continue

    # Bulk create all provinces at once (much faster than one by one)
    if provinces_to_create:
        print(f'\n💾 Saving {len(provinces_to_create)} provinces to database...')
        try:
            Province.objects.bulk_create(provinces_to_create, batch_size=100)
            print(f'✅ Successfully imported {len(provinces_to_create)} provinces!\n')
        except Exception as e:
            print(f'❌ Error saving to database: {e}\n')
            return

    # Print summary
    print('📊 Import Summary:')
    print(f'   - Total features: {len(geojson_data.get("features", []))}')
    print(f'   - Successfully imported: {len(provinces_to_create)}')
    print(f'   - Errors: {len(errors)}')

    if errors:
        print(f'\n⚠️  Errors encountered:')
        for error in errors[:10]:  # Show first 10 errors
            print(f'   - {error}')
        if len(errors) > 10:
            print(f'   ... and {len(errors) - 10} more errors')

    # Show some sample data
    print(f'\n📍 Sample provinces:')
    for province in Province.objects.all()[:5]:
        print(f'   - {province.ten_tinh} ({province.ma_tinh}): {province.dtich_km2:.2f} km²')

if __name__ == '__main__':
    # File path - check both Docker and local paths
    docker_path = '/app/vietnam_provinces.geojson'
    local_path = r'D:\Webgis\real_data\Việt Nam (tỉnh thành) - 34.geojson'

    if Path(docker_path).exists():
        geojson_file = docker_path
    elif Path(local_path).exists():
        geojson_file = local_path
    else:
        print(f'❌ File not found in either location')
        print(f'   Docker: {docker_path}')
        print(f'   Local: {local_path}')
        sys.exit(1)

    print(f'📁 Using file: {geojson_file}\n')
    import_provinces_from_geojson(geojson_file)
