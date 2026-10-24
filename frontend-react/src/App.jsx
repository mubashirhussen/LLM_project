import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, ShieldCheck, Plus, CircleAlert } from "lucide-react";
import { api } from "./lib/api.js";

const starters = ["Help me with a delayed order", "Explain structured output", "I think I was charged twice"];

export default function App() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { api.health().then(() => setOnline(true)).catch(() => setOnline(false)); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pending]);

  function newChat() {
    setSessionId("");
    setMessages([]);
    setDraft("");
    setError("");
  }

  async function send(value = draft) {
    const message = value.trim();
    if (!message || pending) return;
    setMessages(current => [...current, { role: "user", content: message }]);
    setDraft("");
    setError("");
    setPending(true);
    try {
      const result = await api.analyze(message, sessionId || undefined);
      setSessionId(result.session_id);
      setMessages(current => [...current, { role: "assistant", content: result.response_markdown, analysis: result }]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return <div className="app-shell">
    <aside className="rail">
      <div className="brand-mark"><ShieldCheck size={22} /></div>
      <button className="new-chat" onClick={newChat} title="New conversation" aria-label="New conversation"><Plus size={19} /></button>
      <div className="rail-bottom"><span className={online ? "status-dot online" : "status-dot"} /></div>
    </aside>
    <main className="workspace">
      <header className="topbar">
        <div><span className="eyebrow">AI WORKSPACE</span><h1>Ingestion Firewall</h1></div>
        <div className="connection"><span className={online ? "status-dot online" : "status-dot"} />{online ? "API connected" : "API offline"}</div>
      </header>
      <section className="conversation" aria-live="polite">
        {messages.length === 0 ? <div className="welcome">
          <div className="hero-icon"><ShieldCheck size={28} /></div>
          <p className="eyebrow">STRUCTURED. VALIDATED. CONTEXTUAL.</p>
          <h2>What can I help you<br />work through?</h2>
          <p className="muted">Every message is classified against a strict schema before the assistant responds.</p>
          <div className="starter-grid">{starters.map(item => <button key={item} className="starter" onClick={() => send(item)}>{item}<span>↗</span></button>)}</div>
        </div> : <div className="message-stack">
          {messages.map((item, index) => <article className={item.role === "user" ? "message user-message" : "message assistant-message"} key={index}>
            <div className="avatar">{item.role === "user" ? "Y" : <ShieldCheck size={16} />}</div>
            <div className="message-body"><div className="message-label">{item.role === "user" ? "You" : "Firewall Assistant"}</div>
              {item.role === "assistant" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown> : <p>{item.content}</p>}
              {item.analysis && <div className="analysis-strip">
                <span>Intent <b>{item.analysis.intent.replaceAll("_", " ")}</b></span>
                <span>Risk <b className={`risk-${item.analysis.risk_profile}`}>{item.analysis.risk_profile}</b></span>
                <span>Priority <b>{item.analysis.priority}</b></span>
                <span>~{item.analysis.token_metadata.estimated_input_tokens} tokens</span>
              </div>}
            </div>
          </article>)}
          {pending && <div className="typing"><span /><span /><span /> Analysing your message…</div>}
          <div ref={endRef} />
        </div>}
      </section>
      <div className="composer-area">
        {error && <div className="error-note"><CircleAlert size={16} />{error}</div>}
        <form className="composer" onSubmit={event => { event.preventDefault(); send(); }}>
          <textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask a question or describe an issue…" rows={1} maxLength={5000} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} />
          <button type="submit" disabled={pending || !draft.trim()} aria-label="Send message"><ArrowUp size={19} /></button>
        </form>
        <p className="composer-hint">Enter to send · Shift + Enter for a new line · Never include passwords or OTPs</p>
      </div>
    </main>
  </div>;
}
