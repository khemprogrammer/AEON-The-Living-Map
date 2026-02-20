from django.db import models
from django.contrib.auth.models import User


class GlobalDilemma(models.Model):
    question_text = models.TextField()
    created_at = models.DateField(auto_now_add=True)
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"Dilemma<{self.created_at}>"


class DilemmaVote(models.Model):
    dilemma = models.ForeignKey(GlobalDilemma, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dilemma_votes")
    choice = models.CharField(max_length=32)
    reasoning = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("dilemma", "user")


class StrangerMission(models.Model):
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="missions_created")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="missions_assigned")
    assigned_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Mission<{self.id}>"


class FrequencyMatch(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="frequency_match")
    match_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="matched_by")
    score = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Match<{self.user.username}->{getattr(self.match_user,'username',None)}>"

