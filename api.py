"""
Flask API for the Interview Question Generator.
This is the "bridge" between the Python generator (question_bank.py +
interview_question_generator.py) and the React frontend Codex builds.

Endpoints (matching what the Codex frontend prompt expects):
  POST /generate        body: { role, num_technical, num_behavioral }
  GET  /question-bank

Run:
    pip install -r interview_questions_requirements.txt
    pip install flask flask-cors
    python api.py
The API will be live at http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from question_bank import QUESTION_BANK, JOB_DESCRIPTIONS
from interview_question_generator import generate_question_set

app = Flask(__name__)
CORS(app)  # allow the React dev server (any origin) to call this API


@app.route("/")
def health_check():
    return jsonify({"status": "ok", "message": "Interview Question Generator API is running."})


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    num_technical = int(data.get("num_technical", 3))
    num_behavioral = int(data.get("num_behavioral", 2))

    if not role:
        return jsonify({"error": "Missing 'role' in request body."}), 400
    if role not in JOB_DESCRIPTIONS:
        return jsonify({
            "error": f"Unknown role '{role}'.",
            "available_roles": list(JOB_DESCRIPTIONS.keys())
        }), 400

    try:
        result = generate_question_set(
            role_name=role,
            num_technical=num_technical,
            num_behavioral=num_behavioral,
            use_llm=True,
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/question-bank", methods=["GET"])
def question_bank():
    return jsonify(QUESTION_BANK)


@app.route("/roles", methods=["GET"])
def roles():
    # handy extra endpoint so the frontend can populate the role dropdown
    # without hardcoding role names
    return jsonify(list(JOB_DESCRIPTIONS.keys()))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
