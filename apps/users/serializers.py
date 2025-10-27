"""
Serializers for user authentication and registration.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Validates and creates a new user account.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'password_confirm', 'role')
        read_only_fields = ('id',)

    def validate(self, attrs):
        """
        Validate that passwords match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs

    def validate_role(self, value):
        """
        Validate role is either 'student' or 'teacher'.
        """
        if value not in ['student', 'teacher']:
            raise serializers.ValidationError(
                "Role must be either 'student' or 'teacher'."
            )
        return value

    def create(self, validated_data):
        """
        Create a new user with encrypted password.
        """
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details (read-only).
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'created_at')
        read_only_fields = fields


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile with additional information.
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'created_at', 'updated_at')
        read_only_fields = fields
