from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/world/", include("world.urls")),
    path("api/engine/", include("engine.urls")),
    path("api/human/", include("human.urls")),
    path("api/urgency/", include("urgency.urls")),
    path("api/vault/", include("vault.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

