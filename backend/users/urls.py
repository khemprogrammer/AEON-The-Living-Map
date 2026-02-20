from django.urls import path
from .views import MeView, signup, obtain_token

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("signup/", signup, name="signup"),
    path("token/", obtain_token, name="token"),
]

