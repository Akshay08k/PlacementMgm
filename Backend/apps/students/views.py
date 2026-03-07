import io
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.views import APIView
import openpyxl

from apps.accounts.permissions import IsTPOOrAdmin, IsStudent
from apps.students.models import Course, Department, StudentProfile
from apps.accounts.models import User
from .serializers import (
    CourseSerializer,
    DepartmentSerializer,
    StudentProfileListSerializer,
    StudentProfileSerializer,
)


class DepartmentListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all()


class CourseListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    serializer_class = CourseSerializer
    queryset = Course.objects.all()


class StudentProfileList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentProfileListSerializer
    queryset = StudentProfile.objects.select_related("user", "department", "course")

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_student:
            return qs.filter(user=self.request.user)
        return qs


class StudentProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentProfileSerializer

    def get_queryset(self):
        if self.request.user.is_student:
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.all()

    def get_object(self):
        if self.request.user.is_student:
            return StudentProfile.objects.get(user=self.request.user)
        return super().get_object()


class StudentProfileMe(generics.RetrieveUpdateAPIView):
    """Current student's own profile (no pk in URL)."""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    serializer_class = StudentProfileSerializer

    def get_object(self):
        return StudentProfile.objects.get(user=self.request.user)


class StudentExcelImport(APIView):
    """TPO uploads Excel to bulk create students. Columns: email, full_name, phone, roll_number, department_id, course_id, passing_year, marks_10th, marks_12th, current_cgpa, skills."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    parser_classes = [FileUploadParser]

    def post(self, request, format=None):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No file provided. Use multipart form key 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not file.name.endswith((".xlsx", ".xls")):
            return Response(
                {"error": "Only .xlsx or .xls files are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            wb = openpyxl.load_workbook(io.BytesIO(file.read()), read_only=True)
            ws = wb.active
            rows = list(ws.iter_rows(min_row=2, values_only=True))
        except Exception as e:
            return Response(
                {"error": f"Invalid Excel file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = 0
        errors = []
        for i, row in enumerate(rows):
            if not row or all(c is None for c in row):
                continue
            try:
                email = str(row[0]).strip() if row[0] else None
                full_name = str(row[1]).strip() if row[1] else None
                roll_number = str(row[3]).strip() if len(row) > 3 and row[3] else None
                if not email or not full_name or not roll_number:
                    errors.append({"row": i + 2, "error": "Missing email, full_name or roll_number"})
                    continue
                if User.objects.filter(email=email).exists():
                    errors.append({"row": i + 2, "error": f"Email already exists: {email}"})
                    continue
                if StudentProfile.objects.filter(roll_number=roll_number).exists():
                    errors.append({"row": i + 2, "error": f"Roll number already exists: {roll_number}"})
                    continue
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=User.objects.make_random_password(length=16),
                    role=User.Role.STUDENT,
                )
                dep_id = int(row[4]) if len(row) > 4 and row[4] is not None else None
                course_id = int(row[5]) if len(row) > 5 and row[5] is not None else None
                StudentProfile.objects.create(
                    user=user,
                    full_name=full_name,
                    roll_number=roll_number,
                    phone=str(row[2]).strip() if len(row) > 2 and row[2] else "",
                    department_id=dep_id if dep_id else None,
                    course_id=course_id if course_id else None,
                    passing_year=int(row[6]) if len(row) > 6 and row[6] is not None else None,
                    marks_10th=float(row[7]) if len(row) > 7 and row[7] is not None else None,
                    marks_12th=float(row[8]) if len(row) > 8 and row[8] is not None else None,
                    current_cgpa=float(row[9]) if len(row) > 9 and row[9] is not None else None,
                    skills=str(row[10]).strip() if len(row) > 10 and row[10] else "",
                )
                created += 1
            except Exception as e:
                errors.append({"row": i + 2, "error": str(e)})

        return Response({
            "created": created,
            "errors": errors,
        }, status=status.HTTP_200_OK)


class TriggerStudentVerificationEmails(APIView):
    """Queue sending verification emails to all students (TPO only)."""
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]

    def post(self, request):
        try:
            from apps.notifications.tasks import send_student_verification_emails
            send_student_verification_emails.delay()
        except ImportError:
            from django.core.mail import send_mail
            for profile in StudentProfile.objects.select_related("user"):
                send_mail(
                    "Verify your placement portal data",
                    f"Hello {profile.full_name},\n\nPlease verify your data on the placement portal. If anything is incorrect, contact the TPO.\n\nRoll: {profile.roll_number}\nEmail: {profile.user.email}",
                    None,
                    [profile.user.email],
                    fail_silently=True,
                )
        return Response({"detail": "Verification emails queued."}, status=status.HTTP_200_OK)


class StudentBanAPIView(APIView):
    """
    TPO/Admin can ban or unban a student (controls User.is_active).
    """

    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]

    def post(self, request, pk):
        banned = bool(request.data.get("banned", True))
        try:
            profile = StudentProfile.objects.select_related("user").get(pk=pk)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        profile.user.is_active = not banned
        profile.user.save(update_fields=["is_active"])
        return Response(
            {"id": profile.id, "banned": banned, "is_active": profile.user.is_active},
            status=status.HTTP_200_OK,
        )

