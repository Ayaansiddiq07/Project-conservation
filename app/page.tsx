"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Cpu, Maximize, Orbit } from "lucide-react";
import ThreeDModel from "../components/ThreeDModel";
import TelemetryDashboard from "../components/TelemetryDashboard";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      <div className="grid-bg"></div>

      {/* NAVIGATION */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
        <div className="logo">AERO-SOLAR // vX.1</div>
        <ul className="nav-links">
          <li><a href="#architecture">Architecture</a></li>
          <li><a href="#interactive">Prototype</a></li>
          <li><a href="#metrics">Telemetry</a></li>
          <li><a href="#future">Future Vision</a></li>
        </ul>
      </nav>

      {/* HERO SECTION */}
      <motion.header 
        className="hero" id="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-badge">
          <span className="dot"></span> SYSTEM ONLINE — TRACKING ACTIVE
        </div>
        <h1>Intelligent Solar Tracking Architecture</h1>
        <p>
          A precision-engineered IoT tracking system designed to dynamically align
          photovoltaic modules with incident sunlight, maximising energy yield via
          closed-loop feedback and telemetry.
        </p>

        <div className="team-grid">
          {[
            { name: "Sameed", id: "4BP25EC028" },
            { name: "Ahmad A.M.", id: "4BP25IC001" },
            { name: "Ayaan Siddique", id: "4BP25IC001" },
          ].map((member, i) => (
            <div className="team-member" key={i}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#444' }} />
              </div>
              <div className="team-info">
                <div className="team-name">{member.name}</div>
                <div className="team-id">{member.id}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.header>

      {/* ARCHITECTURE */}
      <section id="architecture">
        <motion.div 
          className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-head" style={{ marginBottom: 64 }}>
            <span className="section-tag">01 / Infrastructure</span>
            <h2 className="section-title">Hardware Topology</h2>
          </div>

          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div className="card" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
              <div className="card-icon"><Cpu size={20} color="#fff" /></div>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Central Processing (Dual-MCU)</h3>
              <p>Dual-node architecture: An Arduino Uno acts as a current-reduction buffer to protect servo motors from overload, interfaced with an Arduino R4 WiFi for main logic and telemetry transmission.</p>
            </div>
            <div className="card" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
              <div className="card-icon"><Orbit size={20} color="#fff" /></div>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Actuation Layer</h3>
              <p>Two precision SG90 micro servos execute dual-axis adjustments based on algorithmic PID outputs, aligning the panel physically via structural mounts.</p>
            </div>
            <div className="card" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
              <div className="card-icon"><Maximize size={20} color="#fff" /></div>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Environmental Sensing Array</h3>
              <p>A four-quadrant LDR cluster acts as analog optical sensors for differential light comparison, complemented by a DHT11 sensor for ambient climate profiling.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <ThreeDModel />

      <section>
        <motion.div 
          className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="video-container" style={{ width: '100%', maxWidth: 360, borderRadius: 24, overflow: 'hidden', border: '8px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: '#000' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: 1 }}>LIVE DEMO</span>
                </div>
                <div style={{ width: 40, height: 4, borderRadius: 4, background: '#333' }}></div>
                <div style={{ width: 24 }}></div>
              </div>
              <video controls playsInline style={{ width: '100%', display: 'block', maxHeight: 640, objectFit: 'cover', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                <source src="/assets/prototype_demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p style={{ color: '#555', fontSize: '0.85rem', marginTop: 16, textAlign: 'center', maxWidth: 400 }}>
              Working hardware prototype showing the dual-axis automated alignment and data transmission to the IoT dashboard.
            </p>
          </div>
        </motion.div>
      </section>

      <TelemetryDashboard />

      {/* FUTURE VISION */}
      <section id="future">
        <motion.div 
          className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="section-head" style={{ marginBottom: 64 }}>
            <span className="section-tag">04 / Future Vision</span>
            <h2 className="section-title">Future Scope – Project HelioBloom</h2>
            <p style={{ color: '#888', fontSize: '1rem', maxWidth: 800, marginTop: 16 }}>
              Most utility-scale solar farms today rely either on fixed-tilt photovoltaic panels or mechanised solar trackers. While mechanical trackers significantly improve energy production, their reliance on heavy motors, complex gears, linkages, and electronic actuators increases maintenance costs, introduces mechanical failure risks, and elevates operational complexity at a global scale.
            </p>
          </div>

          <div className="timeline" style={{ maxWidth: 800 }}>
            {/* Sub 1 */}
            <div className="timeline-item active">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Current Implemented Technology</h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem' }}>Modern solar power plants widely implement single-axis and dual-axis mechanical trackers to dynamically rotate photovoltaic panels, following the sun's trajectory throughout the day. Major global manufacturers such as Nextracker, Array Technologies, and Solar Steel produce the utility-scale tracking systems that currently dominate large solar infrastructure projects worldwide.</p>
            </div>
            
            {/* Sub 2 */}
            <div className="timeline-item">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Limitations of Fixed Solar Panels</h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem' }}>Fixed panels are fundamentally unable to continuously face the sun as it traverses the sky. Consequently, the angle of incidence between sunlight and the panel surface constantly fluctuates, drastically reducing effective irradiance and causing substantial energy losses due to the cosine effect. Experimental studies comparing fixed photovoltaic systems with active tracking systems have repeatedly demonstrated energy generation gains of nearly <span style={{ color: '#fff', fontWeight: 500 }}>15–40 percent</span> when tracking mechanisms are employed, quantitatively confirming that fixed layouts lose critical efficiency by failing to maintain optimal solar orientation.</p>
              <div style={{ marginTop: 12, padding: 12, borderLeft: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#555', marginBottom: 4 }}>// SUPPORTING RESEARCH // Experimental tracking performance analyses</p>
                <a href="https://academic.oup.com/ce/article/8/6/237/7889269" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#fff', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)', textUnderlineOffset: 4 }}>1. Oxford Academic: Performance analysis of solar tracking systems</a>
                <a href="https://voltageg.com/en/expert-blog/solar-tracker-vs-fixed-panel-europe/" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#fff', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)', textUnderlineOffset: 4 }}>2. Voltage Expert Blog: Solar Tracker vs. Fixed Panel Yield Evaluation</a>
                <a href="https://file.scirp.org/pdf/jpee_1771300.pdf" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#fff', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.15)', textUnderlineOffset: 4 }}>3. SCIRP: Efficiency Comparison Between Fixed Tilt and Dual-Axis Tracking</a>
              </div>
            </div>
            
            {/* Sub 3 */}
            <div className="timeline-item">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Future Research Direction: Project HelioBloom</h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem', marginBottom: 16 }}>Project HelioBloom proposes a paradigm shift in solar architecture, drawing direct biomimicry inspiration from sunflower heliotropism. The concept visualises a central supporting hub anchoring multiple petal-shaped solar panels arranged radially. Each petal panel is mounted on a flexible rib or compliant structure designed to subtly adjust its orientation toward incident sunlight. Instead of relying on traditional electric servos, this research explores passive mechanical responses—such as thermal expansion joints, smart shape-memory materials, or engineered compliant mechanisms—to autonomously produce the micro-orientation adjustments necessary to optimise sunlight capture.</p>
              <Image src="/assets/heliobloom_blueprint.png" alt="HelioBloom Engineering Blueprint" width={800} height={400} style={{ width: '100%', height: 'auto', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }} />
            </div>
            
            {/* Sub 4 */}
            <div className="timeline-item" style={{ paddingBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Future Implementation in Solar Farms</h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem', marginBottom: 16 }}>If successfully developed and effectively scaled, the HelioBloom architecture could drastically reduce mechanical complexity across vast solar arrays. By eliminating thousands of moving motor components and their associated electronic controllers, the design promises to significantly decrease continuous maintenance requirements. This biomimicry-inspired modular design offers distinct advantages: lower baseline operational costs, improved long-term reliability through passive mechanical actuation, and a moderate but highly stable energy efficiency improvement over conventional fixed-panel installations.</p>
              <Image src="/assets/heliobloom_material.jpg" alt="HelioBloom Material Close-up" width={800} height={400} style={{ width: '100%', height: 'auto', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }} />
            </div>
          </div>
        </motion.div>
      </section>

      <footer>
        <p>vX.1 PROTOTYPE // OPEN SOURCE HARDWARE IMPLEMENTATION</p>
      </footer>
    </main>
  );
}
