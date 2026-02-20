from django.contrib import admin
from .models import VaultGrant


@admin.register(VaultGrant)
class VaultGrantAdmin(admin.ModelAdmin):
    list_display = ("owner", "recipient_email", "release_date", "created_at")

