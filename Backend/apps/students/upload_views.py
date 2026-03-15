"""
Cloudinary file upload and resume PDF generation.
"""
import io
from django.http import HttpResponse
from django.conf import settings as django_settings
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from apps.accounts.permissions import IsStudent
from apps.students.models import StudentProfile


def configure_cloudinary():
    """
    Configure Cloudinary using env-backed Django settings.
    Returns True when configuration is present and applied.
    """
    cloud_name = getattr(django_settings, "CLOUDINARY_CLOUD_NAME", "") or ""
    api_key = getattr(django_settings, "CLOUDINARY_API_KEY", "") or ""
    api_secret = getattr(django_settings, "CLOUDINARY_API_SECRET", "") or ""
    if not (cloud_name and api_key and api_secret):
        return False
    try:
        import cloudinary

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        return True
    except Exception:
        return False


def get_cloudinary_upload():
    try:
        import cloudinary.uploader
        if not configure_cloudinary():
            return None
        return cloudinary.uploader.upload
    except ImportError:
        return None


class UploadResumeView(APIView):
    """Student uploads resume file; returns Cloudinary URL."""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No file. Use multipart form key 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        upload = get_cloudinary_upload()
        if not upload:
            return Response(
                {"error": "Cloudinary not configured. Set CLOUDINARY_* env."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            result = upload(
                file,
                resource_type="raw",
                folder="placement_portal/resumes",
                use_filename=True,
                unique_filename=True,
            )
            url = result.get("secure_url") or result.get("url")
            if not url:
                return Response({"error": "Upload failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            profile = StudentProfile.objects.get(user=request.user)
            profile.resume_url = url
            profile.save(update_fields=["resume_url"])
            return Response({"url": url, "resume_url": url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UploadProfilePictureView(APIView):
    """Student uploads profile picture; returns Cloudinary URL."""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No file. Use multipart form key 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        upload = get_cloudinary_upload()
        if not upload:
            return Response(
                {"error": "Cloudinary not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            result = upload(
                file,
                resource_type="image",
                folder="placement_portal/avatars",
                use_filename=True,
                unique_filename=True,
            )
            url = result.get("secure_url") or result.get("url")
            if not url:
                return Response({"error": "Upload failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            profile = StudentProfile.objects.get(user=request.user)
            profile.profile_picture = url
            profile.save(update_fields=["profile_picture"])
            return Response({"url": url, "profile_picture": url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class GenerateResumePDFView(APIView):
    """Generate and download PDF resume from student profile."""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        profile = StudentProfile.objects.select_related("user", "department", "course").get(
            user=request.user
        )
        template = request.query_params.get("template", "classic").lower()
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch,
        )
        styles = getSampleStyleSheet()
        story = []

        if template == "modern":
            title_style = ParagraphStyle(
                name="Title",
                parent=styles["Heading1"],
                fontSize=22,
                spaceAfter=6,
            )
            subtitle_style = ParagraphStyle(
                name="Subtitle",
                parent=styles["Normal"],
                fontSize=10,
                textColor="#555555",
            )
            section_title = ParagraphStyle(
                name="SectionTitle",
                parent=styles["Heading2"],
                fontSize=13,
                spaceBefore=10,
                spaceAfter=4,
            )

            story.append(Paragraph(profile.full_name or "Resume", title_style))
            contact_bits = [
                bit
                for bit in [
                    profile.user.email or "",
                    profile.phone or "",
                    profile.location or "",
                ]
                if bit
            ]
            if contact_bits:
                story.append(Paragraph(" | ".join(contact_bits), subtitle_style))
            story.append(HRFlowable(width="100%", color="#999999"))

            story.append(Paragraph("Personal Details", section_title))
            personal_rows = [
                ["Enrollment No.", profile.enrollment_number or "-"],
                ["Roll No.", profile.roll_number or "-"],
                [
                    "Date of Birth",
                    profile.date_of_birth.strftime("%d-%m-%Y")
                    if profile.date_of_birth
                    else "-",
                ],
                ["Gender", profile.get_gender_display() if profile.gender else "-"],
                ["Address", profile.current_address or "-"],
            ]
            pt = Table(personal_rows, colWidths=[2.2 * inch, 3.8 * inch])
            pt.setStyle(
                TableStyle(
                    [
                        ("GRID", (0, 0), (-1, -1), 0.25, (0.6, 0.6, 0.6)),
                        ("BACKGROUND", (0, 0), (0, -1), (0.95, 0.95, 0.95)),
                    ]
                )
            )
            story.append(pt)

            story.append(Paragraph("Education", section_title))
            edu_rows = [
                ["Course", profile.course.name if profile.course else "-"],
                ["Department", profile.department.name if profile.department else "-"],
                ["Passing Year", str(profile.passing_year or "-")],
                ["Current CGPA", str(profile.current_cgpa or "-")],
                ["10th Marks", str(profile.marks_10th or "-")],
                ["12th Marks", str(profile.marks_12th or "-")],
            ]
            et = Table(edu_rows, colWidths=[2.2 * inch, 3.8 * inch])
            et.setStyle(
                TableStyle(
                    [
                        ("GRID", (0, 0), (-1, -1), 0.25, (0.6, 0.6, 0.6)),
                        ("BACKGROUND", (0, 0), (0, -1), (0.97, 0.97, 0.97)),
                    ]
                )
            )
            story.append(et)

            if profile.skills:
                story.append(Paragraph("Skills", section_title))
                story.append(
                    Paragraph(
                        profile.skills.replace("\n", "<br/>"), styles["Normal"]
                    )
                )

            if profile.education_history:
                story.append(Paragraph("Education / Experience", section_title))
                story.append(
                    Paragraph(
                        profile.education_history.replace("\n", "<br/>"),
                        styles["Normal"],
                    )
                )

        else: 
            title_style = ParagraphStyle(
                name="Title",
                parent=styles["Heading1"],
                fontSize=18,
                spaceAfter=12,
            )
            story.append(Paragraph(profile.full_name or "Resume", title_style))
            story.append(Paragraph(profile.user.email or "", styles["Normal"]))
            if profile.phone:
                story.append(Paragraph(profile.phone, styles["Normal"]))
            story.append(Spacer(1, 12))

            story.append(Paragraph("Personal Details", styles["Heading2"]))
            personal = [
                ["Enrollment No.", profile.enrollment_number or "-"],
                ["Roll No.", profile.roll_number or "-"],
                [
                    "Date of Birth",
                    profile.date_of_birth.strftime("%d-%m-%Y")
                    if profile.date_of_birth
                    else "-",
                ],
                ["Gender", profile.get_gender_display() if profile.gender else "-"],
                ["Location", profile.location or "-"],
                ["Address", profile.current_address or "-"],
            ]
            pt = Table(personal, colWidths=[2 * inch, 4 * inch])
            pt.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), (0.9, 0.9, 0.9)),
                        ("GRID", (0, 0), (-1, -1), 0.5, (0, 0, 0)),
                    ]
                )
            )
            story.append(pt)
            story.append(Spacer(1, 12))

            story.append(Paragraph("Academic Details", styles["Heading2"]))
            data = [
                ["Course", profile.course.name if profile.course else "-"],
                ["Department", profile.department.name if profile.department else "-"],
                [
                    "Passing Year",
                    str(profile.passing_year) if profile.passing_year else "-",
                ],
                [
                    "Current CGPA",
                    str(profile.current_cgpa) if profile.current_cgpa else "-",
                ],
                ["10th Marks", str(profile.marks_10th) if profile.marks_10th else "-"],
                ["12th Marks", str(profile.marks_12th) if profile.marks_12th else "-"],
                ["Diploma Marks", str(profile.diploma_marks) if profile.diploma_marks else "-"],
            ]
            t = Table(data, colWidths=[2 * inch, 4 * inch])
            t.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), (0.95, 0.95, 0.95)),
                        ("GRID", (0, 0), (-1, -1), 0.5, (0, 0, 0)),
                    ]
                )
            )
            story.append(t)
            story.append(Spacer(1, 12))

            if profile.skills:
                story.append(Paragraph("Skills", styles["Heading2"]))
                story.append(
                    Paragraph(
                        profile.skills.replace("\n", "<br/>"), styles["Normal"]
                    )
                )

            if profile.education_history:
                story.append(Paragraph("Education / Experience", styles["Heading2"]))
                story.append(
                    Paragraph(
                        profile.education_history.replace("\n", "<br/>"),
                        styles["Normal"],
                    )
                )

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="resume_{profile.roll_number}.pdf"'
        return response
