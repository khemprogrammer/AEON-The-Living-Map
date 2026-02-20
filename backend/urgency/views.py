from datetime import date
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from users.models import UserProfile
from .models import Wish, SlowPost
from .serializers import WishSerializer, SlowPostSerializer


class UrgencyStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        wish = Wish.objects.filter(user=request.user).order_by("postpone_count", "created_at").first()
        return Response({"days_remaining": profile.days_remaining, "wish": WishSerializer(wish).data if wish else None})


class WishListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishSerializer

    def get_queryset(self):
        return Wish.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def postpone_wish(request, pk):
    try:
        wish = Wish.objects.get(id=pk, user=request.user)
    except Wish.DoesNotExist:
        return Response({"detail": "not found"}, status=404)
    wish.postpone_count += 1
    wish.save()
    return Response({"ok": True, "postpone_count": wish.postpone_count})


class SlowPostListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SlowPostSerializer

    def get_queryset(self):
        return SlowPost.objects.filter(created_by=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def unlock_slowpost(request, pk):
    try:
        post = SlowPost.objects.get(id=pk, created_by=request.user)
    except SlowPost.DoesNotExist:
        return Response({"detail": "not found"}, status=404)
    if date.today() < post.unlock_date:
        return Response({"detail": "locked"}, status=403)
    post.opened = True
    post.save()
    return Response(SlowPostSerializer(post).data)

