from rest_framework import serializers
from .models import Plant, SensorReading, AIAnalysis, ActivityLog

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = ['soil_moisture', 'humidity', 'soil_temperature', 'air_temperature', 'recorded_at']

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'event', 'date']

class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ['condition_score', 'survival_status', 'growth_stage', 'recommendation', 'anomaly_detected', 'analysed_at']

class PlantDetailSerializer(serializers.ModelSerializer):
    readings = SensorReadingSerializer(many=True, read_only=True)
    logs = ActivityLogSerializer(many=True, read_only=True)

    class Meta:
        model = Plant
        fields = ['id', 'name', 'species', 'status', 'image', 'description', 'connected_at', 'readings', 'logs']