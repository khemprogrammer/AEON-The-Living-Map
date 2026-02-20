from rest_framework import serializers
from .models import WorldState


class WorldStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldState
        fields = [
            "habit_consistency",
            "stress_level",
            "breakthroughs",
            "neglect",
            "terrain_seed",
            "notes",
            "updated_at",
        ]

