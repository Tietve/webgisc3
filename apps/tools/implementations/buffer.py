"""
Buffer tool - Creates a buffer zone around input geometries.

Example usage:
POST /api/v1/tools/buffer/execute/
{
    "input_geojson": {
        "type": "FeatureCollection",
        "features": [...]
    },
    "parameters": {
        "distance": 1000,  // Buffer distance in meters
        "units": "meters"
    }
}
"""
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import Distance
from ..base import BaseTool
import json


class BufferTool(BaseTool):
    """
    Tool for creating buffer zones around geometries.
    """

    def execute(self, request_data):
        """
        Execute buffer operation on input geometries.

        Args:
            request_data (dict): Contains input_geojson and parameters

        Returns:
            dict: GeoJSON FeatureCollection with buffered geometries
        """
        self.validate_input(request_data)

        input_geojson = request_data['input_geojson']
        parameters = request_data['parameters']

        # Validate parameters
        if 'distance' not in parameters:
            raise ValueError("Missing 'distance' parameter")

        distance = float(parameters['distance'])
        units = parameters.get('units', 'meters')

        # Process input GeoJSON
        if input_geojson['type'] == 'FeatureCollection':
            features = input_geojson['features']
        elif input_geojson['type'] == 'Feature':
            features = [input_geojson]
        else:
            raise ValueError("Input must be a Feature or FeatureCollection")

        # Create buffered features
        buffered_features = []
        for feature in features:
            try:
                # Convert GeoJSON geometry to GEOS geometry
                geom = GEOSGeometry(json.dumps(feature['geometry']))

                # Transform to a projected CRS for accurate buffering (EPSG:3857)
                geom.transform(3857)

                # Apply buffer
                if units == 'meters':
                    buffered_geom = geom.buffer(distance)
                elif units == 'kilometers':
                    buffered_geom = geom.buffer(distance * 1000)
                else:
                    raise ValueError(f"Unsupported units: {units}")

                # Transform back to WGS84 (EPSG:4326)
                buffered_geom.transform(4326)

                # Create buffered feature
                buffered_feature = {
                    'type': 'Feature',
                    'geometry': json.loads(buffered_geom.geojson),
                    'properties': {
                        **feature.get('properties', {}),
                        'buffer_distance': distance,
                        'buffer_units': units
                    }
                }
                buffered_features.append(buffered_feature)

            except Exception as e:
                raise ValueError(f"Error processing feature: {str(e)}")

        # Return GeoJSON FeatureCollection
        return {
            'type': 'FeatureCollection',
            'features': buffered_features
        }


# This function is called by the dynamic executor
def execute(request_data):
    """
    Entry point for the buffer tool.

    Args:
        request_data (dict): Request data containing input_geojson and parameters

    Returns:
        dict: GeoJSON FeatureCollection with buffered features
    """
    tool = BufferTool()
    return tool.execute(request_data)
