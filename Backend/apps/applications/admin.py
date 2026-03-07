from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["student", "job", "status", "current_round", "applied_at"]
    list_filter = ["status", "current_round"]
    search_fields = ["student__full_name", "job__title"]
