class VirtualSensorEngine:

    def __init__(self):
        pass

    # =====================================================
    # Utility
    # =====================================================

    def clamp(self, value, minimum=0, maximum=100):

        return max(
            minimum,
            min(maximum, value)
        )

    # =====================================================
    # Soil Oxygen Index (SOI)
    # =====================================================

    def soil_oxygen_index(self, moisture_percent):

        if moisture_percent is None:
            return None

        soi = 100 - moisture_percent

        return round(
            self.clamp(soi),
            2
        )

    # =====================================================
    # Root Development Index (RDI)
    # =====================================================

    def root_development_index(
        self,
        moisture_score,
        humidity_score,
        temperature_score
    ):

        if (
            moisture_score is None
            or humidity_score is None
            or temperature_score is None
        ):
            return None

        rdi = (
            (0.4 * moisture_score)
            +
            (0.3 * humidity_score)
            +
            (0.3 * temperature_score)
        )

        return round(
            self.clamp(rdi),
            2
        )

    # =====================================================
    # Root Rot Index (RRI)
    # =====================================================

    def root_rot_index(
        self,
        moisture_percent,
        temperature,
        wet_hours
    ):

        if (
            moisture_percent is None
            or temperature is None
            or wet_hours is None
        ):
            return None

        risk = 0

        # High moisture contribution
        if moisture_percent > 80:
            risk += 40

        # High temperature contribution
        if temperature > 30:
            risk += 20

        # Duration contribution
        if wet_hours >= 72:
            risk += 40

        elif wet_hours >= 48:
            risk += 25

        elif wet_hours >= 24:
            risk += 10

        return self.clamp(risk)

    # =====================================================
    # Environmental Stability Index (ESI)
    # =====================================================

    def environmental_stability_index(
        self,
        moisture_stability,
        temperature_stability,
        humidity_stability,
        light_stability
    ):

        values = [
            moisture_stability,
            temperature_stability,
            humidity_stability,
            light_stability
        ]

        # Remove unavailable values
        valid_values = [
            value
            for value in values
            if value is not None
        ]

        if not valid_values:
            return None

        esi = sum(valid_values) / len(valid_values)

        return round(esi, 2)
    # =====================================================
    # Fungal Risk Index (FRI)
    # =====================================================

    def fungal_risk_index(
        self,
        humidity,
        moisture_percent,
        temperature
    ):

        if (
            humidity is None
            or moisture_percent is None
            or temperature is None
        ):
            return None

        risk = 0

        if humidity > 80:
            risk += 40

        if moisture_percent > 75:
            risk += 40

        # Temperature contribution.
        # This is intentionally broad/general for now.
        if 20 <= temperature <= 35:
            risk += 20

        return self.clamp(risk)

    # =====================================================
    # Waterlogging Index (WLI)
    # =====================================================

    def waterlogging_index(
        self,
        moisture_percent,
        wet_hours
    ):

        if (
            moisture_percent is None
            or wet_hours is None
        ):
            return None

        risk = 0

        if moisture_percent > 80:
            risk += 50

        if wet_hours >= 72:
            risk += 50

        elif wet_hours >= 48:
            risk += 35

        elif wet_hours >= 24:
            risk += 20

        return self.clamp(risk)
    # =====================================================
    # Water Stress Index (WSI)
    # =====================================================

    def water_stress_index(
        self,
        moisture,
        temperature
    ):

        if moisture is None or temperature is None:
            return None

        # Keep moisture within valid percentage range
        moisture = max(
            0,
            min(100, moisture)
        )

        # Dryness:
        # 0   = fully wet
        # 100 = completely dry
        dryness = 100 - moisture

        # Temperature stress factor
        #
        # <= 20°C -> little heat contribution
        # 40°C+   -> maximum heat contribution
        temperature_factor = (
            (temperature - 20) / 20
        )

        temperature_factor = max(
            0,
            min(1, temperature_factor)
        )

        # Combine dryness and temperature
        wsi = (
            dryness
            * temperature_factor
        )

        return round(
            max(0, min(100, wsi)),
            2
        )
    
    # =====================================================
    # Heat Stress Index (HSI)
    # =====================================================

    def heat_stress_index(
        self,
        temperature,
        ideal_max=30,
        critical_temp=40
    ):

        if temperature is None:
            return None

        # No heat stress inside/below ideal range
        if temperature <= ideal_max:
            return 0

        # Critical temperature = maximum stress
        if temperature >= critical_temp:
            return 100

        # Scale temperature between ideal_max and
        # critical_temp into 0-100
        stress = (
            (temperature - ideal_max)
            /
            (critical_temp - ideal_max)
        ) * 100

        return round(
            max(0, min(100, stress)),
            2
        )
    # =====================================================
    # Root Suffocation Index (RSI)
    # =====================================================

    def root_suffocation_index(
        self,
        soil_oxygen_index,
        waterlogging_index
    ):

        if (
            soil_oxygen_index is None
            or waterlogging_index is None
        ):
            return None

        oxygen_risk = (
            100 - soil_oxygen_index
        )

        rsi = (
            (0.5 * oxygen_risk)
            +
            (0.5 * waterlogging_index)
        )

        return round(
            self.clamp(rsi),
            2
        )

    # =====================================================
    # Stability Index
    # =====================================================

    def stability_index(self, values):

        values = [
            value
            for value in values
            if value is not None
        ]

        if len(values) < 2:
            return None

        average = (
            sum(values) / len(values)
        )

        if average == 0:
            return 100

        variance = sum(
            (value - average) ** 2
            for value in values
        ) / len(values)

        standard_deviation = (
            variance ** 0.5
        )

        variation_percent = (
            standard_deviation
            / abs(average)
        ) * 100

        stability = (
            100 - variation_percent
        )

        return round(
            self.clamp(stability),
            2
        )

    # =====================================================
    # AI Confidence Score
    # =====================================================

    def confidence_score(
        self,
        valid_sensor_ratio,
        history_ratio
    ):

        valid_sensor_ratio = self.clamp(
            valid_sensor_ratio
        )

        history_ratio = self.clamp(
            history_ratio
        )

        confidence = (
            (0.7 * valid_sensor_ratio)
            +
            (0.3 * history_ratio)
        )

        return round(
            self.clamp(confidence),
            2
        )
    # =====================================================
    # Disease Risk Index (DRI)
    # =====================================================

    def disease_risk_index(
        self,
        root_rot_index,
        fungal_risk_index,
        waterlogging_index,
        heat_stress_index,
        water_stress_index
    ):

        values = [
            root_rot_index,
            fungal_risk_index,
            waterlogging_index,
            heat_stress_index,
            water_stress_index
        ]

        # If required information is unavailable,
        # do not produce a misleading score.
        if any(value is None for value in values):
            return None

        dri = (
            (root_rot_index * 0.30)
            +
            (fungal_risk_index * 0.30)
            +
            (waterlogging_index * 0.20)
            +
            (heat_stress_index * 0.10)
            +
            (water_stress_index * 0.10)
        )

        return round(
            max(0, min(100, dri)),
            2
        )

# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    engine = VirtualSensorEngine()

    print("\n" + "=" * 60)

    print("GROWTRACE VIRTUAL SENSOR ENGINE")

    print("=" * 60)

    moisture = 90

    temperature = 32

    humidity = 85

    wet_hours = 72

    soi = engine.soil_oxygen_index(
        moisture
    )

    rri = engine.root_rot_index(
        moisture,
        temperature,
        wet_hours
    )

    fri = engine.fungal_risk_index(
        humidity,
        moisture,
        temperature
    )

    wli = engine.waterlogging_index(
        moisture,
        wet_hours
    )

    rsi = engine.root_suffocation_index(
        soi,
        wli
    )

    print(
        "\nSoil Oxygen Index      :",
        soi
    )

    print(
        "Root Rot Index         :",
        rri
    )

    print(
        "Fungal Risk Index      :",
        fri
    )

    print(
        "Waterlogging Index     :",
        wli
    )

    print(
        "Root Suffocation Index :",
        rsi
    )

    print("\n" + "=" * 60)
