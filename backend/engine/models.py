from django.db import models
from django.contrib.auth.models import User


class DailyEntry(models.Model):
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"
    QUESTION = "question"
    ENTRY_TYPES = [
        (TEXT, "Text"),
        (AUDIO, "Audio"),
        (VIDEO, "Video"),
        (QUESTION, "Question"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_entries")
    entry_type = models.CharField(max_length=16, choices=ENTRY_TYPES, default=TEXT)
    content_text = models.TextField(blank=True, default="")
    media_file = models.FileField(upload_to="entries/", null=True, blank=True)
    mood = models.CharField(max_length=32, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"DailyEntry<{self.user.username}:{self.entry_type}>"


class ProfileAggregate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile_aggregate")
    pattern_profile = models.JSONField(default=dict, blank=True)
    shadow_profile = models.JSONField(default=dict, blank=True)
    value_gap_report = models.JSONField(default=dict, blank=True)
    future_self_thread = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"ProfileAggregate<{self.user.username}>"

