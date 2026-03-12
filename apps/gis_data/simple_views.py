"""
Simple GIS API Views - Kh?ng c?n MapLayer model
"""
from django.db import connection
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

TABLE_PROPERTY_FIELDS = {
    'points_of_interest': "'id', id, 'name', name, 'category', COALESCE(category, 'Unknown'), 'description', COALESCE(description, '')",
    'boundaries': "'id', id, 'name', name, 'category', COALESCE(type, 'Unknown'), 'code', COALESCE(code, ''), 'area_km2', COALESCE(area_km2, 0)",
    'routes': "'id', id, 'name', name, 'category', COALESCE(type, 'Unknown'), 'length_km', COALESCE(length_km, 0)",
    'line_features': "'id', id, 'name', name, 'category', COALESCE(category, 'Unknown'), 'description', COALESCE(description, '')",
    'polygon_features': "'id', id, 'name', name, 'category', COALESCE(category, 'Unknown'), 'description', COALESCE(description, '')",
    'vietnam_provinces': "'id', id, 'name', name, 'category', COALESCE(region, 'Unknown'), 'code', COALESCE(code, ''), 'population', COALESCE(population, 0), 'area_km2', COALESCE(area_km2, 0)",
}


class SimpleLayerViewSet(viewsets.ViewSet):
    """
    API endpoint ??n gi?n ?? l?y d? li?u GIS layers.
    """

    permission_classes = [AllowAny]

    def list(self, request):
        school = request.query_params.get('school')
        grade = request.query_params.get('grade')
        params = []
        where_clauses = ['is_active = true']

        if school:
            where_clauses.append('school = %s')
            params.append(school)
        if grade:
            where_clauses.append('grade = %s')
            params.append(grade)

        where_sql = ' AND '.join(where_clauses)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, data_source_table, geom_type, description, is_active,
                       filter_column, filter_value, school, grade
                FROM map_layers
                WHERE {where_sql}
                ORDER BY school, grade, id
                """.format(where_sql=where_sql),
                params,
            )

            layers = [
                {
                    'id': row[0],
                    'name': row[1],
                    'data_source_table': row[2],
                    'geom_type': row[3],
                    'description': row[4],
                    'is_active': row[5],
                    'filter_column': row[6],
                    'filter_value': row[7],
                    'school': row[8],
                    'grade': row[9],
                }
                for row in cursor.fetchall()
            ]

        return Response({'results': layers})

    def retrieve(self, request, pk=None):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, data_source_table, geom_type, description, is_active,
                       filter_column, filter_value, school, grade
                FROM map_layers
                WHERE id = %s
                """,
                [pk],
            )
            row = cursor.fetchone()

        if not row:
            return Response({'error': 'Layer not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                'id': row[0],
                'name': row[1],
                'data_source_table': row[2],
                'geom_type': row[3],
                'description': row[4],
                'is_active': row[5],
                'filter_column': row[6],
                'filter_value': row[7],
                'school': row[8],
                'grade': row[9],
            }
        )

    @action(detail=True, methods=['get'], url_path='features')
    def features(self, request, pk=None):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT data_source_table, filter_column, filter_value
                FROM map_layers
                WHERE id = %s
                """,
                [pk],
            )
            layer_info = cursor.fetchone()

        if not layer_info:
            return Response({'error': 'Layer not found'}, status=status.HTTP_404_NOT_FOUND)

        table_name, filter_column, filter_value = layer_info
        if table_name not in TABLE_PROPERTY_FIELDS:
            return Response({'error': f'Unsupported table: {table_name}'}, status=status.HTTP_400_BAD_REQUEST)

        where_clause = 'WHERE geometry IS NOT NULL'
        params = []
        if filter_column and filter_value:
            where_clause += f' AND {filter_column} = %s'
            params.append(filter_value)

        with connection.cursor() as cursor:
            query = f"""
                SELECT json_build_object(
                    'type', 'FeatureCollection',
                    'features', COALESCE(json_agg(
                        json_build_object(
                            'type', 'Feature',
                            'id', id,
                            'properties', json_build_object({TABLE_PROPERTY_FIELDS[table_name]}),
                            'geometry', ST_AsGeoJSON(geometry)::json
                        )
                    ), '[]'::json)
                ) AS geojson
                FROM {table_name}
                {where_clause};
            """
            try:
                cursor.execute(query, params)
                result = cursor.fetchone()
            except Exception as exc:
                return Response({'error': f'Database error: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if result and result[0]:
            return Response(result[0])

        return Response({'type': 'FeatureCollection', 'features': []})
