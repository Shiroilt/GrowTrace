import json
import requests


class WeatherClient:

    def __init__(self):

        with open("config/api.json", "r") as f:
            config = json.load(f)

        self.api_key = config["api_sources"]["openweather"]["api_key"]

    # --------------------------------------
    # Current Weather
    # --------------------------------------

    def current_weather(self, latitude, longitude):

        url = "https://api.openweathermap.org/data/2.5/weather"

        params = {

            "lat": latitude,

            "lon": longitude,

            "appid": self.api_key,

            "units": "metric"

        }

        response = requests.get(

            url,

            params=params,

            timeout=30

        )

        response.raise_for_status()

        data = response.json()

        return {

            "city": data["name"],

            "country": data["sys"]["country"],

            "temperature": data["main"]["temp"],

            "feels_like": data["main"]["feels_like"],

            "humidity": data["main"]["humidity"],

            "pressure": data["main"]["pressure"],

            "weather": data["weather"][0]["main"],

            "description": data["weather"][0]["description"],

            "wind_speed": data["wind"]["speed"],

            "clouds": data["clouds"]["all"]

        }


if __name__ == "__main__":

    weather = WeatherClient()

    result = weather.current_weather(

        latitude=23.0225,

        longitude=72.5714

    )

    print(result)