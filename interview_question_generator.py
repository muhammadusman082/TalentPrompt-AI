"""
Interview Question Generator
Internee.pk -- Machine Learning Internship Task

Objective: Generate custom technical and behavioral interview questions for
intern candidates, based on job descriptions and an existing question bank,
using a text-generation model (GPT/LLaMA-family).

Model used: google/flan-t5-small (a small, free, open-source instruction-tuned
text-generation model from the same family as GPT-3/LLaMA in purpose -- it
takes a prompt and generates new text). This runs on CPU and downloads
automatically the first time you run it (needs an internet connection once).

If the model can't be loaded (e.g. no internet), the generator automatically
falls back to a template-variation method using the existing question bank,
so the system always produces a usable output.

Run this file directly:
    pip install -r interview_questions_requirements.txt
    python interview_question_generator.py
"""

import random
from question_bank import QUESTION_BANK, JOB_DESCRIPTIONS

# ---------------------------------------------------------------------------
# Try to load the real text-generation model. Falls back gracefully.
# ---------------------------------------------------------------------------
_generator = None
_MODEL_NAME = "google/flan-t5-base"

def _load_model():
    global _generator
    if _generator is not None:
        return _generator
    try:
        from transformers import pipeline
        _generator = pipeline("text2text-generation", model=_MODEL_NAME)
        print(f"[info] Loaded text-generation model: {_MODEL_NAME}")
    except Exception as e:
        print(f"[warning] Could not load '{_MODEL_NAME}' ({e}). "
              f"Falling back to template-based generation.")
        _generator = False
    return _generator


# ---------------------------------------------------------------------------
# Template-based fallback (always works, no internet/model required)
# ---------------------------------------------------------------------------
TEMPLATE_STARTERS = [
    "Can you walk me through how you would approach {topic}?",
    "What challenges have you faced when working with {topic}?",
    "How would you explain {topic} to someone new to the field?",
    "Describe a scenario where {topic} would be critical to get right.",
]

def _template_fallback_question(skill, existing_questions):
    topic = skill.replace("_", " ")
    template = random.choice(TEMPLATE_STARTERS)
    return template.format(topic=topic)


# ---------------------------------------------------------------------------
# Real generation using the LLM, grounded with the existing question bank
# as few-shot examples (keeps the generated questions relevant and on-style)
# ---------------------------------------------------------------------------
def _llm_generate_question(skill, existing_questions, role_summary):
    generator = _load_model()
    if not generator:
        return None

    examples = "\n".join(f"- {q}" for q in existing_questions[:3])
    prompt = (
        f"Job role: {role_summary}\n"
        f"Skill to test: {skill.replace('_', ' ')}\n"
        f"Existing example questions for this skill:\n{examples}\n\n"
        f"Task: Write ONE new interview question (a single sentence, ending in a "
        f"question mark) that tests this skill. Do not repeat the examples above. "
        f"Do not explain your answer, just output the question."
    )

    try:
        result = generator(
            prompt,
            max_new_tokens=45,
            min_new_tokens=8,
            do_sample=True,
            temperature=0.9,
            top_p=0.92,
            repetition_penalty=1.4,
            no_repeat_ngram_size=3,
        )
        text = result[0]["generated_text"].strip()
        # basic sanity check: reject empty, too-short, or clearly broken output
        if not text or len(text) < 10:
            return None
        return text
    except Exception as e:
        print(f"[warning] Generation failed ({e}), using fallback.")
        return None


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------
def generate_question_set(role_name, num_technical=3, num_behavioral=2, use_llm=True):
    """
    Generate a custom set of technical + behavioral questions for a given role.
    """
    if role_name not in JOB_DESCRIPTIONS:
        raise ValueError(f"Unknown role '{role_name}'. Available roles: {list(JOB_DESCRIPTIONS.keys())}")

    job = JOB_DESCRIPTIONS[role_name]
    skills = job["skills"]
    summary = job["summary"]

    technical_questions = []
    used_questions = set()

    for i in range(num_technical):
        skill = skills[i % len(skills)]
        bank_questions = QUESTION_BANK.get(skill, {}).get("technical", [])

        question = None
        if use_llm and bank_questions:
            # try a couple of times to get something not already used
            for _ in range(2):
                candidate = _llm_generate_question(skill, bank_questions, summary)
                if candidate and candidate not in used_questions:
                    question = candidate
                    break

        if not question:
            # fall back: walk through the bank in order (not random) so
            # repeated calls for the same skill don't collide, then fall
            # back to a template as a last resort
            unused_bank = [q for q in bank_questions if q not in used_questions]
            if unused_bank:
                question = unused_bank[0]
            else:
                question = _template_fallback_question(skill, bank_questions)
                # nudge the template again if it still collides
                attempts = 0
                while question in used_questions and attempts < 3:
                    question = _template_fallback_question(skill, bank_questions)
                    attempts += 1

        used_questions.add(question)
        technical_questions.append({"skill": skill, "question": question})

    behavioral_pool = QUESTION_BANK["general"]["behavioral"]
    behavioral_questions = random.sample(behavioral_pool, min(num_behavioral, len(behavioral_pool)))

    return {
        "role": role_name,
        "summary": summary,
        "technical_questions": technical_questions,
        "behavioral_questions": behavioral_questions,
    }


if __name__ == "__main__":
    print("Interview Question Generator")
    print("=" * 50)

    for role in JOB_DESCRIPTIONS:
        print(f"\n### {role} ###")
        result = generate_question_set(role, num_technical=3, num_behavioral=2, use_llm=True)
        print(f"Role summary: {result['summary']}\n")

        print("Technical Questions:")
        for i, q in enumerate(result["technical_questions"], 1):
            print(f"  {i}. [{q['skill']}] {q['question']}")

        print("\nBehavioral Questions:")
        for i, q in enumerate(result["behavioral_questions"], 1):
            print(f"  {i}. {q}")
        print()
