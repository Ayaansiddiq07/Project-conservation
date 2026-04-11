"use client";

import { useEffect, useState, useRef } from "react";

export default function TelemetryDashboard() {
  const [data, setData] = useState({ hum: 0, temp: 0, tilt: 90 });
  const [displayData, setDisplayData] = useState({ hum: 0, temp: 0, tilt: 90 });
  const [syncStatus, setSyncStatus] = useState({ text: "Syncing", color: "#888", dot: "#888" });
  const animRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    async function fetchData() {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const json = await res.json();
          setData({
            hum: parseFloat(json.V0) || 0,
            temp: parseFloat(json.V1) || 0,
            tilt: parseFloat(json.V2) || 0,
          });
          setSyncStatus({ text: "Live", color: "#4ade80", dot: "#4ade80" });
        } else {
          setSyncStatus({ text: "Offline", color: "#ef4444", dot: "#ef4444" });
        }
      } catch {
        setSyncStatus({ text: "API Error", color: "#ef4444", dot: "#ef4444" });
      }
    }

    fetchData();
    interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Smooth number transitions
  useEffect(() => {
    const target = { ...data };
    const start = { ...displayData };
    const startTime = performance.now();
    const duration = 600;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setDisplayData({
        hum: start.hum + (target.hum - start.hum) * eased,
        temp: start.temp + (target.temp - start.temp) * eased,
        tilt: start.tilt + (target.tilt - start.tilt) * eased,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const metrics = [
    {
      label: "HUMIDITY (V0)",
      val: displayData.hum,
      unit: "%",
      max: 100,
      accent: "green" as const,
      gradientFrom: "#4ade80",
      gradientTo: "#22c55e",
    },
    {
      label: "TEMPERATURE (V1)",
      val: displayData.temp,
      unit: "°C",
      max: 50,
      accent: "amber" as const,
      gradientFrom: "#f59e0b",
      gradientTo: "#d97706",
    },
    {
      label: "TILT ANGLE (V2)",
      val: displayData.tilt,
      unit: "°",
      max: 180,
      accent: "cyan" as const,
      gradientFrom: "#06b6d4",
      gradientTo: "#0891b2",
    },
  ];

  return (
    <section id="metrics">
      <div
        className="container"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}
      >
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="section-tag">03 / Telemetry</span>
          <h2 className="section-title">Blynk IoT Live Diagnostics</h2>
          <p className="section-desc">
            Real-time sensor data streamed from the hardware prototype.
          </p>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow inside panel */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="dashboard-grid">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className={`metric-card glass-card metric-card--${metric.accent}`}
                style={{ padding: 20 }}
              >
                <div className="metric-label">{metric.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span className="metric-value">{metric.val.toFixed(1)}</span>
                  <span className="metric-unit">{metric.unit}</span>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (metric.val / metric.max) * 100)
                        )}%`,
                        background: `linear-gradient(90deg, ${metric.gradientFrom}, ${metric.gradientTo})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Status bar */}
            <div
              className="glass-card"
              style={{
                gridColumn: "1 / -1",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div className="sync-badge">
                <span
                  className="sync-dot"
                  style={{ background: syncStatus.dot, boxShadow: `0 0 8px ${syncStatus.dot}` }}
                />
                <span style={{ color: syncStatus.color }}>{syncStatus.text}</span>
              </div>
              <span style={{ color: "#222" }}>|</span>
              <span
                style={{
                  color: "#444",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Tilt controls restricted to Admin Panel
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
