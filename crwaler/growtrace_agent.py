import json
import time
import mimetypes
import chromadb

from google import genai
from google.genai import types

from ai.weather_client import WeatherClient
from ai.plantnet_client import PlantNetClient
from ai.sensor_analyzer import SensorAnalyzer

class GrowTraceAgent:

    def __init__(self):

        # ==========================================
        # Load Gemini
        # ==========================================

        with open("config/gemini.json", "r") as f:
            gemini = json.load(f)

        self.gemini = genai.Client(
            api_key=gemini["api_key"]
        )

        # Gemini fallback order
        self.gemini_models = [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash"
        ]

        # ==========================================
        # ChromaDB
        # ==========================================

        self.client = chromadb.PersistentClient(
            path="./vector_db"
        )

        self.collection = self.client.get_collection(
            "growtrace_knowledge"
        )

        # ==========================================
        # AI / API Clients
        # ==========================================

        self.weather = WeatherClient()
        self.plantnet = PlantNetClient()
        self.sensor_analyzer = SensorAnalyzer()
    # ==========================================
    # Search Local Knowledge
    # ==========================================

    def search_local(self, question):

        print("\nSearching Local Knowledge...\n")

        results = self.collection.query(
            query_texts=[question],
            n_results=5
        )

        docs = results["documents"][0]
        metas = results["metadatas"][0]

        context = ""

        for i, (doc, meta) in enumerate(
            zip(docs, metas),
            start=1
        ):

            filename = meta.get(
                "filename",
                "Unknown"
            )

            print(
                f"{i}. {filename}"
            )

            context += f"""

Source:
{filename}

Content:
{doc}

"""

        return context

    
    # ==========================================
    # Weather
    # ==========================================

    def get_weather(
        self,
        latitude,
        longitude
    ):

        try:

            weather = self.weather.current_weather(
                latitude,
                longitude
            )

            print("\nWeather Information\n")

            for key, value in weather.items():

                print(
                    f"{key} : {value}"
                )

            return weather

        except Exception as e:

            print(
                "\nWeather unavailable:",
                e
            )

            return None

    # ==========================================
    # PlantNet Identification
    # ==========================================

    def identify_plant(
        self,
        image_path
    ):

        if not image_path:

            return None

        if image_path.strip() == "":

            return None

        print("\nIdentifying Plant with PlantNet...\n")

        try:

            result = self.plantnet.identify(
                image_path
            )

            print("\nPlantNet Result\n")

            if result:

                for key, value in result.items():

                    print(
                        f"{key} : {value}"
                    )

            return result

        except Exception as e:

            print(
                "\nPlantNet unavailable:",
                e
            )

            # Gemini can still analyze image
            return None

    # ==========================================
    # Load Image For Gemini
    # ==========================================

    def load_image(
        self,
        image_path
    ):

        if not image_path:

            return None

        image_path = image_path.strip()

        if image_path == "":

            return None

        # Detect MIME type
        mime_type, _ = mimetypes.guess_type(
            image_path
        )

        if mime_type not in [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]:

            raise ValueError(
                "Unsupported image type. "
                "Use JPG, JPEG, PNG, or WEBP."
            )

        with open(
            image_path,
            "rb"
        ) as f:

            image_bytes = f.read()

        return types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type
        )

    # ==========================================
    # Gemini
    # ==========================================

    def ask_gemini(
        self,
        question,
        local_context,
        weather,
        plantnet,
        image_path=None,
        sensor_analysis=None
    ):

        # ======================================
        # Main GrowTrace Prompt
        # ======================================

        prompt = f"""
You are GrowTrace AI, an intelligent plant-health and plant-care assistant.

You have expertise in:

- botany
- horticulture
- plant pathology
- plant diseases
- plant pests
- plant nutrition
- soil and root health
- watering problems
- environmental plant stress
- plant propagation
- tropical and ornamental plants
- agricultural plants
- environmental and sensor analysis

Your PRIMARY GOAL is not simply to name a possible problem.

Your primary goal is:

1. Understand what is happening to the plant.
2. Determine the most likely cause using all available evidence.
3. Tell the user what they should do RIGHT NOW.
4. Maximize the plant's chance of survival and recovery.
5. Avoid actions that could make the condition worse.

================================================
AVAILABLE EVIDENCE
================================================

PLANT IDENTIFICATION FROM PLANTNET

{plantnet}

================================================

LOCAL GROWTRACE KNOWLEDGE

{local_context}

================================================

CURRENT LOCAL WEATHER

{weather}

================================================

GROWTRACE SENSOR ANALYSIS

{sensor_analysis}

================================================

USER QUESTION / DESCRIPTION

{question}

================================================
CORE REASONING RULES
================================================

Combine all available evidence:

- the user's description
- the actual image, if attached
- PlantNet identification
- GrowTrace local knowledge
- current weather
- visible symptoms
- environmental conditions

Do not blindly trust any single source.

PlantNet identification may be incorrect or uncertain.
Use its confidence and compare the identification with
what is visible in the image when possible.

Local knowledge is supporting plant-specific information.

Current weather is environmental evidence.
Do not automatically blame current weather for damage.
Consider whether the plant is indoors or outdoors and
whether the weather could realistically affect it.

The user's direct observations are important evidence.
For example:

- soil stays wet for many days
- soil is completely dry
- stem is becoming soft
- bad smell from soil
- leaves suddenly dropped
- plant recently repotted
- roots were damaged
- fertilizer recently applied
- direct sunlight exposure
- recent heavy rain

Use these observations when determining the likely cause.

================================================
IMAGE ANALYSIS
================================================

If an image is attached, inspect the ACTUAL IMAGE carefully.

Analyze the entire visible plant before diagnosing.

Look for:

- yellowing
- chlorosis
- interveinal chlorosis
- pale leaves
- brown spots
- black spots
- lesions
- necrotic/dead tissue
- leaf-tip burn
- leaf-edge burn
- wilting
- drooping
- curling
- deformation
- holes
- chewing damage
- pest evidence
- webbing
- fungal-looking growth
- powdery coating
- discoloration
- water-soaked tissue
- mushy-looking tissue
- sunburn
- heat damage
- nutrient-deficiency patterns
- mechanical damage
- stem damage
- signs of rot
- abnormal new growth

When possible, consider:

- whether symptoms affect old or new leaves
- whether symptoms begin at tips, edges, veins, or between veins
- whether damage is localized or spreading
- whether tissue appears dry/crispy or soft/mushy
- whether the pattern is consistent with disease,
  environmental stress, watering problems, pests,
  nutrient problems, or physical damage

Do NOT claim that something is visible if it cannot
actually be seen clearly in the image.

================================================
DIAGNOSIS RULES
================================================

Never treat one symptom as proof of one disease.

For example:

Yellow leaves alone do NOT automatically mean overwatering.

Brown tips alone do NOT automatically mean underwatering.

Spots alone do NOT automatically mean fungal disease.

Instead, combine multiple pieces of evidence.

Separate:

OBSERVATION
What can actually be seen or what the user directly reported.

LIKELY CAUSE
What explanation best fits the evidence.

ALTERNATIVE CAUSES
Other realistic explanations if uncertainty remains.

Do not invent certainty.

If evidence strongly supports something, say:

"Most likely..."

If several explanations remain possible, say:

"Possible causes include..."

If there is insufficient evidence, clearly say what
information is needed to distinguish between the causes.

====================================================
GROWTRACE SENSOR RULES
====================================================

If GrowTrace sensor analysis is available, use it when
answering questions about the user's plant conditions,
sensor readings, sensor history, risks, or environment.

Distinguish between direct measurements and calculated
virtual sensors.

DIRECT PHYSICAL MEASUREMENTS include:
- air temperature
- humidity
- raw soil moisture
- normalized soil moisture percentage
- light
- water temperature
- water sensor readings

GROWTRACE VIRTUAL SENSOR ESTIMATES include:
- Soil Oxygen Index
- Root Rot Index
- Fungal Risk Index
- Waterlogging Index
- Root Suffocation Index
- Water Stress Index
- Heat Stress Index
- Disease Risk Index
- stability indices
- Environmental Stability Index

Never claim that a virtual sensor is a physical measurement.

For example, do NOT say:
"The root sensor detected root rot."

Instead say:
"GrowTrace estimates an elevated root-rot risk based on
soil moisture, temperature, humidity and historical conditions."

Use sensor_health before trusting a sensor.

Use data_coverage and ai_confidence when judging how reliable
historical conclusions are.

If AI confidence is VERY LOW, explain that long-term conclusions
are uncertain even if the latest physical reading is valid.

If the user asks whether conditions are good or bad, give a
clear conclusion first, then explain the important readings.

================================================
SURVIVAL PRIORITY
================================================

For a sick, damaged, stressed, or dying plant,
PRIORITIZE SURVIVAL.

The most important part of your answer should be:

WHAT THE USER SHOULD DO NOW.

Put urgent actions before long explanations.

Determine whether immediate intervention is necessary.

Examples include:

- stop watering temporarily
- water immediately
- inspect roots
- remove rotten tissue
- isolate the plant
- move away from direct sunlight
- improve drainage
- remove standing water
- check for pests
- avoid fertilizer temporarily
- improve airflow
- protect from extreme heat
- repot only if necessary

However, recommend these actions ONLY when supported
by the available evidence.

Do not recommend unnecessary repotting, root cutting,
fungicides, pesticides, fertilizers, or other aggressive
treatments without sufficient reason.

If the plant is severely damaged, explain which healthy
parts could potentially be saved or propagated.

If root rot or stem rot is strongly suspected, explain
how the user can confirm it before performing destructive
treatment whenever time allows.

================================================
ACTION PLAN
================================================

When treatment is needed, provide actions in priority order:

1. What to do immediately.
2. What to check next.
3. What treatment to perform if the suspected problem is confirmed.
4. What NOT to do.
5. What to monitor during recovery.

Make instructions practical and specific.

Instead of vague advice such as:

"Water appropriately."

Prefer useful instructions such as:

"Check the soil 3-5 cm below the surface. If it is still
wet, do not water again yet."

When relevant, explain:

- watering decision
- drainage
- soil condition
- root condition
- light
- temperature
- humidity
- fertilizer
- pests
- disease management
- damaged-leaf management
- recovery signs

================================================
RESPONSE LENGTH
================================================

Adapt the response length to what the user asks.

If the user asks for a SHORT answer, such as:

- "short"
- "briefly"
- "in short"
- "quick answer"
- "what happened?"

Give a concise answer.

A short answer should normally contain:

- likely problem
- strongest evidence
- 2-4 immediate actions
- one important warning or thing to monitor

Do NOT produce a huge plant-care article.

If the user asks normally without specifying length,
give a moderate answer with enough explanation to act safely.

If the user asks:

- "explain"
- "explain properly"
- "in detail"
- "long answer"
- "step by step"
- "tell me everything"

give a detailed explanation with clear sections and
step-by-step actions.

Do not reduce important emergency instructions merely
because the user requested a short answer.

================================================
RESPONSE STYLE
================================================

Speak naturally and clearly.

Do not overwhelm the user with unnecessary botanical terminology.

When technical terms are useful, explain them simply.

Focus primarily on solving the user's actual problem.

Do not repeat the same recommendation several times.

For a plant-health problem, structure the answer according
to the situation rather than mechanically filling every section.

A useful structure is:

Plant:
[Identification when relevant]

What I think is happening:
[Most likely diagnosis in simple language]

Why:
[Important evidence]

What to do now:
[Prioritized steps]

Do NOT:
[Important actions that could worsen the problem]

Watch for:
[Recovery signs or worsening symptoms]

Use alternative causes only when they are realistically
important.

================================================
SAFETY AND ACCURACY
================================================

Do not claim laboratory-level certainty from an image.

Some fungal, bacterial, viral, nutrient, root, watering,
and environmental problems can look similar.

If confirmation requires checking:

- roots
- soil moisture
- underside of leaves
- stem firmness
- smell
- pests
- recent watering history

ask the user to check those things.

When appropriate, ask for another image, such as:

- whole plant
- damaged leaf close-up
- underside of leaf
- stem base
- soil
- roots

Do not recommend treatment for a disease that has not
been reasonably established.

================================================
FINAL OBJECTIVE
================================================

Answer the user's actual question first.

Then provide the most useful next action.

For an unhealthy plant, prioritize:

SAVE THE PLANT → STOP THE CAUSE → STABILIZE IT →
MONITOR RECOVERY → OPTIMIZE LONG-TERM CARE

Use all available GrowTrace evidence to produce the most
practical and reliable answer possible.
"""
        contents = []

        # --------------------------------------
        # Add image to Gemini
        # --------------------------------------

        if image_path:

            try:

                image_part = self.load_image(
                    image_path
                )

                if image_part:

                    contents.append(
                        image_part
                    )

                    print(
                        "\nImage attached to Gemini Vision."
                    )

            except Exception as e:

                print(
                    "\nCould not load image for Gemini:",
                    e
                )

        # --------------------------------------
        # Add text prompt
        # --------------------------------------

        contents.append(
            prompt
        )

        # ======================================
        # Gemini Fallback
        # ======================================

        last_error = None

        for model_name in self.gemini_models:

            try:

                print(
                    f"\nTrying {model_name}..."
                )

                response = (
                    self.gemini.models.generate_content(
                        model=model_name,
                        contents=contents
                    )
                )

                print(
                    f"✓ Success using {model_name}"
                )

                return response.text

            except Exception as e:

                print(
                    f"✗ {model_name} failed"
                )

                print(e)

                last_error = e

                time.sleep(2)

        raise Exception(
            "\nAll Gemini models failed.\n\n"
            f"Last Error:\n{last_error}"
        )

    # ==========================================
    # Master Function
    # ==========================================

    def answer(
        self,
        question,
        latitude,
        longitude,
        image_path=None,
        device_id=None
    ):

        # --------------------------------------
        # Plant identification FIRST
        # --------------------------------------

        plant = self.identify_plant(
            image_path
        )

        # --------------------------------------
        # Improve RAG search using plant identity
        # --------------------------------------

        search_question = question

        if plant:

            scientific_name = plant.get(
                "scientific_name",
                ""
            )

            common_names = plant.get(
                "common_names",
                []
            )

            search_question = f"""
Plant: {scientific_name}
Common names: {common_names}

User question:
{question}
"""

        # --------------------------------------
        # Local knowledge
        # --------------------------------------

        local = self.search_local(
            search_question
        )
        # --------------------------------------
        # Weather
        # --------------------------------------

        weather = self.get_weather(
            latitude,
            longitude
        )
        # ==========================================
        # SENSOR ANALYSIS
        # ==========================================

        sensor_analysis = None

        if device_id:

            print(f"\nAnalyzing sensors for {device_id}...\n")

            try:

                sensor_analysis = self.sensor_analyzer.analyze(
                    device_id=device_id,
                    limit=1000,
                    run_gemini=False
                )
                print("Sensor analysis completed.")

            except Exception as e:

                print(
                    f"Sensor analysis failed: {e}"
                )

                sensor_analysis = {
                    "success": False,
                    "error": str(e)
                }
        # --------------------------------------
        # Gemini
        # --------------------------------------

        print(
            "\nGemini Thinking...\n"
        )

        answer = self.ask_gemini(
            question=question,
            local_context=local,
            weather=weather,
            plantnet=plant,
            sensor_analysis=sensor_analysis,
            image_path=image_path
        )

        return answer


# ==============================================
# Terminal Application
# ==============================================

if __name__ == "__main__":

    agent = GrowTraceAgent()

    while True:

        print(
            "\n" + "=" * 80
        )

        # --------------------------------------
        # Image first
        # --------------------------------------

        image = input(
            "Image Path (Enter to skip): "
        ).strip()

        # --------------------------------------
        # Question
        # --------------------------------------

        q = input(
            "Ask : "
        ).strip()

        if q.lower() == "exit":

            break

        try:

            # ----------------------------------
            # Location
            # ----------------------------------

            lat = float(
                input("Latitude  : ")
            )

            lon = float(
                input("Longitude : ")
            )

            # ----------------------------------
            # GrowTrace
            # ----------------------------------

            ans = agent.answer(
                question=q,
                latitude=lat,
                longitude=lon,
                image_path=image,
                device_id="cutting1"
            )

            print(
                "\n" + "=" * 80
            )

            print(
                "GROWTRACE AI"
            )

            print(
                "=" * 80
            )

            print(ans)

            print(
                "=" * 80
            )

        except Exception as e:

            print(
                "\nERROR\n"
            )

            print(e)