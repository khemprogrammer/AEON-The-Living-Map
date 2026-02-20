from django.urls import path
from .views import WorldStateView

urlpatterns = [
    path("state/", WorldStateView.as_view(), name="world-state"),
]

