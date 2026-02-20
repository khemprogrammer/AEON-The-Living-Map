from django.urls import path
from .views import TodayDilemmaView, TodayMissionView, FrequencyMatchView

urlpatterns = [
    path("dilemma/today/", TodayDilemmaView.as_view(), name="today-dilemma"),
    path("mission/today/", TodayMissionView.as_view(), name="today-mission"),
    path("match/", FrequencyMatchView.as_view(), name="frequency-match"),
]

