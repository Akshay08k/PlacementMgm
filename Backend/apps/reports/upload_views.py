import os
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTPOOrAdmin
from apps.students.upload_views import get_cloudinary_upload

class UploadResourceFileView(APIView):
    """
    TPO uploads resource file (PDF, etc); returns Cloudinary URL.
    """
    permission_classes = [permissions.IsAuthenticated, IsTPOOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No file parameter found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        upload = get_cloudinary_upload()
        if not upload:
            return Response(
                {"error": "Cloudinary not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
            
        try:
            # We can use resource_type="auto" so Cloudinary auto-detects pdf/image
            result = upload(
                file,
                resource_type="auto",
                folder="placement_portal/resources",
                use_filename=True,
                unique_filename=True,
            )
            
            url = result.get("secure_url") or result.get("url")
            if not url:
                return Response(
                    {"error": "Upload failed, no URL returned."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            return Response({"url": url})
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
