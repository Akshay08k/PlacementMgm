"""
Custom User model with role-based access (Student, TPO/Admin, Company).
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        TPO = "tpo", "TPO / Placement Officer"
        COMPANY = "company", "Company / Recruiter"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_tpo_or_admin(self):
        return self.role in (self.Role.TPO, self.Role.ADMIN)

    @property
    def is_company(self):
        return self.role == self.Role.COMPANY
