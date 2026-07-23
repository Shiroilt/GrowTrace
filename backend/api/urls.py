from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'plants', PlantViewSet, basename='plant')
router.register(r'logs', ActivityLogViewSet, basename='log')

urlpatterns = [
    path('', include(router.urls)),
]