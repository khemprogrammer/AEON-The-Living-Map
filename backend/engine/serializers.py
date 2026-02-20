from rest_framework import serializers
from .models import DailyEntry, ProfileAggregate


class DailyEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyEntry
        fields = [
            "id",
            "entry_type",
            "content_text",
            "media_file",
            "mood",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ProfileAggregateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileAggregate
        fields = [
            "pattern_profile",
            "shadow_profile",
            "value_gap_report",
            "future_self_thread",
            "updated_at",
        ]

