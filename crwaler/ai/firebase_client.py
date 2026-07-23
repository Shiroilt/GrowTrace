from pathlib import Path

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


class FirebaseClient:

    def __init__(self):

        # --------------------------------------
        # Firebase Service Account
        # --------------------------------------

        BASE_DIR = Path(__file__).resolve().parent.parent

        service_account_path = (
            BASE_DIR
            / "config"
            / "firebase"
            / "plant1-3f868-firebase-adminsdk-fbsvc-f153deca7f.json"
        )

        # --------------------------------------
        # Firebase Realtime Database URL
        # --------------------------------------

        database_url = (
            "https://plant1-3f868-default-rtdb."
            "asia-southeast1.firebasedatabase.app/"
        )

        # --------------------------------------
        # Initialize Firebase
        # --------------------------------------

        if not firebase_admin._apps:

            cred = credentials.Certificate(
                service_account_path
            )

            firebase_admin.initialize_app(
                cred,
                {
                    "databaseURL": database_url
                }
            )

        print("Firebase connected successfully.")

    # ==========================================
    # Read Entire Database
    # ==========================================

    def get_latest_reading(self):

        ref = db.reference("sensor_data")

        data = (
            ref.order_by_key()
            .limit_to_last(1)
            .get()
        )

        if not data:
            return None

        # Firebase returns:
        # {
        #     "firebase_push_key": {
        #         sensor data...
        #     }
        # }

        key = next(iter(data))

        reading = data[key]

        reading["firebase_key"] = key

        return reading



    def get_latest_reading_by_device(self, device_id):

        ref = db.reference("sensor_data")

        data = (
            ref.order_by_child("ID")
            .equal_to(device_id)
            .limit_to_last(1)
            .get()
        )

        if not data:
            return None

        key = next(iter(data))

        reading = data[key]

        reading["firebase_key"] = key

        return reading

    def get_recent_readings(self, device_id, limit=12):

        ref = db.reference("sensor_data")

        data = (
            ref.order_by_child("ID")
            .equal_to(device_id)
            .limit_to_last(limit)
        .get()
        )

        if not data:
            return []

        readings = []

        for key, value in data.items():

            value["firebase_key"] = key

            readings.append(value)

        # Sort using timestamp
        readings.sort(
            key=lambda x: x.get("timestamp", 0)
        )

        return readings
# ==============================================
# Test
# ==============================================

if __name__ == "__main__":

    firebase = FirebaseClient()

    print("\nReading recent sensor data...\n")

    readings = firebase.get_recent_readings(
        device_id="cutting2",
        limit=100
    )

    for reading in readings:

        print(reading)
