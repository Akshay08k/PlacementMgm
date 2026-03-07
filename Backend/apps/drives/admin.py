from django.contrib import admin
from .models import Drive


@admin.register(Drive)
class DriveAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "drive_date", "created_at"]
    list_filter = ["drive_date"]
    search_fields = ["title", "company__name"]
