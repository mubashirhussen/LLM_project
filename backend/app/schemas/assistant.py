from pydantic import Field
from app.schemas.ingestion import IngestionResult

class AssistantResult(IngestionResult):
    session_id: str = Field(min_length=1)
    response_markdown: str = Field(min_length=1)
