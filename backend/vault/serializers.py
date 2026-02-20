from rest_framework import serializers
from .models import VaultGrant


class VaultGrantSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultGrant
        fields = ["id", "recipient_email", "release_date", "created_at"]
        read_only_fields = ["id", "created_at"]

