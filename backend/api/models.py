from django.db import models

class Plant(models.Model):
    name = models.CharField(max_length=255)
    species = models.CharField(max_length=255)
    device_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=50,
        choices=[('thriving', 'Thriving'), ('struggling', 'Struggling'), ('failed', 'Failed')],
        default='thriving'
    )
    image = models.ImageField(upload_to='plants/', null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class SensorReading(models.Model):
    plant = models.ForeignKey(Plant, related_name='readings', on_delete=models.CASCADE)
    soil_moisture = models.FloatField()       # sensor 1 — %
    humidity = models.FloatField()            # sensor 2 — %
    soil_temperature = models.FloatField()    # sensor 3 — °C
    air_temperature = models.FloatField()     # sensor 4 — °C
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plant.name} — {self.recorded_at:%Y-%m-%d %H:%M}"


class AIAnalysis(models.Model):
    STAGE_CHOICES = [
        ('callus', 'Callus forming'),
        ('root_init', 'Root initiation'),
        ('root_est', 'Root establishment'),
        ('shoot', 'Shoot emergence'),
    ]
    plant = models.ForeignKey(Plant, related_name='analyses', on_delete=models.CASCADE)
    condition_score = models.IntegerField()           # 0–100
    survival_status = models.CharField(max_length=50) # Thriving / Struggling / Failed
    growth_stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    recommendation = models.TextField(blank=True)
    anomaly_detected = models.BooleanField(default=False)
    analysed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plant.name} — score {self.condition_score}"


class ActivityLog(models.Model):
    plant = models.ForeignKey(Plant, related_name='logs', on_delete=models.CASCADE, null=True, blank=True)
    event = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event