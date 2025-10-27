"""
Tạo MapLayer records cho các bảng GIS
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.gis_data.models import MapLayer

def create_layers():
    print("🗺️  Tạo MapLayer records...")

    layers_data = [
        {
            'name': 'Điểm Quan Tâm',
            'data_source_table': 'points_of_interest',
            'geom_type': 'POINT',
            'description': 'Các điểm quan tâm như hồ nước, chợ, trường học, bệnh viện...',
            'is_active': True
        },
        {
            'name': 'Ranh Giới',
            'data_source_table': 'boundaries',
            'geom_type': 'MULTIPOLYGON',
            'description': 'Ranh giới hành chính các tỉnh, huyện, xã',
            'is_active': True
        },
        {
            'name': 'Tuyến Đường',
            'data_source_table': 'routes',
            'geom_type': 'LINESTRING',
            'description': 'Các tuyến đường, xe buýt, metro...',
            'is_active': True
        }
    ]

    for layer_data in layers_data:
        layer, created = MapLayer.objects.get_or_create(
            data_source_table=layer_data['data_source_table'],
            defaults=layer_data
        )

        if created:
            print(f"✅ Đã tạo layer: {layer.name}")
        else:
            print(f"⏭️  Layer '{layer.name}' đã tồn tại")

    print("\n📊 Tổng số layers:")
    print(f"   - {MapLayer.objects.count()} layers trong database")
    print(f"   - {MapLayer.objects.filter(is_active=True).count()} layers đang active")

    print("\n🎉 Hoàn tất!")

if __name__ == '__main__':
    create_layers()
