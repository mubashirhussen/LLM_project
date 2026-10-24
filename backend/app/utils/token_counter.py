def estimate_tokens(text: str) -> int:
    """Estimate token count; this is not provider billing data."""
    try:
        import tiktoken
        return len(tiktoken.get_encoding("cl100k_base").encode(text))
    except Exception:
        return max(1, len(text.split()) * 2) if text.strip() else 0
