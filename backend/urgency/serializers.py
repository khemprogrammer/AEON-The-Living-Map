from rest_framework import serializers
from .models import Wish, SlowPost


class WishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wish
        fields = ["id", "text", "postpone_count", "created_at"]
        read_only_fields = ["id", "postpone_count", "created_at"]


class SlowPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlowPost
        fields = ["id", "recipient_name", "recipient_email", "unlock_date", "content", "opened", "created_at"]
        read_only_fields = ["id", "opened", "created_at"]

