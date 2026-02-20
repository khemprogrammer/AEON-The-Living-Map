from django.db import models
from django.contrib.auth.models import User


class VaultGrant(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vault_grants")
    recipient_email = models.EmailField()
    release_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"VaultGrant<{self.owner.username}:{self.recipient_email}>"

