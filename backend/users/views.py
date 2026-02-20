from django.contrib.auth.models import User
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from .models import UserProfile
from .serializers import UserProfileSerializer


class MeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(self.get_serializer(profile).data)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def signup(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")
    if not username or not password:
        return Response({"detail": "username and password required"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "username taken"}, status=400)
    user = User.objects.create_user(username=username, password=password, email=email)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def obtain_token(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"detail": "username and password required"}, status=400)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"detail": "invalid credentials"}, status=400)
    if not user.check_password(password):
        return Response({"detail": "invalid credentials"}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})

