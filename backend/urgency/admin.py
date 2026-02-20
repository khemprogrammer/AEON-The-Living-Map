from django.contrib import admin
from .models import Wish, SlowPost


@admin.register(Wish)
class WishAdmin(admin.ModelAdmin):
    list_display = ("user", "text", "postpone_count", "created_at")
    search_fields = ("user__username", "text")


@admin.register(SlowPost)
class SlowPostAdmin(admin.ModelAdmin):
    list_display = ("recipient_name", "unlock_date", "opened", "created_by", "created_at")

