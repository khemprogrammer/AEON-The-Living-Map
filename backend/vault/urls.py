from django.urls import path
from .views import VaultSnapshotView, VaultGrantListCreate

urlpatterns = [
    path("snapshot/", VaultSnapshotView.as_view(), name="vault-snapshot"),
    path("grants/", VaultGrantListCreate.as_view(), name="vault-grants"),
]

