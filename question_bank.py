"""
Existing question bank + role/skill metadata.
This is the "existing question banks" and "job descriptions" data the task asks for.
Replace/extend this with your real question bank and real job descriptions.
"""

# Template questions organized by skill tag. The generator pulls from here
# as a base, then either varies them or uses them as few-shot examples for
# the text-generation model.
QUESTION_BANK = {
    "python": {
        "technical": [
            "What is the difference between a list and a tuple in Python?",
            "Explain how Python's garbage collection works.",
            "What are decorators, and can you give an example of when you'd use one?",
            "How does Python handle memory management for large data structures?",
        ],
    },
    "sql": {
        "technical": [
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "How would you optimize a slow-running SQL query?",
            "Explain the difference between WHERE and HAVING clauses.",
        ],
    },
    "machine_learning": {
        "technical": [
            "Explain the bias-variance tradeoff in your own words.",
            "How would you handle an imbalanced dataset in a classification problem?",
            "What's the difference between bagging and boosting?",
        ],
    },
    "react": {
        "technical": [
            "What is the difference between state and props in React?",
            "When would you use useEffect versus useMemo?",
            "How does React's virtual DOM improve performance?",
        ],
    },
    "backend": {
        "technical": [
            "What's the difference between REST and GraphQL?",
            "How would you design an API endpoint to handle file uploads safely?",
            "Explain the concept of idempotency in API design.",
        ],
    },
    "general": {
        "behavioral": [
            "Tell me about a time you had to learn a new tool or technology quickly. How did you approach it?",
            "Describe a situation where you disagreed with a teammate's approach. How did you handle it?",
            "Tell me about a time you missed a deadline. What happened, and what did you learn?",
            "Describe a project you're proud of. What was your specific contribution?",
            "How do you prioritize tasks when everything feels urgent?",
        ],
    },
}

# Example job descriptions / intern profiles — replace with your real postings.
JOB_DESCRIPTIONS = {
    "ML Intern": {
        "skills": ["python", "machine_learning"],
        "summary": "Assists in building and evaluating machine learning models, "
                   "cleaning datasets, and running experiments under senior guidance.",
    },
    "Backend Intern": {
        "skills": ["python", "sql", "backend"],
        "summary": "Builds and maintains REST APIs, works with databases, and "
                   "supports backend services for internal tools.",
    },
    "Frontend Intern": {
        "skills": ["react"],
        "summary": "Builds UI components, works with design mockups, and "
                   "integrates frontend with backend APIs.",
    },
}
