<div align="center">

# 🎯 TalentPrompt-AI

### AI-assisted interview question generator for intern hiring

Pick a role, choose how many technical and behavioral questions you want, and get an interview-ready set in seconds.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-22d3ee?style=for-the-badge&logo=netlify&logoColor=white)](https://talentpromptai.netlify.app/#workspace)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Project_Post-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/update/urn:li:activity:7510219363585691648/)

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Transformers-FFD21E?style=flat-square&logo=huggingface&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![PythonAnywhere](https://img.shields.io/badge/PythonAnywhere-1D9FD7?style=flat-square&logo=python&logoColor=white)

</div>

---

## 📌 About

Built during my Machine Learning internship at **Internee.pk**. The task: generate custom technical and behavioral interview questions for intern candidates, using existing question banks and role descriptions, with a text-generation model.

The system takes a role (for example *ML Intern*, *Backend Intern*, *Frontend Intern*), reads the role's skills and summary, and produces a role-specific set of questions.

## ✨ Features

- 🎓 **Role-specific question sets**: technical questions tied to the role's skills, plus behavioral questions
- 🤖 **Text generation with `flan-t5-base`**: an open-source instruction-tuned model that writes new questions, using real bank questions as examples
- 🛡️ **Fallback that never breaks**: if the model is unavailable, repeats itself, or returns junk, the generator falls back to the question bank and templates, and avoids duplicate questions within a set
- 📚 **Question bank browser**: browse the raw bank grouped by skill
- 📋 **Copy all as text** and **Regenerate** for quick reuse
- 🌍 **3D hero**: a slowly rotating globe built with Three.js, glassmorphic cards, and an animated cursor on desktop
- 📱 **Responsive** layout that also works on mobile browsers

## 🧠 How It Works

```
Role selected → skills + role summary → prompt built with example questions from the bank
        ↓
flan-t5-base generates a new question  →  sanity check (empty? repeated? off-topic?)
        ↓                                        ↓ fails
   used in the set                      question bank / template fallback
```

Two backend modes share the same generator logic:

| Mode | File | Uses AI model | Install size | Best for |
|---|---|---|---|---|
| **Full** | `api.py` | Yes (`flan-t5-base` via PyTorch + Transformers) | ~2-3 GB | Running locally, best question quality |
| **Lite** | `api_lite.py` | No (question bank + templates) | a few MB | Free hosting (this is what the live demo uses) |

## 📁 Project Structure

```
TalentPrompt-AI/
├── frontend/                                   # React + Vite + Tailwind app
│   ├── src/                                    # components, 3D hero, styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example                            # VITE_API_URL template
├── api.py                                      # Flask API, full mode (AI model)
├── api_lite.py                                 # Flask API, lite mode (no model)
├── interview_question_generator.py             # core generation logic
├── interview_question_generator.ipynb          # same logic as a notebook
├── question_bank.py                            # question bank + role descriptions
├── interview_questions_requirements.txt        # dependencies for full mode
├── interview_questions_requirements_lite.txt   # dependencies for lite mode
└── .gitignore
```

## 🚀 Run It Locally

You need **Python 3.10+** and **Node.js** (a recent LTS version). The backend and frontend run in two separate terminals.

### 1. Clone the repo

```bash
git clone https://github.com/muhammadusman082/TalentPrompt-AI.git
cd TalentPrompt-AI
```

### 2. Start the backend (Terminal 1)

**Option A: Lite mode** (fast, no model download)

```bash
pip install -r interview_questions_requirements_lite.txt
python api_lite.py
```

**Option B: Full mode** (real AI generation)

```bash
pip install -r interview_questions_requirements.txt
python api.py
```

> The first run of full mode downloads `flan-t5-base` (about 1 GB), so it takes a while. After that it loads from cache.

The API is now running at `http://localhost:5000`. Leave this terminal open.

### 3. Start the frontend (Terminal 2)

```bash
cd frontend
copy .env.example .env      # Windows (use `cp .env.example .env` on Mac/Linux)
npm install
npm run dev
```

Open the link Vite prints, usually `http://localhost:5173`.

If you skip the `.env` step, the frontend falls back to `http://localhost:5000`, which is what you want for local use.

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/roles` | List of available roles |
| `GET` | `/question-bank` | The full question bank, grouped by skill |
| `POST` | `/generate` | Generate a question set for a role |

Example request:

```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"role": "ML Intern", "num_technical": 3, "num_behavioral": 2}'
```

Example response:

```json
{
  "role": "ML Intern",
  "summary": "Assists in building and evaluating machine learning models...",
  "technical_questions": [
    { "skill": "python", "question": "..." },
    { "skill": "machine_learning", "question": "..." }
  ],
  "behavioral_questions": ["...", "..."]
}
```

## 🌐 Deployment

| Part | Platform | Settings |
|---|---|---|
| **Frontend** | Netlify | Base directory `frontend`, build command `npm run build`, publish directory `frontend/dist` |
| **Backend** | PythonAnywhere (free tier) | Runs `api_lite.py` through a manual WSGI configuration |

Set the environment variable `VITE_API_URL` in Netlify to your hosted backend URL (no trailing slash). Vite reads it at **build time**, so after adding or changing it, trigger a new deploy with *Clear cache and deploy site*.

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| **"Unable to reach the API"** in the app | The backend isn't running, or `VITE_API_URL` points to the wrong place. Start `api.py` / `api_lite.py`, or redeploy after fixing the variable. |
| **Keras 3 error** when loading the model | Run `pip install tf-keras` (happens if TensorFlow is installed on the same machine). |
| **Model download is slow or times out** | It's a ~1 GB one-time download. Re-run the command and it resumes. Or use lite mode. |
| **Fewer questions than requested** | The request is capped by how many questions exist in the bank. Add more to `question_bank.py`. |
| **`ModuleNotFoundError: question_bank`** | Run the Python files from the repo root, so `question_bank.py` sits in the same folder. |

## 🔧 Using Your Own Data

Everything role-related lives in `question_bank.py`:

- `QUESTION_BANK` holds example questions per skill (`technical`) and general `behavioral` questions
- `JOB_DESCRIPTIONS` holds each role's skills and summary

Add a new role or skill there and it shows up in the API and the frontend dropdown automatically. More real example questions per skill means better generated questions.

## 👤 Author

**Muhammad Usman**
Machine Learning Intern at Internee.pk

[![GitHub](https://img.shields.io/badge/GitHub-muhammadusman082-181717?style=flat-square&logo=github)](https://github.com/muhammadusman082)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Project_Post-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/update/urn:li:activity:7510219363585691648/)

---

<div align="center">
Built as part of the Internee.pk Machine Learning Internship
</div>
