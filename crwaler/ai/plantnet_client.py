import json
import requests


class PlantNetClient:

    def __init__(self):

        with open("config/api.json", "r") as f:
            config = json.load(f)

        self.api_key = config["api_sources"]["plantnet"]["api_key"]

        self.url = (
            "https://my-api.plantnet.org/v2/identify/all"
            f"?api-key={self.api_key}"
        )

    # =====================================
    # Identify Plant
    # =====================================

    def identify(self, image_path):

        with open(image_path, "rb") as img:

            files = [

                (
                    "images",
                    (
                        image_path,
                        img,
                        "image/jpeg"
                    )
                )

            ]

            data = {

                "organs": ["leaf"]

            }

            response = requests.post(

                self.url,

                files=files,

                data=data,

                timeout=120

            )

        if response.status_code != 200:
            print("Status:", response.status_code)
            print(response.text)
            return

        result = response.json()

        if len(result["results"]) == 0:

            return {

                "success": False,

                "message": "No plant identified."

            }

        best = result["results"][0]

        species = best["species"]

        return {

            "success": True,

            "scientific_name": species["scientificNameWithoutAuthor"],

            "scientific_name_full": species["scientificName"],

            "family": species["family"]["scientificName"],

            "genus": species["genus"]["scientificName"],

            "common_names": species.get(

                "commonNames",

                []

            ),

            "confidence": best["score"]

        }


if __name__ == "__main__":

    plantnet = PlantNetClient()

    image = input("Image Path : ")

    result = plantnet.identify(image)

    print()

    for k, v in result.items():

        print(f"{k} : {v}")
