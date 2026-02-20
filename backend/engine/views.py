from datetime import timedelta
from django.utils import timezone
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import DailyEntry, ProfileAggregate
from .serializers import DailyEntrySerializer, ProfileAggregateSerializer
from world.models import WorldState


class DailyEntryListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DailyEntrySerializer

    def get_queryset(self):
        return DailyEntry.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        entry = serializer.save(user=self.request.user)
        self._update_world(entry)
        self._update_profiles(self.request.user)

    def _update_world(self, entry: DailyEntry):
        world, _ = WorldState.objects.get_or_create(user=entry.user)
        if entry.entry_type == DailyEntry.TEXT and "breakthrough" in entry.content_text.lower():
            world.breakthroughs += 1
        if entry.mood:
            world.stress_level = max(0.0, min(1.0, 1.0 - (entry.mood.lower() in ["calm", "happy"]) * 0.1))
        week_entries = DailyEntry.objects.filter(user=entry.user, created_at__gte=timezone.now() - timedelta(days=7)).count()
        world.habit_consistency = max(0.0, min(1.0, week_entries / 14.0))
        if week_entries == 0:
            world.neglect = min(1.0, world.neglect + 0.05)
        else:
            world.neglect = max(0.0, world.neglect - 0.02)
        world.save()

    def _update_profiles(self, user):
        agg, _ = ProfileAggregate.objects.get_or_create(user=user)
        recent = DailyEntry.objects.filter(user=user).order_by("-created_at")[:50]
        moods = [e.mood for e in recent if e.mood]
        agg.pattern_profile = {"entries_last_50": len(recent), "mood_counts": {m: moods.count(m) for m in set(moods)}}
        agg.shadow_profile = {"hidden": bool(any("hide" in (e.content_text or "").lower() for e in recent))}
        agg.value_gap_report = {"aligned": len([e for e in recent if "value" in (e.content_text or "").lower()])}
        agg.future_self_thread = {"notes": [e.content_text[:60] for e in recent if e.content_text][:5]}
        agg.save()


class ProfileAggregateView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileAggregateSerializer

    def get_object(self):
        agg, _ = ProfileAggregate.objects.get_or_create(user=self.request.user)
        return agg

