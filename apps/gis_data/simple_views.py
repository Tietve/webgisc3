"""
Simple GIS API Views - Không cần MapLayer model
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection

# Allowed tables and their category-like column
TABLE_CATEGORY_COLUMN = {
    'points_of_interest': 'category',
    'boundaries': 'type',
    'routes': 'type',
    'line_features': 'category',
    'polygon_features': 'category',
}


class SimpleLayerViewSet(viewsets.ViewSet):
    """
    API endpoint đơn giản để lấy dữ liệu GIS layers
    Không cần MapLayer model
    """
    permission_classes = [AllowAny]

    def list(self, request):
        """
        GET /api/v1/layers/
        Trả về danh sách các layers từ database với school/grade
        """
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
            cursor.execute("""
                SELECT id, name, data_source_table, geom_type, description, is_active,
                       filter_column, filter_value, school, grade
                FROM map_layers
                WHERE {where_sql}
                ORDER BY school, grade, id
            """.format(where_sql=where_sql), params)

            layers = []
            for row in cursor.fetchall():
                layers.append({
                    "id": row[0],
                    "name": row[1],
                    "data_source_table": row[2],
                    "geom_type": row[3],
                    "description": row[4],
                    "is_active": row[5],
                    "filter_column": row[6],
                    "filter_value": row[7],
                    "school": row[8],
                    "grade": row[9]
                })

        return Response({"results": layers})

    def retrieve(self, request, pk=None):
        """
        GET /api/v1/layers/{id}/
        Trả về chi tiết 1 layer từ database với school/grade
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, data_source_table, geom_type, description, is_active,
                       filter_column, filter_value, school, grade
                FROM map_layers
                WHERE id = %s
            """, [pk])

            row = cursor.fetchone()
            if not row:
                return Response(
                    {"error": "Layer not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            layer = {
                "id": row[0],
                "name": row[1],
                "data_source_table": row[2],
                "geom_type": row[3],
                "description": row[4],
                "is_active": row[5],
                "filter_column": row[6],
                "filter_value": row[7],
                "school": row[8],
                "grade": row[9]
            }

        return Response(layer)

    @action(detail=True, methods=['get'], url_path='features')
    def features(self, request, pk=None):
        """
        GET /api/v1/layers/{id}/features/
        Trả về GeoJSON features của layer với filter hỗ trợ
        """
        # Lấy thông tin layer từ database
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT data_source_table, filter_column, filter_value
                FROM map_layers
                WHERE id = %s
            """, [pk])

            layer_info = cursor.fetchone()
            if not layer_info:
                return Response(
                    {"error": "Layer not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            table_name = layer_info[0]
            filter_column = layer_info[1]
            filter_value = layer_info[2]

        # Validate table name against whitelist
        if table_name not in TABLE_CATEGORY_COLUMN:
            return Response(
                {"error": f"Unsupported table: {table_name}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine the category-like column for this table
        cat_column = TABLE_CATEGORY_COLUMN[table_name]

        # Xây dựng WHERE clause cho filter
        where_clause = "WHERE geometry IS NOT NULL"
        params = []

        if filter_column and filter_value:
            where_clause += f" AND {filter_column} = %s"
            params.append(filter_value)

        # Lấy dữ liệu từ database
        with connection.cursor() as cursor:
            query = f"""
                SELECT json_build_object(
                    'type', 'FeatureCollection',
                    'features', COALESCE(json_agg(
                        json_build_object(
                            'type', 'Feature',
                            'id', id,
                            'properties', json_build_object(
                                'id', id,
                                'name', name,
                                'category', COALESCE({cat_column}, 'Unknown')
                            ),
                            'geometry', ST_AsGeoJSON(geometry)::json
                        )
                    ), '[]'::json)
                ) as geojson
                FROM {table_name}
                {where_clause};
            """

            try:
                cursor.execute(query, params)
                result = cursor.fetchone()

                if result and result[0]:
                    return Response(result[0])
                else:
                    return Response({
                        "type": "FeatureCollection",
                        "features": []
                    })
            except Exception as e:
                return Response(
                    {"error": f"Database error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
