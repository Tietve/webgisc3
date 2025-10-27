"""
Views for user authentication and registration.
"""
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer, UserProfileSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/

    Register a new user account (student or teacher).

    Request Body:
    {
        "email": "user@example.com",
        "password": "secure_password",
        "password_confirm": "secure_password",
        "role": "student"  // or "teacher"
    }

    Response (201 Created):
    {
        "id": "uuid",
        "email": "user@example.com",
        "role": "student",
        "created_at": "2024-01-01T00:00:00Z"
    }
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register a new user",
        description="Create a new user account with email, password, and role (student or teacher).",
        responses={
            201: UserSerializer,
            400: OpenApiResponse(description="Validation error")
        },
        tags=['Authentication']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return user data (without password)
        response_serializer = UserSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveAPIView):
    """
    GET /api/v1/auth/profile/

    Get the current authenticated user's profile.

    Response (200 OK):
    {
        "id": "uuid",
        "email": "user@example.com",
        "role": "student",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    """
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Get current user profile",
        description="Retrieve the authenticated user's profile information.",
        responses={
            200: UserProfileSerializer,
        },
        tags=['Authentication']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
