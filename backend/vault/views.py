from rest_framework import permissions, generics
from rest_framework.response import Response
from .models import VaultGrant
from .serializers import VaultGrantSerializer
from users.serializers import UserProfileSerializer
from world.serializers import WorldStateSerializer
from engine.serializers import DailyEntrySerializer, ProfileAggregateSerializer
from engine.models import DailyEntry, ProfileAggregate
from world.models import WorldState
from users.models import UserProfile


class VaultSnapshotView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        world, _ = WorldState.objects.get_or_create(user=request.user)
        agg, _ = ProfileAggregate.objects.get_or_create(user=request.user)
        entries = DailyEntry.objects.filter(user=request.user).order_by("-created_at")[:50]
        return Response(
            {
                "profile": UserProfileSerializer(profile).data,
                "world": WorldStateSerializer(world).data,
                "aggregate": ProfileAggregateSerializer(agg).data,
                "recent_entries": DailyEntrySerializer(entries, many=True).data,
            }
        )


class VaultGrantListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VaultGrantSerializer

    def get_queryset(self):
        return VaultGrant.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

