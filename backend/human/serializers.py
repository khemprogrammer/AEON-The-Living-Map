from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GlobalDilemma, DilemmaVote, StrangerMission, FrequencyMatch


class GlobalDilemmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalDilemma
        fields = ["id", "question_text", "created_at", "active"]


class DilemmaVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DilemmaVote
        fields = ["id", "choice", "reasoning", "created_at"]
        read_only_fields = ["id", "created_at"]


class StrangerMissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StrangerMission
        fields = ["id", "text", "assigned_date", "completed", "created_at"]
        read_only_fields = ["id", "assigned_date", "created_at"]


class FrequencyMatchSerializer(serializers.ModelSerializer):
    match_username = serializers.SerializerMethodField()

    class Meta:
        model = FrequencyMatch
        fields = ["match_username", "score", "updated_at"]

    def get_match_username(self, obj):
        return obj.match_user.username if obj.match_user else None

