from datetime import date
from django.db.models import Count
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import GlobalDilemma, DilemmaVote, StrangerMission, FrequencyMatch
from .serializers import (
    GlobalDilemmaSerializer,
    DilemmaVoteSerializer,
    StrangerMissionSerializer,
    FrequencyMatchSerializer,
)


class TodayDilemmaView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GlobalDilemmaSerializer

    def get(self, request):
        dilemma = GlobalDilemma.objects.filter(active=True).order_by("-created_at").first()
        if not dilemma:
            dilemma = GlobalDilemma.objects.create(question_text="Is it ever okay to lie to protect someone?", active=True)
        data = GlobalDilemmaSerializer(dilemma).data
        voted = DilemmaVote.objects.filter(dilemma=dilemma, user=request.user).exists()
        counts = DilemmaVote.objects.filter(dilemma=dilemma).values("choice").annotate(c=Count("id"))
        data["voted"] = voted
        data["tally"] = {row["choice"]: row["c"] for row in counts}
        return Response(data)

    def post(self, request):
        dilemma = GlobalDilemma.objects.filter(active=True).order_by("-created_at").first()
        if not dilemma:
            return Response({"detail": "no active dilemma"}, status=400)
        if DilemmaVote.objects.filter(dilemma=dilemma, user=request.user).exists():
            return Response({"detail": "already voted"}, status=400)
        serializer = DilemmaVoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        DilemmaVote.objects.create(dilemma=dilemma, user=request.user, **serializer.validated_data)
        return Response({"ok": True})


class TodayMissionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StrangerMissionSerializer

    def get(self, request):
        mission = StrangerMission.objects.filter(assigned_to=request.user, assigned_date=date.today()).first()
        if not mission:
            mission = StrangerMission.objects.filter(assigned_to__isnull=True).order_by("?").first()
            if not mission:
                mission = StrangerMission.objects.create(text="Sit in silence for five minutes.")
            mission.assigned_to = request.user
            mission.assigned_date = date.today()
            mission.save()
        return Response(StrangerMissionSerializer(mission).data)

    def post(self, request):
        mission = StrangerMission.objects.filter(assigned_to=request.user, assigned_date=date.today()).first()
        if not mission:
            return Response({"detail": "no mission assigned"}, status=400)
        mission.completed = True
        mission.save()
        return Response({"ok": True})


class FrequencyMatchView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FrequencyMatchSerializer

    def get(self, request):
        fm, _ = FrequencyMatch.objects.get_or_create(user=request.user)
        if not fm.match_user:
            candidate = User.objects.exclude(id=request.user.id).order_by("?").first()
            fm.match_user = candidate
            fm.score = 0.7 if candidate else 0.0
            fm.save()
        return Response(FrequencyMatchSerializer(fm).data)

