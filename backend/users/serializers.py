from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "bio",
            "date_of_birth",
            "days_remaining",
            "preferences",
            "created_at",
            "updated_at",
        ]

