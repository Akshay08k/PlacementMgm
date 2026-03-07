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
            "audience",
            "created_at",
        ]


class InstituteConfigSerializer(serializers.ModelSerializer):
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
        ]


