"""
Script to check imported province data.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.gis_data.models import Province

print('🗺️  THÔNG TIN BẢNG PROVINCES\n')
print(f'📊 Tên bảng: {Province._meta.db_table}')
print(f'📍 Tổng số tỉnh: {Province.objects.count()}\n')

print('📋 Danh sách các tỉnh đã import:\n')
print(f'{"STT":<5} {"Mã":<6} {"Tên tỉnh":<30} {"Diện tích (km²)":<15} {"Dân số":<12}')
print('-' * 85)

for idx, province in enumerate(Province.objects.all().order_by('stt'), 1):
    print(f'{idx:<5} {province.ma_tinh:<6} {province.ten_tinh:<30} {province.dtich_km2:>12.2f}   {province.dan_so:>12,}')

print('\n✅ Dữ liệu đã được lưu vào bảng: provinces')
print(f'📍 Có thể truy cập qua pgAdmin tại: http://localhost:5050')
print(f'   - Server: db (trong Docker network)')
print(f'   - Database: webgis_db')
print(f'   - Table: public.provinces')
