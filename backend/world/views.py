from rest_framework import permissions, generics
from rest_framework.response import Response
from .models import WorldState
from .serializers import WorldStateSerializer


class WorldStateView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorldStateSerializer

    def get_world(self, user):
        world, _ = WorldState.objects.get_or_create(user=user)
        return world

    def get(self, request):
        world = self.get_world(request.user)
        return Response(self.get_serializer(world).data)

    def patch(self, request):
        world = self.get_world(request.user)
        serializer = self.get_serializer(world, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

