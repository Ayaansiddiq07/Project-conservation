"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Cpu, Maximize, Orbit, Sun, Zap, Radio } from "lucide-react";

/* ─── Dynamic Imports (SSR-safe) ─── */
const HeroScene = dynamic(() => import("../components/HeroScene"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, background: "#000" }} />,
});

const AmbientParticles = dynamic(() => import("../components/AmbientParticles"), {
  ssr: false,
});

const ScrollEngine = dynamic(() => import("../components/ScrollEngine"), {
  ssr: false,
});

const ThreeDModel = dynamic(() => import("../components/ThreeDModel"), {
  ssr: false,
  loading: () => (
    <section id="interactive">
      <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="section-tag">02 / Visualization</span>
          <h2 className="section-title">Interactive 3D Prototype</h2>
        </div>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            aspectRatio: "16/10",
            borderRadius: 16,
            background: "#030303",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#222", fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
            INITIALIZING 3D ENGINE...
          </span>
        </div>
      </div>
    </section>
  ),
});

const TelemetryDashboard = dynamic(() => import("../components/TelemetryDashboard"), {
  ssr: false,
  loading: () => (
    <section id="metrics">
      <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="section-tag">03 / Telemetry</span>
          <h2 className="section-title">Blynk IoT Live Diagnostics</h2>
        </div>
        <div
          className="glass-panel"
          style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ color: "#222", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
            CONNECTING TO BLYNK...
          </span>
        </div>
      </div>
    </section>
  ),
});

/* ─── Card Mouse Glow Handler ─── */
function useCardGlow() {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
  }, []);
  return handleMouseMove;
}

