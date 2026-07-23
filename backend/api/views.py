from rest_framework import viewsets, status
from rest_framework.decorators import action
from crwaler.ai.firebase_client import FirebaseClient
from rest_framework.response import Response
from .models import Plant, SensorReading, AIAnalysis, ActivityLog
from .serializers import (
    PlantDetailSerializer,
    SensorReadingSerializer,
    AIAnalysisSerializer,
    ActivityLogSerializer,
)
firebase = FirebaseClient()

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
    
    @action(detail=True, methods=['get'], url_path='sensors')
    def sensors(self, request, pk=None):

        plant = self.get_object()

        if not plant.device_id:
            return Response(
                {
                    "success": False,
                    "message": "No Firebase device ID assigned to this plant."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            readings = firebase.get_recent_readings(
                device_id=plant.device_id,
                limit=50
            )

            return Response({
                "success": True,
                "plant_id": plant.id,
                "plant_name": plant.name,
                "device_id": plant.device_id,
                "count": len(readings),
                "readings": readings
            })

        except Exception as e:

            return Response(
                {
                    "success": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.select_related('plant').order_by('-date')
    serializer_class = ActivityLogSerializer