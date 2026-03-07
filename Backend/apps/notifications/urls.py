from django.urls import path
from .views import NotificationList, NotificationMarkRead

urlpatterns = [
    path("", NotificationList.as_view()),
    path("<int:pk>/read/", NotificationMarkRead.as_view()),
]
