async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  } catch {
    throw new Error("Cannot reach the API. Start FastAPI on port 8000.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status}).`);
  }
  return data;
}
export const api = {
  health: () => request("/health"),
  analyze: (message, sessionId) => request("/api/analyze", { method: "POST", body: JSON.stringify(sessionId ? { message, session_id: sessionId } : { message }) }),
};
