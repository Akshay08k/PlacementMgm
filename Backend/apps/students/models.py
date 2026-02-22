from django.db import models
from django.conf import settings


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    enrollment_number = models.CharField(max_length=50, unique=True)
    branch = models.CharField(max_length=100)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2)
    graduation_year = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email