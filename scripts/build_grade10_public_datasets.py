#!/usr/bin/env python3
"""Build public GeoJSON packs for grade 10 HK1 modules 01, 05, 06."""
from pathlib import Path
import geopandas as gpd
from shapely.geometry import box

RAW = Path('sample_data/public_grade10/raw')
OUT = Path('sample_data/public_grade10/processed')
OUT.mkdir(parents=True, exist_ok=True)

admin = gpd.read_file(f"zip://{RAW / 'ne_admin1.zip'}!ne_10m_admin_1_states_provinces.shp").to_crs(4326)
admin_vn = admin[admin['adm0_a3'] == 'VNM'].copy()
admin_union = admin.union_all() if len(admin_vn) == 0 else admin_vn.union_all()
vn_bbox = box(102, 8, 110.8, 23.6)

prov = admin_vn[['name_en', 'postal', 'area_sqkm', 'geometry']].copy()
prov['name'] = prov['name_en'].fillna(admin_vn['name'])
prov['code'] = prov['postal'].fillna('')
prov['region'] = 'Vi?t Nam'
prov['population'] = 0
prov['area_km2'] = prov['area_sqkm'].fillna(0)
prov[['name','code','region','population','area_km2','geometry']].to_file('sample_data/vietnam_provinces.geojson', driver='GeoJSON')

pop = gpd.read_file(f"zip://{RAW / 'ne_populated_places.zip'}!ne_10m_populated_places.shp").to_crs(4326)
pop_vn = pop[pop['ADM0_A3'] == 'VNM'].copy().sort_values(['POP_MAX', 'SCALERANK'], ascending=[False, True]).head(12)
pop_vn['name'] = pop_vn['NAME']
pop_vn['category'] = 'module_01_city'
pop_vn['description'] = '?? th? th?t t? Natural Earth, d?ng ?? nh?n di?n ??i t??ng ?i?m tr?n b?n ??.'
pop_vn['short_label'] = pop_vn['NAME'].str.replace(' City', '', regex=False)
pop_vn['population'] = pop_vn['POP_MAX']
pop_vn[['name','category','description','short_label','population','geometry']].to_file(OUT / 'module01_cities.geojson', driver='GeoJSON')

roads = gpd.read_file(f"zip://{RAW / 'ne_roads.zip'}!ne_10m_roads.shp").to_crs(4326)
roads_vn = roads[roads.intersects(admin_union)].copy()
roads_vn['length_km'] = roads_vn['length_km'].fillna(0).astype(float)
roads_vn = roads_vn.sort_values('length_km', ascending=False).head(10).copy()
roads_vn['name'] = [n if n and str(n) != 'None' else f'Tuy?n giao th?ng ch?nh {idx + 1}' for idx, n in enumerate(roads_vn['name'].tolist())]
roads_vn['category'] = 'module_01_route'
roads_vn['description'] = roads_vn['type'].fillna('Tuy?n giao th?ng ch?nh')
roads_vn[['name','category','description','length_km','geometry']].to_file(OUT / 'module01_roads.geojson', driver='GeoJSON')

urban = gpd.read_file(f"zip://{RAW / 'ne_urban_areas.zip'}!ne_10m_urban_areas.shp").to_crs(4326)
urban_vn = urban[urban.intersects(admin_union)].copy().sort_values('area_sqkm', ascending=False).head(8)
if len(urban_vn):
    metric_crs = 3857
    urban_metric = urban_vn.to_crs(metric_crs).copy()
    cities_metric = pop_vn[['name','geometry']].to_crs(metric_crs).copy()
    nearest_names = []
    for _, row in urban_metric.iterrows():
        distances = cities_metric.geometry.distance(row.geometry.centroid)
        nearest_names.append(cities_metric.loc[distances.idxmin(), 'name'])
    urban_vn['name'] = [f'V?ng ?? th? {n}' for n in nearest_names]
    urban_vn['category'] = 'module_01_region'
    urban_vn['description'] = 'Ph?m vi ?? th? th?t t? Natural Earth, d?ng ?? ??c ph?n b? theo v?ng.'
    urban_vn[['name','category','description','area_sqkm','geometry']].rename(columns={'area_sqkm':'area_km2'}).to_file(OUT / 'module01_regions.geojson', driver='GeoJSON')

