"""
LIGHTWEIGHT Flask API for the Interview Question Generator.

This version does NOT use the flan-t5 text-generation model (no torch,
no transformers) -- it only uses the existing question bank + template
variation. This makes it small enough to deploy on free hosting
(PythonAnywhere, Render free tier, etc.) where the full ~2-3GB model
dependency won't fit.

For local use with the real AI model, use api.py instead.

Run:
    pip install -r interview_questions_requirements_lite.txt
    python api_lite.py
The API will be live at http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from question_bank import QUESTION_BANK, JOB_DESCRIPTIONS
from interview_question_generator import generate_question_set

app = Flask(__name__)
CORS(app)


@app.route("/")
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Interview Question Generator API is running (lightweight mode, no AI model)."
    })


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
        # use_llm=False -- never touches torch/transformers, always uses
        # the question bank + template fallback. Fast and lightweight.
        result = generate_question_set(
            role_name=role,
            num_technical=num_technical,
            num_behavioral=num_behavioral,
            use_llm=False,
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/question-bank", methods=["GET"])
def question_bank():
    return jsonify(QUESTION_BANK)


@app.route("/roles", methods=["GET"])
def roles():
    return jsonify(list(JOB_DESCRIPTIONS.keys()))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
