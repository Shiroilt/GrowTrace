import joblib
import os

BASE_DIR = os.path.dirname(__file__)

models = {
    "cutting1": joblib.load(os.path.join(BASE_DIR, "models", "cutting1.pkl")),
    "cutting2": joblib.load(os.path.join(BASE_DIR, "models", "cutting2.pkl")),
    "cutting3": joblib.load(os.path.join(BASE_DIR, "models", "cutting3.pkl")),
    "water": joblib.load(os.path.join(BASE_DIR, "models", "water.pkl")),
    "without_water": joblib.load(os.path.join(BASE_DIR, "models", "without_water.pkl"))
}

def predict(sensor_data):
    sample = pd.DataFrame([sensor_data])

    probs = []

    for model in models.values():
        probs.append(model.predict_proba(sample)[0][1])

    avg_prob = np.mean(probs)

    prediction = "Grow" if avg_prob >= 0.5 else "Not Grow"

    return {
        "prediction": prediction,
        "probability": round(avg_prob * 100, 2),
        "individual_models": probs
    }