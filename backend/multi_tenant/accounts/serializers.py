from rest_framework import serializers
from .models import User, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["phone", "designation"]

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "username", "name", "role", "profile"]

    def get_profile(self, obj):
        try:
            return UserProfileSerializer(obj.profile).data
        except Exception:
            # Handles RelatedObjectDoesNotExist for superusers
            return None

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "name", "password", "role"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)