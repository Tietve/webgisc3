"""
Custom exception handlers for consistent error responses.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error format.

    Returns:
        {
            "error": {
                "code": "error_code",
                "message": "Error message",
                "details": {}  # Optional additional details
            }
        }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            'error': {
                'code': exc.__class__.__name__,
                'message': str(exc),
            }
        }

        # Add details if available
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['error']['details'] = exc.detail
            elif isinstance(exc.detail, list):
                custom_response_data['error']['details'] = {'errors': exc.detail}

        response.data = custom_response_data

        # Log the error
        logger.error(
            f"API Error: {exc.__class__.__name__} - {str(exc)}",
            exc_info=True,
            extra={
                'request': context.get('request'),
                'view': context.get('view'),
            }
        )

    else:
        # Handle Django exceptions that DRF doesn't handle by default
        if isinstance(exc, (ObjectDoesNotExist, Http404)):
            custom_response_data = {
                'error': {
                    'code': 'NotFound',
                    'message': 'The requested resource was not found.',
                }
            }
            response = Response(custom_response_data, status=404)

        elif isinstance(exc, PermissionError):
            custom_response_data = {
                'error': {
                    'code': 'PermissionDenied',
                    'message': 'You do not have permission to perform this action.',
                }
            }
            response = Response(custom_response_data, status=403)

        else:
            # Log unhandled exceptions
            logger.exception(
                f"Unhandled exception: {exc.__class__.__name__} - {str(exc)}",
                extra={
                    'request': context.get('request'),
                    'view': context.get('view'),
                }
            )
            custom_response_data = {
                'error': {
                    'code': 'InternalServerError',
                    'message': 'An unexpected error occurred. Please try again later.',
                }
            }
            response = Response(custom_response_data, status=500)

    return response
