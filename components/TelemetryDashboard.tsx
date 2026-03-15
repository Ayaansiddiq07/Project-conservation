"use client";

import { useEffect, useRef, useState } from "react";

export default function TelemetryDashboard() {
  const [data, setData] = useState({ hum: 0, temp: 0, tilt: 90 });
  const [syncStatus, setSyncStatus] = useState({ text: "Synced", color: "#4ade80" });

  useEffect(() => {
    let interval: any;
    async function fetchData() {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const json = await res.json();
          setData({
            hum: parseFloat(json.V0) || 0,
            temp: parseFloat(json.V1) || 0,
            tilt: parseFloat(json.V2) || 0
          });
          setSyncStatus({ text: "Live", color: "#4ade80" });
        } else {
          setSyncStatus({ text: "Offline", color: "#ef4444" });
        }
      } catch (err) {
        setSyncStatus({ text: "API Error", color: "#ef4444" });
      }
    }

    fetchData();
    interval = setInterval(fetchData, 4000); // Polling every 4 seconds to reduce load
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="metrics">
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
        <div className="section-head" style={{ marginBottom: 64 }}>
          <span className="section-tag">03 / Telemetry</span>
          <h2 className="section-title">Blynk IoT Live Diagnostics</h2>
        </div>

        <div className="blynk-container" style={{ position: 'relative', background: '#0a0a0a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', minHeight: 400, padding: 24 }}>
          
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: "HUMIDITY (V0)", val: data.hum, unit: "%", max: 100 },
              { label: "TEMPERATURE (V1)", val: data.temp, unit: "°C", max: 50 },
              { label: "TILT ANGLE (V2)", val: data.tilt, unit: "°", max: 180 },
            ].map((metric, i) => (
              <div key={i} className="metric-card" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                <div className="metric-label" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#555', marginBottom: 8 }}>{metric.label}</div>
                <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 600, color: '#fff' }}>{metric.val.toFixed(1)}</div>
                <div className="metric-unit" style={{ fontSize: '0.85rem', color: '#888', marginBottom: 16 }}>{metric.unit}</div>
                <div className="progress-bg" style={{ width: '100%', height: 4, background: '#222', borderRadius: 2, overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, (metric.val / metric.max) * 100))}%`, height: '100%', background: '#4ade80', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            ))}

            <div className="metric-card" style={{ gridColumn: '1 / -1', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: '0.85rem' }}>
                <span style={{ color: syncStatus.color }}>{syncStatus.text}</span>
                <span style={{ margin: '0 8px' }}>•</span>
                Tilt controls restricted to Admin Panel only.
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}
