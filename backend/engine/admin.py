from django.contrib import admin
from .models import DailyEntry, ProfileAggregate


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display = ("user", "entry_type", "mood", "created_at")
    list_filter = ("entry_type",)
    search_fields = ("user__username", "content_text")


@admin.register(ProfileAggregate)
class ProfileAggregateAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")

