# Enterprise Ingestion Firewall

Full-stack AI learning project based on the [ProHireNetworks workshop](https://github.com/ProHireNetworks/Ai-Engineer-workshop).

## Features
- **Week 1 — Validate:** FastAPI, Pydantic v2 schemas, Groq + Instructor structured classification, intent/risk/priority and approximate token metadata.
- **Week 2 — Respond:** Context-aware Markdown answers rendered in React.
- **Week 3 — Remember:** session IDs and isolated in-memory history for follow-up questions.
- **Safety basics:** restricted schema fields, rejected extra fields, user text treated as untrusted, and local environment variables for secrets.

## Requirements
Python 3.10+, Node.js 18+, and a Groq API key from https://console.groq.com/keys.

## Run on Windows PowerShell

Backend terminal:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

Set your own `GROQ_API_KEY` and `GROQ_MODEL` in `backend/.env`, then start:
```powershell
uvicorn app.main:app --reload --port 8000
```

- Health: http://127.0.0.1:8000/health
- API docs: http://127.0.0.1:8000/docs

Open a second terminal from the repository root:
```powershell
cd frontend-react
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Tests
From `backend` with the virtual environment active, run `pytest -q`.

## API
Send `POST /api/analyze` with `{"message":"I was charged twice"}`. Reuse the returned `session_id` for follow-ups. The response includes validated intent fields, token estimate, Markdown answer, and session ID.

## Limitations
Conversation memory is process-local and resets when FastAPI restarts. Token counts are estimates. No real order/payment systems are connected. Run local tests before deployment. Never commit your `.env` or API key.
