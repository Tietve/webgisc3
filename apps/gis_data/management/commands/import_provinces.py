"""
Management command to import Vietnam provinces from GeoJSON file.
"""
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from apps.gis_data.models import VietnamProvince, MapLayer


class Command(BaseCommand):
    help = 'Import Vietnam provinces from GeoJSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='sample_data/vietnam_provinces.geojson',
            help='Path to GeoJSON file (relative to project root)',
        )

    def handle(self, *args, **options):
        file_path = options['file']

        # Get absolute path
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        geojson_path = base_dir / file_path

        if not geojson_path.exists():
            self.stdout.write(self.style.ERROR(f'File not found: {geojson_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading file: {geojson_path}'))

        # Read GeoJSON file
        with open(geojson_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Clear existing data
        VietnamProvince.objects.all().delete()
        self.stdout.write(self.style.WARNING('Cleared existing province data'))

        # Import provinces
        imported_count = 0
        for feature in data['features']:
            properties = feature['properties']
            geometry = feature['geometry']

            # Convert GeoJSON geometry to Django GEOSGeometry
            geos_geom = GEOSGeometry(json.dumps(geometry))

            # Create province record
            province = VietnamProvince.objects.create(
                name=properties['name'],
                code=properties['code'],
                region=properties.get('region', ''),
                population=properties.get('population'),
                area_km2=properties.get('area_km2'),
                geometry=geos_geom
            )

            imported_count += 1
            self.stdout.write(f'Imported: {province.name} ({province.code})')

        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully imported {imported_count} provinces'))

        # Create or update MapLayer for provinces
        layer, created = MapLayer.objects.update_or_create(
            data_source_table='vietnam_provinces',
            defaults={
                'name': 'Tỉnh Thành Việt Nam',
                'geom_type': 'MULTIPOLYGON',
                'description': 'Ranh giới hành chính các tỉnh thành Việt Nam',
                'is_active': True,
            }
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'✅ {action} MapLayer: {layer.name}'))
