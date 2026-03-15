"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [data, setData] = useState({ hum: 0, temp: 0, tilt: 90, tiltInput: 90 });
  const [syncStatus, setSyncStatus] = useState({ text: "Loading...", color: "#888" });
  const isDragging = useRef(false);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((json) => {
        setIsAuthenticated(json.authenticated === true);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Poll telemetry when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let interval: ReturnType<typeof setInterval>;
    async function fetchData() {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const json = await res.json();
          setData((prev) => ({
            hum: parseFloat(json.V0) || 0,
            temp: parseFloat(json.V1) || 0,
            tilt: parseFloat(json.V2) || 0,
            tiltInput: isDragging.current
              ? prev.tiltInput
              : parseFloat(json.V3) || 0,
          }));
          setSyncStatus({ text: "● LIVE", color: "#4ade80" });
        } else {
          setSyncStatus({ text: "● OFFLINE", color: "#ef4444" });
        }
      } catch {
        setSyncStatus({ text: "● ERROR", color: "#ef4444" });
      }
    }
    fetchData();
    interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const json = await res.json();
        setLoginError(json.error || "Login failed.");
      }
    } catch {
      setLoginError("Network error.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const handleSliderChange = async (val: string) => {
    isDragging.current = false;
    try {
      setSyncStatus({ text: "● SYNCING", color: "#facc15" });
      const res = await fetch("/api/tilt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ angle: parseFloat(val) }),
      });
      if (res.ok) {
        setSyncStatus({ text: "● SYNCED", color: "#4ade80" });
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setSyncStatus({ text: "● SESSION EXPIRED", color: "#ef4444" });
      } else {
        setSyncStatus({ text: "● API ERROR", color: "#ef4444" });
      }
    } catch {
      setSyncStatus({ text: "● ERROR", color: "#ef4444" });
    }
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: "#888" }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ─── LOGIN ───
  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 400 }}>
          <div style={styles.lockIcon}>🔒</div>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.subtitle}>
            Only authorized personnel can control the solar panel tilt.
          </p>
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={styles.input}
              />
            </div>
            {loginError && (
              <p style={{ color: "#ef4444", fontSize: 14, margin: "8px 0" }}>
                {loginError}
              </p>
            )}
            <button type="submit" style={styles.loginBtn}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 700 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ ...styles.title, marginBottom: 4 }}>
              Solar Tilt Control
            </h1>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: syncStatus.color,
              }}
            >
              {syncStatus.text}
            </span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* Slider */}
        <div style={styles.sliderBox}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#888",
              marginBottom: 16,
            }}
          >
            MANUAL TILT OVERRIDE (V3)
          </p>
          <input
            type="range"
            min="0"
            max="180"
            value={data.tiltInput}
            onChange={(e) => {
              isDragging.current = true;
              setData({ ...data, tiltInput: parseFloat(e.target.value) });
              setSyncStatus({ text: "● SYNCING", color: "#facc15" });
            }}
            onMouseUp={(e) => handleSliderChange(e.currentTarget.value)}
            onTouchEnd={(e) => handleSliderChange(e.currentTarget.value)}
            style={styles.slider}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "monospace",
              fontSize: 13,
              color: "#666",
            }}
          >
            <span>0° East</span>
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {Math.round(data.tiltInput)}°
            </span>
            <span>180° West</span>
          </div>
        </div>

        {/* Metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>SENSOR TILT (V2)</span>
            <span style={styles.metricValue}>{data.tilt.toFixed(1)}°</span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>TEMPERATURE (V1)</span>
            <span style={styles.metricValue}>{data.temp.toFixed(1)}°C</span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>HUMIDITY (V0)</span>
            <span style={styles.metricValue}>{data.hum.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    padding: 24,
  },
  card: {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  lockIcon: { fontSize: 40, marginBottom: 16 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: { color: "#888", fontSize: 14, textAlign: "center", marginBottom: 24 },
  field: { marginBottom: 16, width: "100%" },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "#aaa",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  },
  loginBtn: {
    width: "100%",
    padding: "12px 0",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  logoutBtn: {
    padding: "6px 16px",
    borderRadius: 8,
    background: "#222",
    color: "#ef4444",
    border: "1px solid #333",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  sliderBox: {
    width: "100%",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    margin: "12px 0",
    accentColor: "#4ade80",
    cursor: "pointer",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    width: "100%",
  },
  metricCard: {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  metricLabel: { fontFamily: "monospace", fontSize: 11, color: "#666" },
  metricValue: { fontSize: 20, fontWeight: 600, color: "#fff" },
};