/* ─── Active Nav Section Detection ─── */
function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = ["architecture", "interactive", "metrics", "future"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

/* ─── ARCHITECTURE CARD DATA ─── */
const ARCH_CARDS = [
  {
    icon: Cpu,
    title: "Central Processing (Dual-MCU)",
    desc: "Dual-node architecture: An Arduino Uno acts as a current-reduction buffer to protect servo motors from overload, interfaced with an Arduino R4 WiFi for main logic and telemetry transmission.",
    accent: "#f59e0b",
  },
  {
    icon: Orbit,
    title: "Actuation Layer",
    desc: "Two precision SG90 micro servos execute dual-axis adjustments based on algorithmic PID outputs, aligning the panel physically via structural mounts.",
    accent: "#06b6d4",
  },
  {
    icon: Maximize,
    title: "Environmental Sensing Array",
    desc: "A four-quadrant LDR cluster acts as analog optical sensors for differential light comparison, complemented by a DHT11 sensor for ambient climate profiling.",
    accent: "#4ade80",
  },
];

/* ═══════════════════════════════════ */
/* ─── MAIN PAGE COMPONENT ─── */
/* ═══════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();
  const cardGlow = useCardGlow();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      {/* Background layers */}
      <div className="grain-overlay" />
      <div className="grid-bg" />
      <AmbientParticles />
      <ScrollEngine />

      {/* Scroll progress indicator */}
      <div className="scroll-progress" />

      {/* ─── NAVIGATION ─── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <div className="logo">
          <span className="logo-dot" />
          AERO-SOLAR // vX.1
        </div>
        <ul className="nav-links">
          {[
            { href: "#architecture", label: "Architecture", id: "architecture" },
            { href: "#interactive", label: "Prototype", id: "interactive" },
            { href: "#metrics", label: "Telemetry", id: "metrics" },
            { href: "#future", label: "Future Vision", id: "future" },
          ].map((link) => (
            <li key={link.id}>
              <a href={link.href} className={activeSection === link.id ? "active" : ""}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <header className="hero" id="hero">
        {/* 3D Background */}
        <div className="hero-canvas-wrap">
          <HeroScene />
        </div>

        {/* Ambient halos */}
        <div
          className="ambient-halo ambient-halo--amber"
          style={{ top: "10%", right: "5%" }}
        />
        <div
          className="ambient-halo ambient-halo--cyan"
          style={{ bottom: "15%", left: "10%" }}
        />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" /> SYSTEM ONLINE — TRACKING ACTIVE
          </div>
          <h1>Intelligent Solar Tracking Architecture</h1>
          <p>
            A precision-engineered IoT tracking system designed to dynamically
            align photovoltaic modules with incident sunlight, maximising energy
            yield via closed-loop feedback and telemetry.
          </p>

          <div className="team-grid">
            {[
              { name: "Ahmad A.M.", id: "4BP25IC001" },
              { name: "Ayaan Siddique", id: "4BP25IC001" },
            ].map((member, i) => (
              <div className="team-member" key={i}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #333, #555)",
                    }}
                  />
                </div>
                <div className="team-info">
                  <div className="team-name">{member.name}</div>
                  <div className="team-id">{member.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── ARCHITECTURE ─── */}
      <section id="architecture">
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
          {/* Ambient glow */}
          <div
            className="ambient-halo ambient-halo--amber"
            style={{ top: "-20%", left: "-15%", opacity: 0.5 }}
          />

          <div className="section-head" style={{ marginBottom: 56 }}>
            <span className="section-tag">01 / Infrastructure</span>
            <h2 className="section-title">Hardware Topology</h2>
            <p className="section-desc">
              Core subsystems powering the solar tracking prototype.
            </p>
          </div>

          <div className="bento-grid">
            {ARCH_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="glass-card"
                  style={{ padding: 28 }}
                  onMouseMove={cardGlow}
                >
                  <div className="card-icon">
                    <Icon size={20} color="#fff" />
                  </div>
                  <h3>{card.title}</h3>
                  <p className="card-desc">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3D PROTOTYPE VIEWER ─── */}
      <ThreeDModel />

      {/* ─── VIDEO DEMO ─── */}
      <section>
        <div className="container sr-scale" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="video-container" style={{ width: "100%", maxWidth: 380 }}>
              <div className="video-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="video-dot" />
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-mono)",
                      color: "#888",
                      letterSpacing: "0.08em",
                    }}
                  >
                    LIVE DEMO
                  </span>
                </div>
                <div style={{ width: 36, height: 3, borderRadius: 3, background: "#222" }} />
                <div style={{ width: 20 }} />
              </div>
              <video
                controls
                playsInline
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 640,
                  objectFit: "cover",
                }}
              >
                <source src="/assets/prototype_demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p
              style={{
                color: "#444",
                fontSize: "0.8rem",
                marginTop: 16,
                textAlign: "center",
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              Working hardware prototype showing dual-axis automated alignment
              and data transmission to the IoT dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ─── TELEMETRY DASHBOARD ─── */}
      <TelemetryDashboard />

      {/* ─── FUTURE VISION ─── */}
      <section id="future">
        <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px" }}>
          {/* Ambient glow */}
          <div
            className="ambient-halo ambient-halo--cyan"
            style={{ top: "0%", right: "-20%", opacity: 0.4 }}
          />

          <div className="section-head" style={{ marginBottom: 56 }}>
            <span className="section-tag">04 / Future Vision</span>
            <h2 className="section-title">Future Scope — Project HelioBloom</h2>
            <p className="section-desc">
              Most utility-scale solar farms today rely either on fixed-tilt
              photovoltaic panels or mechanised solar trackers. While mechanical
              trackers significantly improve energy production, their reliance on
              heavy motors, complex gears, linkages, and electronic actuators
              increases maintenance costs and operational complexity.
            </p>
          </div>

          <div className="timeline" style={{ maxWidth: 700 }}>
            {/* Timeline Item 1 */}
            <div className="timeline-item active">
              <h3>Current Implemented Technology</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7 }}>
                Modern solar power plants widely implement single-axis and
                dual-axis mechanical trackers to dynamically rotate photovoltaic
                panels, following the sun's trajectory throughout the day. Major
                global manufacturers such as Nextracker, Array Technologies, and
                Solar Steel produce the utility-scale tracking systems that
                currently dominate large solar infrastructure projects worldwide.
              </p>
            </div>

            {/* Timeline Item 2 */}
            <div className="timeline-item">
              <h3>Limitations of Fixed Solar Panels</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7 }}>
                Fixed panels are fundamentally unable to continuously face the
                sun as it traverses the sky. The angle of incidence constantly
                fluctuates, drastically reducing effective irradiance and causing
                substantial energy losses due to the cosine effect. Studies have
                demonstrated energy generation gains of nearly{" "}
                <span style={{ color: "#fff", fontWeight: 500 }}>
                  15–40 percent
                </span>{" "}
                when tracking mechanisms are employed.
              </p>
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderLeft: "2px solid rgba(245,158,11,0.2)",
                  background: "rgba(245,158,11,0.02)",
                  borderRadius: "0 8px 8px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    color: "#444",
                    marginBottom: 2,
                  }}
                >
                  // SUPPORTING RESEARCH
                </p>
                {[
                  { url: "https://academic.oup.com/ce/article/8/6/237/7889269", text: "1. Oxford Academic: Performance analysis of solar tracking systems" },
                  { url: "https://voltageg.com/en/expert-blog/solar-tracker-vs-fixed-panel-europe/", text: "2. Voltage Expert Blog: Solar Tracker vs. Fixed Panel Yield Evaluation" },
                  { url: "https://file.scirp.org/pdf/jpee_1771300.pdf", text: "3. SCIRP: Efficiency Comparison Between Fixed Tilt and Dual-Axis" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.8rem",
                      color: "#999",
                      textDecoration: "underline",
                      textDecorationColor: "rgba(255,255,255,0.08)",
                      textUnderlineOffset: 3,
                      transition: "color 0.2s",
                    }}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="timeline-item">
              <h3>Future Research Direction: Project HelioBloom</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 16 }}>
                Project HelioBloom proposes a paradigm shift in solar
                architecture, drawing direct biomimicry inspiration from
                sunflower heliotropism. The concept visualises a central
                supporting hub anchoring multiple petal-shaped solar panels
                arranged radially, using passive mechanical responses — thermal
                expansion joints, smart shape-memory materials, or engineered
                compliant mechanisms — to autonomously optimise sunlight capture.
              </p>
              <Image
                src="/assets/heliobloom_blueprint.png"
                alt="HelioBloom Engineering Blueprint"
                width={800}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>

            {/* Timeline Item 4 */}
            <div className="timeline-item" style={{ paddingBottom: 0 }}>
              <h3>Future Implementation in Solar Farms</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 16 }}>
                If successfully developed, the HelioBloom architecture could
                drastically reduce mechanical complexity across vast solar
                arrays. By eliminating thousands of moving motor components, the
                design promises lower baseline operational costs, improved
                long-term reliability through passive mechanical actuation, and
                stable energy efficiency improvement over fixed-panel
                installations.
              </p>
              <Image
                src="/assets/heliobloom_material.jpg"
                alt="HelioBloom Material Close-up"
                width={800}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Sun size={12} color="#f59e0b" />
          <p>vX.1 PROTOTYPE // OPEN SOURCE HARDWARE IMPLEMENTATION</p>
        </div>
        <p style={{ fontSize: "0.65rem" }}>
          © {new Date().getFullYear()} Ayaan Siddique. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
