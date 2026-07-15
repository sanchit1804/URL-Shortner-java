import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080";
const API_KEY = "dev-key-123";

export default function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    setError("");
    setShortUrl("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/shortener`,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY,
          },
        }
      );
      const result = response.data.shortUrl;
      setShortUrl(result);
      setHistory((prev) => [{ original: url, short: result }, ...prev].slice(0, 5));
      setUrl("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleShorten();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.logo}>
          <span style={styles.logoIcon}>🔗</span>
          <span style={styles.logoText}>URL Shortener</span>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Paste your long URL</p>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="https://www.example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              style={loading ? {...styles.button, opacity: 0.7} : styles.button}
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? "..." : "Shorten"}
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorText}>⚠ {error}</span>
            </div>
          )}

          {shortUrl && (
            <div style={styles.resultBox}>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                style={styles.resultUrl}
              >
                {shortUrl}
              </a>
              <button style={styles.copyBtn} onClick={handleCopy}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <hr style={styles.divider} />
              <p style={styles.historyTitle}>Recent links</p>
              {history.map((item, i) => (
                <div key={i} style={styles.historyItem}>
                  <span style={styles.historyLong}>{item.original}</span>
                  <a
                    href={item.short}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.historyShort}
                  >
                    {item.short.replace("http://localhost:8080", "")}
                  </a>
                </div>
              ))}
            </div>
          )}

          <p style={styles.apiNote}>🔒 Secured with API key authentication</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
    padding: "1rem",
  },
  container: {
    width: "100%",
    maxWidth: "520px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "1.5rem",
  },
  logoIcon: {
    fontSize: "24px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  label: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "500",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  resultBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "12px 14px",
    marginTop: "0.75rem",
  },
  resultUrl: {
    fontSize: "14px",
    color: "#15803d",
    fontWeight: "500",
    textDecoration: "none",
  },
  copyBtn: {
    fontSize: "13px",
    color: "#2563eb",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px 14px",
    marginTop: "0.75rem",
  },
  errorText: {
    fontSize: "13px",
    color: "#dc2626",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f0f0f0",
    margin: "1.25rem 0",
  },
  historyTitle: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
  },
  historyItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  historyLong: {
    fontSize: "12px",
    color: "#888",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "300px",
  },
  historyShort: {
    fontSize: "12px",
    color: "#2563eb",
    fontWeight: "500",
    textDecoration: "none",
    flexShrink: 0,
  },
  apiNote: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "1rem",
  },
};
