import pytest
from pydantic import ValidationError
from app.schemas.ingestion import IngestionRequest, IngestionResult
from app.services.conversation_service import add_message, clear_all_sessions, get_history

def test_request_trims_message():
    assert IngestionRequest(message="  Hello  ").message == "Hello"

def test_request_rejects_whitespace():
    with pytest.raises(ValidationError):
        IngestionRequest(message="   ")

def test_request_rejects_extra_fields():
    with pytest.raises(ValidationError):
        IngestionRequest(message="Hi", extra_field=True)

def test_result_rejects_unknown_intent():
    with pytest.raises(ValidationError):
        IngestionResult(intent="shopping", risk_profile="low", priority="low", requires_action=False, summary="test")

def test_history_is_isolated_by_session():
    clear_all_sessions()
    add_message("one", "user", "Delayed order")
    assert get_history("one")[0]["content"] == "Delayed order"
    assert get_history("two") == []
    clear_all_sessions()
