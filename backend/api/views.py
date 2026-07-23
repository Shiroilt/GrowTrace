from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Plant, SensorReading, AIAnalysis, ActivityLog
from .serializers import (
    PlantDetailSerializer,
    SensorReadingSerializer,
    AIAnalysisSerializer,
    ActivityLogSerializer,
)


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.prefetch_related('readings', 'logs', 'analyses').all()
    serializer_class = PlantDetailSerializer

    @action(detail=True, methods=['get'], url_path='analysis')
    def analysis(self, request, pk=None):
        latest = AIAnalysis.objects.filter(plant_id=pk).order_by('-analysed_at').first()
        if not latest:
            return Response({'detail': 'No analysis found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AIAnalysisSerializer(latest).data)

    @action(detail=True, methods=['get'], url_path='readings')
    def readings(self, request, pk=None):
        readings = SensorReading.objects.filter(plant_id=pk).order_by('-recorded_at')[:50]
        return Response(SensorReadingSerializer(readings, many=True).data)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.select_related('plant').order_by('-date')
    serializer_class = ActivityLogSerializer