rivers = gpd.read_file(f"zip://{RAW / 'ne_rivers.zip'}!ne_10m_rivers_lake_centerlines.shp").to_crs(4326)
rivers_vn = rivers[rivers.intersects(admin_union)].copy()
rivers_vn = rivers_vn[(rivers_vn['name'].notna()) | (rivers_vn['name_vi'].notna()) | (rivers_vn['name_en'].notna())].copy()
rivers_vn['name'] = rivers_vn['name_vi'].replace('None', None).fillna(rivers_vn['name_en'].replace('None', None)).fillna(rivers_vn['name'])
rivers_vn['name'] = rivers_vn['name'].fillna('S?ng ti?u bi?u')
rivers_vn = rivers_vn.drop_duplicates(subset=['name']).sort_values('scalerank').head(8)
rivers_vn['type'] = 'module_05_river'
rivers_vn['length_km'] = 0
rivers_vn[['name','type','length_km','geometry']].to_file(OUT / 'module05_rivers.geojson', driver='GeoJSON')

basins = gpd.read_file(f"zip://{RAW / 'hydrobasins_asia.zip'}!hybas_as_lev05_v1c.shp").to_crs(4326)
basins_vn = basins[basins.intersects(admin_union)].copy().sort_values('SUB_AREA', ascending=False).head(6)
river_lines = rivers_vn[['name','geometry']].copy()
basin_names = []
for _, basin in basins_vn.iterrows():
    intersects = river_lines[river_lines.intersects(basin.geometry)]
    basin_names.append(f"L?u v?c {intersects.iloc[0]['name']}" if len(intersects) else f"L?u v?c ch?nh {len(basin_names)+1}")
basins_vn['name'] = basin_names
basins_vn['type'] = 'module_05_basin'
basins_vn['code'] = basins_vn['PFAF_ID'].astype(str)
basins_vn[['name','type','code','SUB_AREA','geometry']].rename(columns={'SUB_AREA':'area_km2'}).to_file(OUT / 'module05_basins.geojson', driver='GeoJSON')

pour = gpd.read_file(f"zip://{RAW / 'hydrobasins_pour_points.zip'}!hybas_pour_lev05_v1.shp").to_crs(4326)
pour_vn = pour[pour.within(vn_bbox)].copy().head(8)
pour_vn['name'] = [f'?i?m quan s?t l?u v?c {i+1}' for i in range(len(pour_vn))]
pour_vn['category'] = 'module_05_hydro_station'
pour_vn['description'] = '?i?m ??u ra l?u v?c t? HydroBASINS, d?ng thay ?i?m quan s?t ngu?n n??c.'
pour_vn[['name','category','description','HYBAS_ID','geometry']].rename(columns={'HYBAS_ID':'code'}).to_file(OUT / 'module05_points.geojson', driver='GeoJSON')

marine = gpd.read_file(f"zip://{RAW / 'ne_marine_polys.zip'}!ne_10m_geography_marine_polys.shp").to_crs(4326)
marine_vn = marine[marine.intersects(vn_bbox)].copy()
marine_vn = marine_vn[marine_vn['name_en'].isin(['South China Sea', 'Gulf of Thailand', 'Gulf of Tonkin'])].copy()
marine_vn['name'] = marine_vn['name_en'].replace({'South China Sea':'Bi?n ??ng','Gulf of Thailand':'V?nh Th?i Lan','Gulf of Tonkin':'V?nh B?c B?'})
marine_vn['category'] = 'module_05_sea_region'
marine_vn['description'] = 'V?ng bi?n v? v?nh th?t t? Natural Earth.'
marine_vn[['name','category','description','geometry']].to_file(OUT / 'module05_marine.geojson', driver='GeoJSON')

regions = gpd.read_file(f"zip://{RAW / 'ne_geography_regions_polys.zip'}!ne_10m_geography_regions_polys.shp").to_crs(4326)
regions_vn = regions[regions.intersects(admin_union)].copy()
regions_vn = regions_vn[regions_vn['NAME_EN'].isin(['Central Highlands', 'Mekong Delta', 'Annamite Range'])].copy()
name_map = {'Central Highlands':'T?y Nguy?n','Mekong Delta':'??ng b?ng s?ng C?u Long','Annamite Range':'D?y Tr??ng S?n'}
regions_vn['name'] = regions_vn['NAME_EN'].map(name_map).fillna(regions_vn['NAME_EN'])
regions_vn['category'] = 'module_06_biome_zone'
regions_vn['description'] = 'V?ng t? nhi?n th?t t? Natural Earth, d?ng ?? quan s?t s? ph?n h?a t? nhi?n v? phi ??a ??i.'
regions_vn[['name','category','description','geometry']].to_file(OUT / 'module06_regions.geojson', driver='GeoJSON')

print('Built public grade-10 datasets in', OUT)
