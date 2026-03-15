from rest_framework import serializers

from .models import Resource, InstituteConfig


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "link",
            "resource_type",
            "audience",
            "created_at",
        ]


class InstituteConfigSerializer(serializers.ModelSerializer):
    logo_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = InstituteConfig
        fields = [
            "id",
            "name",
            "short_name",
            "logo_url",
            "support_email",
            "placement_email",
            "primary_color",
            "students_count",
            "students_every_year",
            "partner_companies",
            "placement_rate",
            "opportunities",
            "address",
            "contact_phone",
        ]


