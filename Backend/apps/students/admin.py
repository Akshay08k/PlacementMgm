from django.contrib import admin
from .models import Course, Department, StudentProfile


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]
    search_fields = ["name", "code"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["name", "code"]
    search_fields = ["name", "code"]


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ["full_name", "roll_number", "department", "placement_status", "created_at"]
    list_filter = ["placement_status", "department", "course"]
    search_fields = ["full_name", "roll_number", "user__email"]
