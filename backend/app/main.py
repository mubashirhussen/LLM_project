from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from app.schemas.assistant import AssistantResult
from app.schemas.ingestion import IngestionRequest
from app.services.conversation_service import add_message, get_history
from app.services.llm_service import analyze_message
from app.services.response_service import generate_response
from app.utils.token_counter import estimate_tokens

app = FastAPI(title="Enterprise Ingestion Firewall", description="Schema-validated intent analysis and context-aware responses.", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["GET", "POST", "DELETE", "OPTIONS"], allow_headers=["Content-Type"])

@app.get("/health")
def health_check():
    return {"status": "ok", "memory": "process-local"}

@app.post("/api/analyze", response_model=AssistantResult)
def analyze(request: IngestionRequest):
    message = request.message
    session_id = request.session_id or str(uuid4())
    history = get_history(session_id)
    try:
        result = analyze_message(message)
        result.token_metadata.estimated_input_tokens = estimate_tokens(message)
        answer = generate_response(result, history, message)
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="The model returned data that failed schema validation.") from exc
    except Exception as exc:
        print(f"LLM request failed ({type(exc).__name__}): {exc}")
        raise HTTPException(status_code=502, detail="AI request failed. Check backend/.env, network, model name, and provider limits.") from exc
    add_message(session_id, "user", message)
    add_message(session_id, "assistant", answer)
    return AssistantResult(**result.model_dump(), session_id=session_id, response_markdown=answer)

@app.delete("/api/conversations/{session_id}")
def clear_conversation(session_id: str):
    from app.services.conversation_service import clear_session
    clear_session(session_id)
    return {"status": "cleared", "session_id": session_id}
