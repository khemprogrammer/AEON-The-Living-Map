from django.db import models
from django.contrib.auth.models import User


class WorldState(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="world_state")
    habit_consistency = models.FloatField(default=0.5)
    stress_level = models.FloatField(default=0.5)
    breakthroughs = models.PositiveIntegerField(default=0)
    neglect = models.FloatField(default=0.0)
    terrain_seed = models.PositiveIntegerField(default=42)
    notes = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"WorldState<{self.user.username}>"

