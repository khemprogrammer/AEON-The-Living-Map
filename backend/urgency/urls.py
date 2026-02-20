from django.urls import path
from .views import UrgencyStatusView, WishListCreate, postpone_wish, SlowPostListCreate, unlock_slowpost

urlpatterns = [
    path("status/", UrgencyStatusView.as_view(), name="urgency-status"),
    path("wishes/", WishListCreate.as_view(), name="wishes"),
    path("wishes/<int:pk>/postpone/", postpone_wish, name="postpone-wish"),
    path("slowpost/", SlowPostListCreate.as_view(), name="slowpost"),
    path("slowpost/<int:pk>/unlock/", unlock_slowpost, name="unlock-slowpost"),
]

