from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import pandas as pd

# =============================
# 🚀 CREATE APP
# =============================
app = Flask(__name__)
CORS(app)  # Allow frontend access

# =============================
# 🧠 LOAD MODEL
# =============================
try:
    model = pickle.load(open("model.pkl", "rb"))
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Model loading failed:", e)
    model = None

# =============================
# 🏠 HOME ROUTE (FIXES 404)
# =============================
@app.route("/")
def home():
    return render_template("index.html")

# =============================
# 🧠 SYMPTOMS LIST
# =============================
symptoms_list = ["fever", "cough", "headache", "fatigue"]

# =============================
# 🔍 EXTRACT SYMPTOMS FROM TEXT
# =============================
def extract_symptoms(text):
    text = text.lower()
    return [s for s in symptoms_list if s in text]

# =============================
# 🔍 PREDICTION API
# =============================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        user_input = data.get("text", "")

        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Extract symptoms
        symptoms = extract_symptoms(user_input)

        if not symptoms:
            return jsonify({"error": "No symptoms detected"}), 400

        # Convert to model input
        input_data = [1 if s in symptoms else 0 for s in symptoms_list]
        input_df = pd.DataFrame([input_data], columns=symptoms_list)

        # Predict
        if model:
            disease = model.predict(input_df)[0]
            prob = max(model.predict_proba(input_df)[0])
        else:
            return jsonify({"error": "Model not loaded"}), 500

        # Detailed AI-like report
        report = f"""
        <h3>🧾 AI Medical Report</h3>

        <b>🦠 Predicted Disease:</b> {disease}<br>
        <b>📊 Confidence:</b> {round(prob * 100, 2)}%<br><br>

        <b>🔍 Symptoms Detected:</b><br>
        {", ".join(symptoms)}<br><br>

        <b>💊 Suggested Precautions:</b><br>
        • Stay hydrated 💧<br>
        • Take proper rest 😴<br>
        • Maintain hygiene 🧼<br><br>

        <b>⚠️ Advice:</b><br>
        If symptoms persist or worsen, consult a medical professional immediately.
        """

        return jsonify({
            "disease": disease,
            "confidence": round(prob * 100, 2),
            "report": report
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": "Internal server error"}), 500


# =============================
# ▶️ RUN SERVER
# =============================
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)