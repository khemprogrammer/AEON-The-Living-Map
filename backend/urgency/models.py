from django.db import models
from django.contrib.auth.models import User


class Wish(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishes")
    text = models.CharField(max_length=255)
    postpone_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Wish<{self.user.username}:{self.text[:20]}>"


class SlowPost(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="slowposts")
    recipient_name = models.CharField(max_length=128, blank=True, default="")
    recipient_email = models.EmailField(blank=True, default="")
    unlock_date = models.DateField()
    content = models.TextField()
    opened = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"SlowPost<{self.id}>"

