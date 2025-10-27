"""
Views for geospatial analysis tools with dynamic tool loading.
"""
import importlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
import logging

logger = logging.getLogger(__name__)


class ToolExecuteView(APIView):
    """
    POST /api/v1/tools/{tool_name}/execute/

    Dynamic tool executor that loads and executes geospatial analysis tools.

    The view automatically loads a tool module from apps/tools/implementations/{tool_name}.py
    and calls its execute(request_data) function.

    Request Body:
    {
        "input_geojson": {
            "type": "FeatureCollection",
            "features": [...]
        },
        "parameters": {
            // Tool-specific parameters
        }
    }

    Response (200 OK):
    {
        "type": "FeatureCollection",
        "features": [...]  // Analysis results
    }

    Available tools:
    - buffer: Create buffer zones around geometries
    - intersect: Find intersections between geometry sets
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Execute geospatial analysis tool",
        description="Dynamically execute a geospatial analysis tool by name. "
                    "Available tools: buffer, intersect. "
                    "Each tool requires specific parameters in the request body.",
        parameters=[
            OpenApiParameter(
                name='tool_name',
                description='Name of the tool to execute (e.g., buffer, intersect)',
                required=True,
                type=str,
                location=OpenApiParameter.PATH
            )
        ],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'input_geojson': {
                        'type': 'object',
                        'description': 'GeoJSON FeatureCollection or Feature'
                    },
                    'parameters': {
                        'type': 'object',
                        'description': 'Tool-specific parameters'
                    }
                },
                'required': ['input_geojson', 'parameters']
            }
        },
        responses={
            200: OpenApiResponse(description="GeoJSON FeatureCollection with analysis results"),
            400: OpenApiResponse(description="Invalid input or parameters"),
            404: OpenApiResponse(description="Tool not found"),
            500: OpenApiResponse(description="Tool execution error")
        },
        tags=['Geospatial Tools']
    )
    def post(self, request, tool_name):
        """
        Execute a geospatial tool dynamically.

        Args:
            tool_name (str): Name of the tool to execute

        Returns:
            Response: GeoJSON FeatureCollection with analysis results
        """
        try:
            # Validate request data
            if not request.data:
                return Response(
                    {'error': {'code': 'InvalidRequest', 'message': 'Request body is required'}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Dynamically import the tool module
            try:
                module_path = f'apps.tools.implementations.{tool_name}'
                tool_module = importlib.import_module(module_path)
            except ImportError:
                logger.warning(f"Tool not found: {tool_name}")
                return Response(
                    {'error': {'code': 'ToolNotFound', 'message': f'Tool "{tool_name}" not found'}},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get the execute function from the module
            if not hasattr(tool_module, 'execute'):
                logger.error(f"Tool {tool_name} does not have an execute function")
                return Response(
                    {'error': {'code': 'InvalidTool', 'message': f'Tool "{tool_name}" is not properly configured'}},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            execute_func = tool_module.execute

            # Execute the tool
            try:
                result = execute_func(request.data)
                return Response(result, status=status.HTTP_200_OK)

            except ValueError as e:
                logger.warning(f"Validation error in tool {tool_name}: {str(e)}")
                return Response(
                    {'error': {'code': 'ValidationError', 'message': str(e)}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            except Exception as e:
                logger.exception(f"Error executing tool {tool_name}: {str(e)}")
                return Response(
                    {'error': {'code': 'ExecutionError', 'message': f'Error executing tool: {str(e)}'}},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.exception(f"Unexpected error in tool executor: {str(e)}")
            return Response(
                {'error': {'code': 'InternalServerError', 'message': 'An unexpected error occurred'}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
