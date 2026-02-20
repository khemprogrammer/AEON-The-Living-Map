from django.urls import path
from .views import DailyEntryListCreate, ProfileAggregateView

urlpatterns = [
    path("entries/", DailyEntryListCreate.as_view(), name="daily-entries"),
    path("profiles/", ProfileAggregateView.as_view(), name="profiles"),
]

