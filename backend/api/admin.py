from django.contrib import admin
from .models import Plant, SensorReading, AIAnalysis, ActivityLog

@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'status', 'connected_at')
    list_filter = ('status',)
    search_fields = ('name', 'species')

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('plant', 'soil_moisture', 'humidity', 'soil_temperature', 'air_temperature', 'recorded_at')
    list_filter = ('plant',)
    ordering = ('-recorded_at',)

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ('plant', 'condition_score', 'survival_status', 'growth_stage', 'anomaly_detected', 'analysed_at')
    list_filter = ('survival_status', 'growth_stage', 'anomaly_detected')
    ordering = ('-analysed_at',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('plant', 'event', 'date')
    list_filter = ('plant',)
    ordering = ('-date',)