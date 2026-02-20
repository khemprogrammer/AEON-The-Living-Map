from django.contrib import admin
from .models import GlobalDilemma, DilemmaVote, StrangerMission, FrequencyMatch


@admin.register(GlobalDilemma)
class GlobalDilemmaAdmin(admin.ModelAdmin):
    list_display = ("question_text", "created_at", "active")


@admin.register(DilemmaVote)
class DilemmaVoteAdmin(admin.ModelAdmin):
    list_display = ("dilemma", "user", "choice", "created_at")
    list_filter = ("choice",)


@admin.register(StrangerMission)
class StrangerMissionAdmin(admin.ModelAdmin):
    list_display = ("text", "assigned_to", "assigned_date", "completed")


@admin.register(FrequencyMatch)
class FrequencyMatchAdmin(admin.ModelAdmin):
    list_display = ("user", "match_user", "score", "updated_at")

