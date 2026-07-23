from ai.firebase_client import FirebaseClient
from ai.sensor_normalizer import SensorNormalizer
from ai.virtual_sensor_engine import VirtualSensorEngine
from ai.risk_decision_engine import RiskDecisionEngine

class SensorAnalyzer:

    def __init__(self):

        self.firebase = FirebaseClient()
        self.normalizer = SensorNormalizer()
        self.virtual_engine = VirtualSensorEngine()
        self.risk_engine = RiskDecisionEngine()
    # =====================================================
    # Remove / Detect Invalid Sensor Values
    # =====================================================

    def clean_readings(self, readings):

        cleaned = []

        invalid_count = 0

        for reading in readings:

            reading = reading.copy()

            # ---------------------------------------------
            # DS18B20 error value
            # -127°C normally means sensor disconnected
            # or failed reading.
            # ---------------------------------------------

            water_temp = reading.get("water_temp")

            if water_temp == -127:
                reading["water_temp"] = None
                reading["water_temp_error"] = True
                invalid_count += 1
            else:
                reading["water_temp_error"] = False

            cleaned.append(reading)

        return cleaned, invalid_count

    # =====================================================
    # Calculate Statistics
    # =====================================================

    def calculate_statistics(self, readings):

        sensor_fields = [
            "air_temp",
            "humidity",
            "soil_raw",
            "light_raw",
            "water_raw",
            "water_temp"
        ]

        statistics = {}

        for field in sensor_fields:

            values = []

            for reading in readings:

                value = reading.get(field)

                if value is not None:
                    values.append(value)

            if not values:
                statistics[field] = {
                    "count": 0,
                    "average": None,
                    "minimum": None,
                    "maximum": None
                }

                continue

            statistics[field] = {

                "count": len(values),

                "average": round(
                    sum(values) / len(values),
                    2
                ),

                "minimum": min(values),

                "maximum": max(values)
            }

        return statistics

    # =====================================================
    # Detect Trend
    # =====================================================

    def calculate_trend(self, readings, field):

        values = []

        for reading in readings:

            value = reading.get(field)

            if value is not None:
                values.append(value)

        if len(values) < 2:
            return "unknown"

        # Compare first portion with last portion instead
        # of only comparing two individual readings.

        split = max(1, len(values) // 3)

        first_values = values[:split]

        last_values = values[-split:]

        first_average = (
            sum(first_values) / len(first_values)
        )

        last_average = (
            sum(last_values) / len(last_values)
        )

        difference = last_average - first_average

        # Different sensors use different scales,
        # so for now this is only a general trend.

        if abs(difference) < 0.5:
            return "stable"

        elif difference > 0:
            return "rising"

        else:
            return "falling"
    # =====================================================
    # Calculate Continuous Wet Duration
    # =====================================================

    def calculate_wet_hours(
        self,
        readings,
        wet_threshold=80,
        max_gap_minutes=15
    ):

        if not readings:
            return 0

        # ---------------------------------------------
        # Keep only usable readings
        # ---------------------------------------------

        valid_readings = [

            r for r in readings

            if r.get("timestamp") is not None

            and r.get(
                "soil_moisture_percent"
            ) is not None

        ]

        if len(valid_readings) < 2:
            return 0

        # ---------------------------------------------
        # Sort oldest -> newest
        # ---------------------------------------------

        valid_readings.sort(
            key=lambda x: x["timestamp"]
        )

        latest = valid_readings[-1]

        latest_moisture = latest[
            "soil_moisture_percent"
        ]

        # ---------------------------------------------
        # Latest soil is not wet
        # ---------------------------------------------

        if latest_moisture < wet_threshold:
            return 0

        latest_timestamp = latest[
            "timestamp"
        ]

        wet_start_timestamp = (
            latest_timestamp
        )

        previous_timestamp = (
            latest_timestamp
        )

        max_gap_seconds = (
            max_gap_minutes * 60
        )

        # ---------------------------------------------
        # Walk backwards
        # ---------------------------------------------

        for reading in reversed(
            valid_readings[:-1]
        ):

            current_timestamp = reading[
                "timestamp"
            ]

            moisture = reading[
                "soil_moisture_percent"
            ]

            # -----------------------------------------
            # Check missing-data gap
            # -----------------------------------------

            gap = (
                previous_timestamp
                - current_timestamp
            )

            if gap > max_gap_seconds:

                break

            # -----------------------------------------
            # Check moisture
            # -----------------------------------------

            if moisture < wet_threshold:

                break

            wet_start_timestamp = (
                current_timestamp
            )

            previous_timestamp = (
                current_timestamp
            )

        # ---------------------------------------------
        # Calculate duration
        # ---------------------------------------------

        duration_seconds = (
            latest_timestamp
            - wet_start_timestamp
        )

        wet_hours = (
            duration_seconds / 3600
        )

        return round(
            max(0, wet_hours),
            2
        )

    # =====================================================
    # Calculate Continuous Condition Duration
    # =====================================================

    def calculate_condition_hours(
        self,
        readings,
        field,
        condition,
        max_gap_minutes=15
    ):

        if not readings:
            return 0

        # Keep only readings containing the required data
        valid = [
            r for r in readings
            if r.get("timestamp") is not None
            and r.get(field) is not None
        ]

        if len(valid) < 2:
            return 0

        # Oldest -> newest
        valid.sort(
            key=lambda x: x["timestamp"]
        )

        latest = valid[-1]

        # If latest reading does NOT satisfy condition,
        # continuous duration is zero.
        if not condition(latest[field]):
            return 0

        latest_timestamp = latest["timestamp"]

        start_timestamp = latest_timestamp

        previous_timestamp = latest_timestamp

        max_gap_seconds = (
            max_gap_minutes * 60
        )

        # Walk backwards
        for reading in reversed(valid[:-1]):

            current_timestamp = reading["timestamp"]

            gap = (
                previous_timestamp
                - current_timestamp
            )

            # Missing-data gap
            if gap > max_gap_seconds:
                break

            # Condition stopped
            if not condition(reading[field]):
                break

            start_timestamp = current_timestamp

            previous_timestamp = current_timestamp

        duration_seconds = (
            latest_timestamp
            - start_timestamp
        )

        return round(
            max(0, duration_seconds / 3600),
            2
        )

    # =====================================================
    # Get Time-Based Sensor Window
    # =====================================================

    def get_time_window(
        self,
        readings,
        hours
    ):

        if not readings:
            return []

        # Keep readings that have timestamps
        valid = [
            r for r in readings
            if r.get("timestamp") is not None
        ]

        if not valid:
            return []

        # Sort oldest -> newest
        valid.sort(
            key=lambda x: x["timestamp"]
        )

        # Use newest sensor reading as reference time.
        # Do NOT use computer current time because
        # historical/test datasets may contain old timestamps.

        latest_timestamp = valid[-1]["timestamp"]

        window_start = (
            latest_timestamp
            - (hours * 3600)
        )

        window = [
            r for r in valid
            if r["timestamp"] >= window_start
        ]

        return window

    # =====================================================
    # Calculate Data Coverage
    # =====================================================

    def calculate_data_coverage(
        self,
        readings,
        hours,
        interval_minutes=5
    ):

        # Expected number of readings
        expected = int(
            (hours * 60) / interval_minutes
        )

        actual = len(readings)

        if expected <= 0:
            return {
                "actual": actual,
                "expected": 0,
                "coverage_percent": 0
            }

        coverage = (
            actual / expected
        ) * 100

        # Never allow > 100%
        coverage = min(
            coverage,
            100
        )

        return {

            "actual": actual,

            "expected": expected,

            "coverage_percent": round(
                coverage,
                2
            )
        }
    # =====================================================
    # Calculate Virtual Sensors
    # =====================================================

    def calculate_virtual_sensors(self, readings):

        if not readings:
            return {}

        latest = readings[-1]
        # =====================================================
        # Time-Based History Windows
        # =====================================================

        history_1h = self.get_time_window(
            readings,
            1
        )

        history_6h = self.get_time_window(
            readings,
            6
        )

        history_24h = self.get_time_window(
            readings,
            24
        )

        history_72h = self.get_time_window(
            readings,
            72
        )
        # =====================================================
        # ADD DATA COVERAGE HERE
        # =====================================================

        coverage_1h = self.calculate_data_coverage(
            history_1h,
            1
        )

        coverage_6h = self.calculate_data_coverage(
            history_6h,
            6
        )

        coverage_24h = self.calculate_data_coverage(
            history_24h,
            24
        )

        coverage_72h = self.calculate_data_coverage(
            history_72h,
            72
        )

        # =====================================================
        # AI Confidence Score
        # =====================================================

        ai_confidence = coverage_24h[
            "coverage_percent"
        ]

        if ai_confidence >= 90:
            confidence_level = "VERY HIGH"

        elif ai_confidence >= 75:
            confidence_level = "HIGH"

        elif ai_confidence >= 50:
            confidence_level = "MEDIUM"

        elif ai_confidence >= 25:
            confidence_level = "LOW"

        else:
            confidence_level = "VERY LOW"

        moisture = latest.get(
            "soil_moisture_percent"
        )

        temperature = latest.get(
            "air_temp"
        )

        humidity = latest.get(
            "humidity"
        )

        # ---------------------------------------------
        # Temporary wet duration
        # ---------------------------------------------
        #
        # We are NOT guessing wet_hours.
        # Proper timestamp-based duration calculation
        # will be added next.
        #

        wet_hours = self.calculate_condition_hours(
            readings,
            "soil_moisture_percent",
            lambda value: value >= 80
        )

        hot_hours = self.calculate_condition_hours(
            readings,
            "air_temp",
            lambda value: value >= 35
        )

        very_hot_hours = self.calculate_condition_hours(
            readings,
            "air_temp",
            lambda value: value >= 40
        )

        high_humidity_hours = self.calculate_condition_hours(
            readings,
            "humidity",
            lambda value: value >= 80
        )

        dry_hours = self.calculate_condition_hours(
            readings,
            "soil_moisture_percent",
             lambda value: value <= 20
        )

        low_humidity_hours = self.calculate_condition_hours(
            readings,
            "humidity",
            lambda value: value <= 30
        )

        # ---------------------------------------------
        # Soil Oxygen Index
        # ---------------------------------------------

        soi = self.virtual_engine.soil_oxygen_index(
            moisture
        )

        # ---------------------------------------------
        # Root Rot Index
        # ---------------------------------------------

        rri = self.virtual_engine.root_rot_index(
            moisture,
            temperature,
            wet_hours
        )

        # ---------------------------------------------
        # Fungal Risk Index
        # ---------------------------------------------

        fri = self.virtual_engine.fungal_risk_index(
            humidity,
            moisture,
            temperature
        )

        # ---------------------------------------------
        # Waterlogging Index
        # ---------------------------------------------

        wli = self.virtual_engine.waterlogging_index(
            moisture,
            wet_hours
        )

        # ---------------------------------------------
        # Root Suffocation Index
        # ---------------------------------------------

        rsi = self.virtual_engine.root_suffocation_index(
            soi,
            wli
        )
        # ---------------------------------------------
        # Water Stress Index
        # ---------------------------------------------

        wsi = self.virtual_engine.water_stress_index(
            moisture,
            temperature
        )

        # ---------------------------------------------
        # Heat Stress Index
        # ---------------------------------------------
        hsi = self.virtual_engine.heat_stress_index(
            temperature
        )

        # ---------------------------------------------
        # Disease Risk Index
        # ---------------------------------------------

        dri = self.virtual_engine.disease_risk_index(
            rri,
            fri,
            wli,
            hsi,
            wsi
        )
        # ---------------------------------------------
        # Historical values for stability analysis
        # ---------------------------------------------

        moisture_history = [
            r.get("soil_moisture_percent")
            for r in history_24h
        ]

        temperature_history = [
            r.get("air_temp")
            for r in history_24h
        ]

        humidity_history = [
            r.get("humidity")
            for r in history_24h
        ]

        light_history = [
            r.get("light_percent")
            for r in history_24h
        ]


        # ---------------------------------------------
        # Stability Virtual Sensors
        # ---------------------------------------------

        msi = self.virtual_engine.stability_index(
            moisture_history
        )

        tsi = self.virtual_engine.stability_index(
            temperature_history
        )

        hsi2 = self.virtual_engine.stability_index(
            humidity_history
        )

        lsi = self.virtual_engine.stability_index(
            light_history
        )
        # ---------------------------------------------
        # Environmental Stability Index
        # ---------------------------------------------

        esi = self.virtual_engine.environmental_stability_index(
            msi,
            tsi,
            hsi2,
            lsi
        )
        return {

            "soil_oxygen_index": soi,

            "root_rot_index": rri,

            "fungal_risk_index": fri,

            "waterlogging_index": wli,

            "root_suffocation_index": rsi,
            
            "water_stress_index": wsi,

            "heat_stress_index": hsi,

            "disease_risk_index": dri,

            "moisture_stability_index": msi,

            "temperature_stability_index": tsi,

            "humidity_stability_index": hsi2,

            "light_stability_index": lsi,

            "environmental_stability_index": esi,

            "data_coverage": {

                "1h": coverage_1h,

                "6h": coverage_6h,

                "24h": coverage_24h,

                "72h": coverage_72h
            },

            "ai_confidence": {

                "score": ai_confidence,

                "level": confidence_level
            },

            "durations": {

                "wet_hours": wet_hours,

                "dry_hours": dry_hours,

                "hot_hours": hot_hours,

                "very_hot_hours": very_hot_hours,

                "high_humidity_hours":
                    high_humidity_hours,

                "low_humidity_hours":
                    low_humidity_hours
            }
        }
    # =====================================================
    # Sensor Health Check
    # =====================================================

    def check_sensor_health(self, readings):

        if not readings:
            return {
                "status": "ERROR",
                "problems": ["No sensor data available."],
                "sensors": {}
            }

        problems = []
        sensor_results = {}

        # ---------------------------------------------
        # Sensor definitions
        # ---------------------------------------------

        sensors = {
            "air_temperature": "air_temp",
            "humidity": "humidity",
            "soil_moisture": "soil_moisture_percent",
            "light": "light_percent",
            "water_temperature": "water_temp"
        }

        # Only inspect recent readings for health.
        # We don't want very old failures to affect
        # current sensor health forever.
        recent = readings[-20:]

        for sensor_name, field in sensors.items():

            values = [
                r.get(field)
                for r in recent
            ]

            valid_count = sum(
                value is not None
                for value in values
            )

            invalid_count = (
                len(values) - valid_count
            )

            valid_percent = (
                valid_count / len(values)
            ) * 100

            # -----------------------------------------
            # Consecutive failures from latest reading
            # -----------------------------------------

            consecutive_failures = 0

            for value in reversed(values):

                if value is None:
                    consecutive_failures += 1
                else:
                    break

            # -----------------------------------------
            # Determine individual sensor status
            # -----------------------------------------

            if valid_percent == 0:

                sensor_status = "DISCONNECTED"

            elif consecutive_failures >= 5:

                sensor_status = "FAULTY"

            elif consecutive_failures >= 2:

                sensor_status = "UNSTABLE"

            elif consecutive_failures == 1:

                sensor_status = "GLITCH"

            elif valid_percent < 90:

                sensor_status = "UNSTABLE"

            else:

                sensor_status = "OK"

            sensor_results[sensor_name] = {

                "status": sensor_status,

                "valid_readings": valid_count,

                "invalid_readings": invalid_count,

                "valid_percent":
                    round(valid_percent, 2),

                "consecutive_failures":
                    consecutive_failures
            }

            if sensor_status not in [
                "OK",
                "GLITCH"
            ]:

                problems.append(
                    f"{sensor_name} sensor is "
                    f"{sensor_status.lower()}."
                )

        # ---------------------------------------------
        # Overall Sensor System Status
        # ---------------------------------------------

        statuses = [
            sensor["status"]
            for sensor in sensor_results.values()
        ]

        if "DISCONNECTED" in statuses:

            overall_status = "CRITICAL"

        elif "FAULTY" in statuses:

            overall_status = "WARNING"

        elif "UNSTABLE" in statuses:

            overall_status = "WARNING"

        elif "GLITCH" in statuses:

            overall_status = "MINOR"

        else:

            overall_status = "OK"

        return {

            "status": overall_status,

            "problems": problems,

            "sensors": sensor_results
        }
    # =====================================================
    # Analyze Sensor History
    # =====================================================

    def analyze(self, device_id, limit=12, run_gemini=True):

        print(
            f"\nGetting sensor history for {device_id}...\n"
        )

        readings = self.firebase.get_recent_readings(
            device_id=device_id,
            limit=limit
        )

        if not readings:

            return {
                "success": False,
                "device_id": device_id,
                "message": "No sensor readings found."
            }

        # ---------------------------------------------
        # 1. Clean readings
        # ---------------------------------------------

        cleaned, invalid_count = self.clean_readings(
            readings
        )

        # ---------------------------------------------
        # 2. Normalize readings
        # ---------------------------------------------

        normalized = self.normalizer.normalize_readings(
            cleaned
        )

        sensor_health = self.check_sensor_health(
            normalized
        )

        # ---------------------------------------------
        # 4. Abnormal Condition Detection
        # ---------------------------------------------

        status = self.detect_abnormal_conditions(
            cleaned
        )


        virtual_sensors = self.calculate_virtual_sensors(
            normalized
        )

        # =====================================================
        # Risk Decision Engine
        # =====================================================

        risk_decision = self.risk_engine.evaluate(

            virtual_sensors,

            sensor_problems=sensor_health.get(
                "problems",
                []
            )   
        )
        # ---------------------------------------------
        # 3. Statistics
        # ---------------------------------------------

        statistics = self.calculate_statistics(
            normalized
        )

        # ---------------------------------------------
        # 5. Trends
        # ---------------------------------------------

        trends = {

            "air_temp":
                self.calculate_trend(
                    normalized,
                    "air_temp"
                ),

            "humidity":
                self.calculate_trend(
                    normalized,
                    "humidity"
                ),

            "soil_raw":
                self.calculate_trend(
                    normalized,
                    "soil_raw"
                ),

            "soil_moisture_percent":
                self.calculate_trend(
                    normalized,
                    "soil_moisture_percent"
                ),

            "light_raw":
                self.calculate_trend(
                    normalized,
                    "light_raw"
                ),

            "light_percent":
                self.calculate_trend(
                    normalized,
                    "light_percent"
                ),

            "water_percent":
                self.calculate_trend(
                    normalized,
                    "water_percent"
                ),

            "water_temp":
                self.calculate_trend(
                    normalized,
                    "water_temp"
                )
        }

        # ---------------------------------------------
        # 6. Latest normalized reading
        # ---------------------------------------------

        latest = normalized[-1]

        # ---------------------------------------------
        # 7. Final Result
        # ---------------------------------------------

        result = {

            "success": True,

            "status": risk_decision,

            "device_id": device_id,

            "sensor_health": sensor_health,

            "reading_count": len(normalized),

            "risk_decision": risk_decision,

            "virtual_sensors": virtual_sensors,

            "first_timestamp":
                normalized[0].get("timestamp"),

            "last_timestamp":
                normalized[-1].get("timestamp"),

            "latest": latest,

            "statistics": statistics,

            "trends": trends,

            "invalid_sensor_readings": {
                "water_temperature_errors":
                    invalid_count
            }   
        }

        # =====================================================
        # Optional Standalone Gemini Analysis
        # =====================================================

        if run_gemini:

            gemini_result = self.gemini_analyzer.analyze(
                sensor_analysis=result,
                plant_context=None
            )

            result["gemini_analysis"] = gemini_result

        else:

            result["gemini_analysis"] = {
                "called": False,
                "reason": (
                    "Gemini skipped because sensor analysis "
                    "is being passed to GrowTraceAgent."
                )
            }

        return result
    # =====================================================
    # Detect Abnormal Conditions
    # =====================================================

    def detect_abnormal_conditions(self, cleaned):

        latest = cleaned[-1]

        abnormal = []

        sensor_problems = []

        trigger_gemini = False

        # -----------------------------------------
        # Sensor Errors
        # -----------------------------------------

        if latest.get("water_temp_error"):

            sensor_problems.append(
                "Water temperature sensor is disconnected or invalid."
            )

        # -----------------------------------------
        # Missing Values
        # -----------------------------------------

        for field in [

            "air_temp",

            "humidity",

            "soil_raw",

            "light_raw",

            "water_raw"

        ]:

            if latest.get(field) is None:

                sensor_problems.append(
                    f"{field} missing."
                )

        # -----------------------------------------
        # Air Temperature
        # (General warning only)
        # -----------------------------------------

        air = latest["air_temp"]

        if air > 40:

            abnormal.append(
                "Very high air temperature."
            )

            trigger_gemini = True

        elif air < 5:

            abnormal.append(
                "Very low air temperature."
            )

            trigger_gemini = True

        # -----------------------------------------
        # Humidity
        # -----------------------------------------

        humidity = latest["humidity"]

        if humidity < 20:

            abnormal.append(
                "Humidity extremely low."
            )

            trigger_gemini = True

        elif humidity > 95:

            abnormal.append(
                "Humidity extremely high."
            )

            trigger_gemini = True

        # -----------------------------------------
        # Water Detection
        # -----------------------------------------

        if latest["water_raw"] > 0:

            abnormal.append(
                "Water sensor detected standing water."
            )

            trigger_gemini = True

        # -----------------------------------------
        # Final Status
        # -----------------------------------------

        if sensor_problems:

            sensor_status = "WARNING"

        else:

            sensor_status = "OK"

        if abnormal:

            plant_status = "CHECK"

        else:

            plant_status = "NORMAL"

        return {

            "trigger_gemini": trigger_gemini,

            "plant_status": plant_status,

            "sensor_status": sensor_status,

            "abnormal_conditions": abnormal,

            "sensor_problems": sensor_problems

        }

# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    analyzer = SensorAnalyzer()

    result = analyzer.analyze(
        device_id="cutting2",
        limit=1000
    )

    print("\n" + "=" * 70)

    print("GROWTRACE SENSOR ANALYSIS")

    print("=" * 70)

    if not result["success"]:

        print(result["message"])

    else:

        print(
            "\nDevice:",
            result["device_id"]
        )

        print(
            "Readings analyzed:",
            result["reading_count"]
        )
        
        print("\nSTATUS\n")
        print(result["status"])

        print("\nLATEST READING\n")

        for key, value in result["latest"].items():

            print(f"{key:20} : {value}")

        print("\nSTATISTICS\n")

        for sensor, values in result["statistics"].items():

            print(sensor)

            print(
                "   Average :",
                values["average"]
            )

            print(
                "   Minimum :",
                values["minimum"]
            )

            print(
                "   Maximum :",
                values["maximum"]
            )

        print("\nTRENDS\n")

        for sensor, trend in result["trends"].items():

            print(
                f"{sensor:20} : {trend}"
            )

        print("\nSENSOR ERRORS\n")

        print(
            "Water temperature errors:",
            result[
                "invalid_sensor_readings"
            ][
                "water_temperature_errors"
            ]
        )
        print("\nVIRTUAL SENSORS\n")

        for key, value in result["virtual_sensors"].items():

            print(
                f"{key:30} : {value}"
            )
        print("\nRISK DECISION\n")

        for key, value in result[
            "risk_decision"
        ].items():
            print(
                f"{key:<25}: {value}"
            )

        print("\nGEMINI ANALYSIS\n")

        gemini = result.get(
            "gemini_analysis",
            {}
        )

        print(
            "Gemini Called :",
            gemini.get("called")
        )

        print(
            "Model         :",
            gemini.get("model")
        )

        print(
            "Reason        :",
            gemini.get("reason")
        )

        if gemini.get("analysis"):

            print("\nAI RESPONSE\n")

            print(gemini.get("analysis"))
            
    print("\n" + "=" * 70)
