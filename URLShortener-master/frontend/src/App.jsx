
import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080";
const API_KEY = "dev-key-123";

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function calcSaved(original, short) {
  if (!original || !short) return 0;
  return Math.round(((original.length - short.length) / original.length) * 100);
}

export default function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [totalCount, setTotalCount] = useState(0);

  const handleShorten = async () => {
    if (!url.trim()) { setError("Please enter a URL"); return; }
    setError(""); setShortUrl(""); setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/shortener`,
        { url },
        { headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY } }
      );
      const result = response.data.shortUrl;
      setShortUrl(result);
      setHistory((prev) => {
        const exists = prev.find((h) => h.original === url);
        if (exists) {
          return [{ ...exists, short: result, time: new Date() }, ...prev.filter((h) => h.original !== url)].slice(0, 10);
        }
        setTotalCount((c) => c + 1);
        return [{ original: url, short: result, time: new Date() }, ...prev].slice(0, 10);
      });
      setUrl("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleShorten(); };

  const avgSaved = history.length
    ? Math.round(history.reduce((acc, h) => acc + calcSaved(h.original, h.short), 0) / history.length)
    : 0;

  return (
    <div style={s.layout}>
      <div style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>🔗</span>
          <span style={s.logoText}>Short.ly</span>
        </div>
        <nav style={s.nav}>
          {[
            { id: "dashboard", icon: "🏠", label: "Dashboard" },
            { id: "history", icon: "🕐", label: "History" },
          ].map((item) => (
            <div
              key={item.id}
              style={activeNav === item.id ? { ...s.navItem, ...s.navActive } : s.navItem}
              onClick={() => setActiveNav(item.id)}
            >
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={s.sidebarFooter}>🔒 API key secured</div>
      </div>

      <div style={s.main}>
        {activeNav === "dashboard" && (
          <div>
            <div style={s.pageTitle}>Dashboard</div>
            <div style={s.pageSub}>Shorten, manage and track your links</div>

            <div style={s.statsGrid}>
              <div style={s.stat}>
                <div style={s.statLabel}>URLs shortened</div>
                <div style={s.statVal}>{history.length}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>In history</div>
                <div style={s.statVal}>{history.length}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Avg length saved</div>
                <div style={s.statVal}>{avgSaved}%</div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>✂️ Shorten a URL</div>
              <div style={s.inputRow}>
                <input
                  style={s.input}
                  type="text"
                  placeholder="https://www.example.com/very/long/url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  style={loading ? { ...s.btn, opacity: 0.6 } : s.btn}
                  onClick={handleShorten}
                  disabled={loading}
                >
                  {loading ? "..." : "Shorten"}
                </button>
              </div>
              {error && <div style={s.errorBox}>⚠ {error}</div>}
              {shortUrl && (
                <div style={s.resultBox}>
                  <a href={shortUrl} target="_blank" rel="noreferrer" style={s.resultUrl}>
                    {shortUrl}
                  </a>
                  <button style={s.copyBtn} onClick={() => handleCopy(shortUrl)}>
                    {copied === shortUrl ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div style={s.card}>
                <div style={s.cardTitle}>
                  🕐 Recent links
                  <span style={s.badge}>{history.length}</span>
                </div>
                {history.map((item, i) => (
                  <div key={i} style={{ ...s.hRow, borderBottom: i === history.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                    <span>🌐</span>
                    <span style={s.hOrig}>{item.original}</span>
                    <span style={{ color: "#ccc", flexShrink: 0 }}>→</span>
                    <a href={item.short} target="_blank" rel="noreferrer" style={s.hShort}>
                      {item.short}
                    </a>
                    <button style={s.hCopy} onClick={() => handleCopy(item.short)}>
                      {copied === item.short ? "✓" : "📋"}
                    </button>
                    <span style={s.hTime}>{timeAgo(item.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeNav === "history" && (
          <div>
            <div style={s.pageTitle}>History</div>
            <div style={s.pageSub}>All shortened URLs from this session</div>
            <div style={s.card}>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#aaa", fontSize: "14px" }}>
                  No links yet. Go to Dashboard to shorten your first URL.
                </div>
              ) : (
                history.map((item, i) => (
                  <div key={i} style={{ ...s.hRow, flexWrap: "wrap", borderBottom: i === history.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                    <span>🌐</span>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: "13px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.original}
                      </div>
                      <a href={item.short} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#2563eb", fontFamily: "monospace", textDecoration: "none" }}>
                        {item.short}
                      </a>
                    </div>
                    <button style={s.hCopy} onClick={() => handleCopy(item.short)}>
                      {copied === item.short ? "✓ Copied" : "📋 Copy"}
                    </button>
                    <span style={s.hTime}>{timeAgo(item.time)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  layout: { display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f5f5f5" },
  sidebar: { background: "#ffffff", borderRight: "1px solid #e5e5e5", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem", height: "100vh", position: "sticky", top: 0 },
  logo: { display: "flex", alignItems: "center", gap: "10px", paddingBottom: "0.5rem", borderBottom: "1px solid #f0f0f0" },
  logoIcon: { fontSize: "22px" },
  logoText: { fontSize: "18px", fontWeight: "700", color: "#111" },
  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", color: "#666", cursor: "pointer", userSelect: "none" },
  navActive: { background: "#f5f5f5", color: "#111", fontWeight: "600" },
  sidebarFooter: { marginTop: "auto", fontSize: "12px", color: "#bbb" },
  main: { padding: "2rem 2.5rem", overflowY: "auto" },
  pageTitle: { fontSize: "24px", fontWeight: "700", color: "#111", marginBottom: "4px" },
  pageSub: { fontSize: "14px", color: "#999", marginBottom: "1.5rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.5rem" },
  stat: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px 18px" },
  statLabel: { fontSize: "12px", color: "#999", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" },
  statVal: { fontSize: "28px", fontWeight: "700", color: "#111" },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#111", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" },
  inputRow: { display: "flex", gap: "8px" },
  input: { flex: 1, padding: "11px 14px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", color: "#111" },
  btn: { padding: "0 22px", fontSize: "14px", fontWeight: "600", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", height: "42px", flexShrink: 0 },
  resultBox: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 16px", marginTop: "12px", gap: "8px" },
  resultUrl: { fontSize: "14px", color: "#15803d", fontWeight: "600", textDecoration: "none", fontFamily: "monospace" },
  copyBtn: { background: "#fff", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", color: "#15803d", cursor: "pointer", flexShrink: 0, fontWeight: "500" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginTop: "12px", fontSize: "13px", color: "#dc2626" },
  badge: { fontSize: "11px", background: "#eff6ff", color: "#2563eb", borderRadius: "20px", padding: "2px 8px", fontWeight: "600", marginLeft: "auto" },
  hRow: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", fontSize: "14px" },
  hOrig: { fontSize: "13px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 },
  hShort: { fontSize: "13px", color: "#2563eb", fontWeight: "600", flexShrink: 0, fontFamily: "monospace", textDecoration: "none" },
  hCopy: { background: "none", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "#666", cursor: "pointer", flexShrink: 0 },
  hTime: { fontSize: "11px", color: "#bbb", flexShrink: 0, minWidth: "52px", textAlign: "right" },
};
