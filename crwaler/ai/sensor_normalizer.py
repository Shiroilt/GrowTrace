class SensorNormalizer:

    def __init__(self):

        # ==================================================
        # TEMPORARY CALIBRATION VALUES
        # ==================================================
        #
        # These are placeholders for pipeline development.
        #
        # Later they MUST be replaced with calibration
        # values from your actual ESP32 sensors.
        # ==================================================

        self.soil_dry = 4095
        self.soil_wet = 0

        self.light_dark = 0
        self.light_bright = 4095

        self.water_dry = 0
        self.water_wet = 4095

    # =====================================================
    # Utility
    # =====================================================

    def clamp(self, value, minimum=0, maximum=100):

        return max(
            minimum,
            min(maximum, value)
        )

    # =====================================================
    # Soil Moisture
    # =====================================================

    def soil_moisture_percent(self, raw):

        if raw is None:
            return None

        denominator = (
            self.soil_dry - self.soil_wet
        )

        if denominator == 0:
            return None

        percentage = (
            (self.soil_dry - raw)
            / denominator
        ) * 100

        return round(
            self.clamp(percentage),
            2
        )

    # =====================================================
    # Light
    # =====================================================

    def light_percent(self, raw):

        if raw is None:
            return None

        denominator = (
            self.light_bright - self.light_dark
        )

        if denominator == 0:
            return None

        percentage = (
            (raw - self.light_dark)
            / denominator
        ) * 100

        return round(
            self.clamp(percentage),
            2
        )

    # =====================================================
    # Water Sensor
    # =====================================================

    def water_percent(self, raw):

        if raw is None:
            return None

        denominator = (
            self.water_wet - self.water_dry
        )

        if denominator == 0:
            return None

        percentage = (
            (raw - self.water_dry)
            / denominator
        ) * 100

        return round(
            self.clamp(percentage),
            2
        )

    # =====================================================
    # Normalize Complete Reading
    # =====================================================

    def normalize_reading(self, reading):

        normalized = reading.copy()

        normalized["soil_moisture_percent"] = (
            self.soil_moisture_percent(
                reading.get("soil_raw")
            )
        )

        normalized["light_percent"] = (
            self.light_percent(
                reading.get("light_raw")
            )
        )

        normalized["water_percent"] = (
            self.water_percent(
                reading.get("water_raw")
            )
        )

        return normalized

    # =====================================================
    # Normalize Multiple Readings
    # =====================================================

    def normalize_readings(self, readings):

        return [
            self.normalize_reading(reading)
            for reading in readings
        ]


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    normalizer = SensorNormalizer()

    test = {

        "soil_raw": 1861,
        "light_raw": 834,
        "water_raw": 0

    }

    result = normalizer.normalize_reading(
        test
    )

    print("\n" + "=" * 60)
    print("GROWTRACE SENSOR NORMALIZER")
    print("=" * 60)

    for key, value in result.items():

        print(
            f"{key:25} : {value}"
        )

    print("=" * 60)
