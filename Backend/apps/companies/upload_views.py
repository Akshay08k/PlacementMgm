import cloudinary
import cloudinary.uploader
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCompany
from apps.companies.models import CompanyProfile

class UploadCompanyImagesView(APIView):
    """
    Allows a company to upload an image to Cloudinary and adds its URL to the
    client_images list in their CompanyProfile.
    """
    permission_classes = [permissions.IsAuthenticated, IsCompany]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if "file" not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES["file"]

        if not hasattr(settings, "CLOUDINARY_STORAGE"):
            return Response(
                {"error": "Cloudinary is not configured on the backend."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_STORAGE["CLOUD_NAME"],
                api_key=settings.CLOUDINARY_STORAGE["API_KEY"],
                api_secret=settings.CLOUDINARY_STORAGE["API_SECRET"],
            )

            # Upload the image
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder="placement_mgm/company_images",
                resource_type="image",
            )
            file_url = upload_result.get("secure_url")

            if not file_url:
                return Response({"error": "Failed to upload image to Cloudinary"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            company_profile = request.user.company_profile
            
            # Append URL to the JSON list
            existing_images = company_profile.client_images or []
            existing_images.append(file_url)
            
            company_profile.client_images = existing_images
            company_profile.save(update_fields=["client_images"])

            return Response({
                "message": "Image uploaded successfully",
                "client_images": company_profile.client_images,
                "new_image_url": file_url,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RemoveCompanyImageView(APIView):
    """
    Remove an image from the client_images list.
    """
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request):
        image_url = request.data.get("image_url")
        if not image_url:
            return Response({"error": "No image_url provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            company_profile = request.user.company_profile
            existing_images = company_profile.client_images or []
            
            if image_url in existing_images:
                existing_images.remove(image_url)
                company_profile.client_images = existing_images
                company_profile.save(update_fields=["client_images"])
                
                return Response({
                    "message": "Image removed successfully",
                    "client_images": company_profile.client_images,
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Image not found in profile"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
