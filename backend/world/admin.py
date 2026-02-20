from django.contrib import admin
from .models import WorldState


@admin.register(WorldState)
class WorldStateAdmin(admin.ModelAdmin):
    list_display = ("user", "habit_consistency", "stress_level", "breakthroughs", "neglect", "updated_at")
    search_fields = ("user__username",)

