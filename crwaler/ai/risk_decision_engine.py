class RiskDecisionEngine:

    # =====================================================
    # Risk Levels
    # =====================================================

    def get_risk_level(self, score):

        if score is None:
            return "UNKNOWN"

        if score >= 80:
            return "CRITICAL"

        if score >= 60:
            return "HIGH"

        if score >= 40:
            return "MODERATE"

        if score >= 20:
            return "LOW"

        return "MINIMAL"


    # =====================================================
    # Main Risk Decision
    # =====================================================

    def evaluate(
        self,
        virtual_sensors,
        sensor_problems=None
    ):

        if sensor_problems is None:
            sensor_problems = []

        # ---------------------------------------------
        # Get Virtual Sensor Values
        # ---------------------------------------------

        root_rot = virtual_sensors.get(
            "root_rot_index"
        )

        fungal = virtual_sensors.get(
            "fungal_risk_index"
        )

        waterlogging = virtual_sensors.get(
            "waterlogging_index"
        )

        root_suffocation = virtual_sensors.get(
            "root_suffocation_index"
        )

        water_stress = virtual_sensors.get(
            "water_stress_index"
        )

        heat_stress = virtual_sensors.get(
            "heat_stress_index"
        )

        disease_risk = virtual_sensors.get(
            "disease_risk_index"
        )

        confidence_data = virtual_sensors.get(
            "ai_confidence",
            {}
        )

        confidence = confidence_data.get(
            "score",
            0
        )

        # ---------------------------------------------
        # Store Individual Risks
        # ---------------------------------------------

        risks = {

            "root_rot": root_rot,

            "fungal": fungal,

            "waterlogging": waterlogging,

            "root_suffocation":
                root_suffocation,

            "water_stress":
                water_stress,

            "heat_stress":
                heat_stress,

            "disease_risk":
                disease_risk
        }

        # ---------------------------------------------
        # Find Highest Risk
        # ---------------------------------------------

        valid_risks = {
            name: score
            for name, score in risks.items()
            if score is not None
        }

        if valid_risks:

            highest_risk_name = max(
                valid_risks,
                key=valid_risks.get
            )

            highest_risk_score = (
                valid_risks[
                    highest_risk_name
                ]
            )

        else:

            highest_risk_name = None
            highest_risk_score = 0

        # ---------------------------------------------
        # Determine Plant Status
        # ---------------------------------------------

        if highest_risk_score >= 80:

            plant_status = "CRITICAL"

        elif highest_risk_score >= 60:

            plant_status = "WARNING"

        elif highest_risk_score >= 40:

            plant_status = "WATCH"

        else:

            plant_status = "NORMAL"

        # ---------------------------------------------
        # Determine Sensor Status
        # ---------------------------------------------

        if sensor_problems:

            sensor_status = "WARNING"

        else:

            sensor_status = "OK"

        # ---------------------------------------------
        # Gemini Trigger
        # ---------------------------------------------

        trigger_gemini = False
        trigger_reason = None

        # Critical plant risk:
        # Call Gemini even if confidence is low,
        # because ignoring a possible critical
        # condition could be dangerous for the plant.

        if highest_risk_score >= 80:

            trigger_gemini = True

            trigger_reason = (
                "Critical plant risk detected."
            )

        # High risk + reasonable data confidence

        elif (
            highest_risk_score >= 60
            and confidence >= 50
        ):

            trigger_gemini = True

            trigger_reason = (
                "High plant risk detected "
                "with sufficient sensor confidence."
            )

        # Moderate risk:
        # Don't spend Gemini API yet.
        # Continue monitoring.

        elif highest_risk_score >= 40:

            trigger_reason = (
                "Moderate risk detected. "
                "Continue monitoring."
            )

        # ---------------------------------------------
        # Low Confidence Warning
        # ---------------------------------------------

        if confidence < 25:

            confidence_warning = (
                "Sensor history confidence is very low."
            )

        elif confidence < 50:

            confidence_warning = (
                "Sensor history confidence is low."
            )

        else:

            confidence_warning = None

        # ---------------------------------------------
        # Final Decision
        # ---------------------------------------------

        return {

            "plant_status":
                plant_status,

            "sensor_status":
                sensor_status,

            "trigger_gemini":
                trigger_gemini,

            "trigger_reason":
                trigger_reason,

            "highest_risk": {

                "name":
                    highest_risk_name,

                "score":
                    highest_risk_score,

                "level":
                    self.get_risk_level(
                        highest_risk_score
                    )
            },

            "ai_confidence":
                confidence,

            "confidence_warning":
                confidence_warning,

            "sensor_problems":
                sensor_problems,

            "risks":
                risks
        }


# =====================================================
# Simple Test
# =====================================================

if __name__ == "__main__":

    engine = RiskDecisionEngine()

    test_virtual_sensors = {

        "root_rot_index": 20,

        "fungal_risk_index": 20,

        "waterlogging_index": 0,

        "root_suffocation_index": 27.27,

        "water_stress_index": 28.86,

        "heat_stress_index": 27,

        "disease_risk_index": 17.59,

        "ai_confidence": {

            "score": 0.69,

            "level": "VERY LOW"
        }
    }

    result = engine.evaluate(

        test_virtual_sensors,

        sensor_problems=[
            "Water temperature sensor invalid."
        ]
    )

    print("\n" + "=" * 70)

    print("GROWTRACE RISK DECISION ENGINE")

    print("=" * 70)

    for key, value in result.items():

        print(
            f"{key:<25}: {value}"
        )

    print("=" * 70)
