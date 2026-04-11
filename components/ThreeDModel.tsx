"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const COMPONENTS = [
  { id: 1, title: "Solar Panel (6V)", desc: "Polycrystalline photovoltaic module generating power proportional to incident light angle.", x: 0, z: -1.8, y: 1.0, color: 0x1a3a5c },
  { id: 2, title: "SG90 Servo — Left", desc: "Micro servo controlling horizontal pan rotation via PWM for east-west sun tracking.", x: -1.3, z: -1.8, y: 0.6, color: 0x2563eb },
  { id: 3, title: "SG90 Servo — Right", desc: "Micro servo controlling vertical tilt adjustments for solar altitude tracking.", x: 1.3, z: -1.8, y: 0.6, color: 0x2563eb },
  { id: 4, title: "Main Breadboard", desc: "Solderless prototyping board carrying LDR voltage dividers, DHT11, LED, and signal routing.", x: 0, z: 0, y: 0.2, color: 0xf0ece4 },
  { id: 5, title: "DHT11 Sensor", desc: "Digital temperature & humidity sensor for ambient climate profiling and system thermal management.", x: 0.8, z: 0.1, y: 0.35, color: 0x4fc3f7 },
  { id: 6, title: "Arduino Uno", desc: "Current-reduction buffer node protecting servos from direct power overload.", x: -0.7, z: 1.5, y: 0.2, color: 0x0277b5 },
  { id: 7, title: "Arduino R4 WiFi", desc: "Main logic core running PID calculations and WiFi telemetry dispatch to Blynk IoT cloud.", x: 0.9, z: 1.8, y: 0.2, color: 0x0277b5 },
  { id: 8, title: "LDR Sensor Array", desc: "Four-quadrant analog optical sensors for differential light comparison and sun position detection.", x: -2.5, z: 1.2, y: 0.2, color: 0x8b6914 },
];

export default function ThreeDModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ title: "", desc: "", visible: false, x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(600, window.innerHeight * 0.7);

    // ─── Scene Setup ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4, 5, 6);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enablePan = false;

    // Stop auto-rotate on interaction
    let idleTimer: ReturnType<typeof setTimeout>;
    const onInteract = () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { controls.autoRotate = true; }, 4000);
    };
    renderer.domElement.addEventListener("pointerdown", onInteract);

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0xf0e8d8, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8e0, 1.5);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa8c8e8, 0.6);
    fillLight.position.set(-4, 6, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf5e6c8, 0.8, 20);
    rimLight.position.set(0, 5, 0);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0xffffff, 0.4, 15);
    accentLight.position.set(3, 3, 3);
    scene.add(accentLight);

    // ─── Build Prototype ───
    const interactables: THREE.Mesh[] = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    buildPrototype(scene, interactables);

    // ─── Mouse Interaction ───
    let hoveredMesh: THREE.Mesh | null = null;

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        renderer.domElement.style.cursor = "pointer";

        if (hoveredMesh !== mesh) {
          // Reset previous
          if (hoveredMesh) {
            (hoveredMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
              hoveredMesh.userData.baseEmissive || 0;
          }
          hoveredMesh = mesh;
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
        }

        setTooltip({
          title: mesh.userData.title,
          desc: mesh.userData.desc,
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        renderer.domElement.style.cursor = "default";
        if (hoveredMesh) {
          (hoveredMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
            hoveredMesh.userData.baseEmissive || 0;
          hoveredMesh = null;
        }
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // ─── Animate ───
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // Subtle floating on interactive pins
      const t = performance.now() * 0.001;
      interactables.forEach((mesh, i) => {
        if (mesh.userData.floatable) {
          mesh.position.y = mesh.userData.baseY + Math.sin(t * 0.8 + i * 0.7) * 0.03;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // ─── Resize ───
    const onResize = () => {
      const w = container.clientWidth;
      const h = Math.min(600, window.innerHeight * 0.7);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("resize", onResize);
      clearTimeout(idleTimer);
      renderer.dispose();
      renderer.domElement.style.cursor = "default";
    };
  }, []);

  return (
    <section id="interactive">
      <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div className="section-head" style={{ marginBottom: 48 }}>
          <span className="section-tag">02 / Visualization</span>
          <h2 className="section-title">Interactive 3D Prototype</h2>
          <p className="section-desc">
            Explore the hardware assembly. Hover to inspect components, drag to orbit.
          </p>
        </div>

        <div ref={containerRef} className="interactive-scene" style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              display: "block",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "#020202",
            }}
          />

          <div
            ref={tooltipRef}
            className={`tooltip-3d ${tooltip.visible ? "" : "hidden"}`}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <h4>{tooltip.title}</h4>
            <p>{tooltip.desc}</p>
          </div>

          <div className="scene-label">⊞ DRAG TO ORBIT • HOVER TO INSPECT</div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* ─── BUILD THE FULL PROTOTYPE ASSEMBLY ─── */
/* ═══════════════════════════════════════════════════════ */
function buildPrototype(scene: THREE.Scene, interactables: THREE.Mesh[]) {
  // ─── BASEBOARD (Wooden MDF platform) ───
  const boardGeo = new THREE.BoxGeometry(7, 0.15, 6);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xc89e5a,
    roughness: 0.7,
    metalness: 0.02,
    emissive: 0x6b4f2a,
    emissiveIntensity: 0.06,
  });
  const baseboard = new THREE.Mesh(boardGeo, boardMat);
  baseboard.position.y = 0;
  baseboard.receiveShadow = true;
  baseboard.userData = { title: "Wooden Baseboard", desc: "MDF/plywood mounting platform housing all subsystems in a compact tabletop form factor.", baseEmissive: 0.06 };
  scene.add(baseboard);
  interactables.push(baseboard);

  // Board edge bevel
  const edgeGeo = new THREE.BoxGeometry(7.08, 0.03, 6.08);
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xb08040, roughness: 0.8 });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.y = -0.08;
  scene.add(edge);

  // ─── SOLAR PANEL (Dark blue metallic) ───
  const panelGeo = new THREE.BoxGeometry(2, 0.06, 1.5);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a5c,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x1a3a5c,
    emissiveIntensity: 0.05,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 1.15, -1.8);
  panel.castShadow = true;
  panel.userData = { ...COMPONENTS[0], title: COMPONENTS[0].title, desc: COMPONENTS[0].desc, baseEmissive: 0.05 };
  scene.add(panel);
  interactables.push(panel);

  // Panel frame border
  const frameGeo = new THREE.BoxGeometry(2.1, 0.08, 1.6);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 1.13, -1.8);
  scene.add(frame);

  // Panel cell grid lines
  for (let i = -0.5; i <= 0.5; i += 0.5) {
    const lineGeo = new THREE.BoxGeometry(0.008, 0.005, 1.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0d2240 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(i, 1.19, -1.8);
    scene.add(line);
  }
  for (let j = -0.4; j <= 0.4; j += 0.4) {
    const lineGeo = new THREE.BoxGeometry(2, 0.005, 0.008);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0d2240 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(0, 1.19, -1.8 + j);
    scene.add(line);
  }

  // ─── SERVO MOTORS (Blue SG90s) ───
  const servoPositions = [
    { x: -1.3, label: COMPONENTS[1] },
    { x: 1.3, label: COMPONENTS[2] },
  ];
  servoPositions.forEach(({ x, label }) => {
    // Servo body
    const servoGeo = new THREE.BoxGeometry(0.55, 0.28, 0.25);
    const servoMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x2563eb,
      emissiveIntensity: 0.05,
    });
    const servo = new THREE.Mesh(servoGeo, servoMat);
    servo.position.set(x, 0.65, -1.8);
    servo.castShadow = true;
    servo.userData = { title: label.title, desc: label.desc, baseEmissive: 0.05 };
    scene.add(servo);
    interactables.push(servo);

    // Servo mounting tabs
    const tabGeo = new THREE.BoxGeometry(0.7, 0.04, 0.04);
    const tabMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
    const tab = new THREE.Mesh(tabGeo, tabMat);
    tab.position.set(x, 0.65, -1.65);
    scene.add(tab);

    // Servo shaft
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.07, 12);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(x + (x < 0 ? 0.24 : -0.24), 0.82, -1.8);
    scene.add(shaft);

    // L-bracket mount
    const bracketV = new THREE.BoxGeometry(0.12, 0.55, 0.28);
    const bracketH = new THREE.BoxGeometry(0.18, 0.06, 0.28);
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.15 });
    const bv = new THREE.Mesh(bracketV, bracketMat);
    bv.position.set(x, 0.65, -1.8);
    scene.add(bv);
    const bh = new THREE.Mesh(bracketH, bracketMat);
    bh.position.set(x + (x < 0 ? 0.08 : -0.08), 0.92, -1.8);
    scene.add(bh);
  });

  // Cross-bar connecting servos to panel
  const barGeo = new THREE.BoxGeometry(3.2, 0.04, 0.08);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.2 });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, 1.0, -1.8);
  scene.add(bar);

  // Panel support arm
  const armGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.7, 8);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
  const arm = new THREE.Mesh(armGeo, armMat);
  arm.position.set(0, 0.4, -1.8);
  scene.add(arm);

  // ─── MAIN BREADBOARD (White, long) ───
  const bbGeo = new THREE.BoxGeometry(5, 0.1, 0.9);
  const bbMat = new THREE.MeshStandardMaterial({
    color: 0xf0ece4,
    roughness: 0.6,
    emissive: 0xf0ece4,
    emissiveIntensity: 0.03,
  });
  const breadboard = new THREE.Mesh(bbGeo, bbMat);
  breadboard.position.set(0, 0.15, 0);
  breadboard.userData = { title: COMPONENTS[3].title, desc: COMPONENTS[3].desc, baseEmissive: 0.03 };
  scene.add(breadboard);
  interactables.push(breadboard);

  // Breadboard center channel
  const channelGeo = new THREE.BoxGeometry(4.9, 0.005, 0.06);
  const channelMat = new THREE.MeshStandardMaterial({ color: 0xccc8be });
  const channel = new THREE.Mesh(channelGeo, channelMat);
  channel.position.set(0, 0.21, 0);
  scene.add(channel);

  // Power rail lines (red & blue)
  const redRailGeo = new THREE.BoxGeometry(4.9, 0.006, 0.018);
  const redRailMat = new THREE.MeshBasicMaterial({ color: 0xe53935 });
  const redRail = new THREE.Mesh(redRailGeo, redRailMat);
  redRail.position.set(0, 0.21, 0.4);
  scene.add(redRail);

  const blueRailGeo = new THREE.BoxGeometry(4.9, 0.006, 0.018);
  const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x1e88e5 });
  const blueRail = new THREE.Mesh(blueRailGeo, blueRailMat);
  blueRail.position.set(0, 0.21, -0.4);
  scene.add(blueRail);

  // ─── DHT11 SENSOR (Blue box on breadboard) ───
  const dhtGeo = new THREE.BoxGeometry(0.25, 0.22, 0.15);
  const dhtMat = new THREE.MeshStandardMaterial({
    color: 0x4fc3f7,
    roughness: 0.5,
    emissive: 0x4fc3f7,
    emissiveIntensity: 0.05,
  });
  const dht = new THREE.Mesh(dhtGeo, dhtMat);
  dht.position.set(0.8, 0.35, 0.1);
  dht.userData = { title: COMPONENTS[4].title, desc: COMPONENTS[4].desc, baseEmissive: 0.05, floatable: true, baseY: 0.35 };
  scene.add(dht);
  interactables.push(dht);

  // DHT11 grid pattern
  const dhtGridGeo = new THREE.BoxGeometry(0.15, 0.12, 0.008);
  const dhtGridMat = new THREE.MeshStandardMaterial({ color: 0x3daee0 });
  const dhtGrid = new THREE.Mesh(dhtGridGeo, dhtGridMat);
  dhtGrid.position.set(0.8, 0.39, 0.18);
  scene.add(dhtGrid);

  // ─── RED LED ───
  const ledGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(2.0, 0.3, 0.1);
  scene.add(led);

  // LED glow
  const ledGlowGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const ledGlowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12 });
  const ledGlow = new THREE.Mesh(ledGlowGeo, ledGlowMat);
  ledGlow.position.copy(led.position);
  scene.add(ledGlow);

  // ─── ARDUINO BOARDS (Teal blue PCBs) ───
  const arduinoData = [
    { pos: [-0.7, 0.15, 1.5] as [number, number, number], data: COMPONENTS[5], isUno: true },
    { pos: [0.9, 0.15, 1.8] as [number, number, number], data: COMPONENTS[6], isUno: false },
  ];
  arduinoData.forEach(({ pos, data, isUno }) => {
    // PCB
    const pcbGeo = new THREE.BoxGeometry(1.3, 0.06, 0.85);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0277b5,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x0277b5,
      emissiveIntensity: 0.08,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.position.set(...pos);
    pcb.castShadow = true;
    pcb.userData = { title: data.title, desc: data.desc, baseEmissive: 0.08 };
    scene.add(pcb);
    interactables.push(pcb);

    // USB port
    const usbGeo = new THREE.BoxGeometry(isUno ? 0.2 : 0.14, 0.08, isUno ? 0.16 : 0.1);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.1 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(pos[0] - 0.55, pos[1] + 0.06, pos[2]);
    scene.add(usb);

    // MCU chip (black)
    const chipGeo = new THREE.BoxGeometry(isUno ? 0.4 : 0.3, 0.03, isUno ? 0.14 : 0.28);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(pos[0] + 0.1, pos[1] + 0.05, pos[2]);
    scene.add(chip);

    // Pin headers (top and bottom rows)
    for (let i = 0; i < 14; i++) {
      const pinGeo = new THREE.BoxGeometry(0.03, 0.06, 0.03);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(pos[0] - 0.5 + i * 0.065, pos[1] + 0.04, pos[2] - 0.38);
      scene.add(pin);
    }
    for (let i = 0; i < 6; i++) {
      const pinGeo = new THREE.BoxGeometry(0.03, 0.06, 0.03);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(pos[0] - 0.25 + i * 0.065, pos[1] + 0.04, pos[2] + 0.38);
      scene.add(pin);
    }

    // Power LED (green dot)
    const pLedGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const pLedMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
    const pLed = new THREE.Mesh(pLedGeo, pLedMat);
    pLed.position.set(pos[0] + 0.45, pos[1] + 0.05, pos[2] + 0.3);
    scene.add(pLed);

    // TX/RX LED (amber)
    const txGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const txMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tx = new THREE.Mesh(txGeo, txMat);
    tx.position.set(pos[0] + 0.45, pos[1] + 0.05, pos[2] + 0.22);
    scene.add(tx);

    // WiFi module on R4
    if (!isUno) {
      const wfGeo = new THREE.BoxGeometry(0.2, 0.02, 0.17);
      const wfMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.4 });
      const wf = new THREE.Mesh(wfGeo, wfMat);
      wf.position.set(pos[0] + 0.35, pos[1] + 0.05, pos[2] - 0.15);
      scene.add(wf);
    }
  });

  // ─── LDR SENSOR MODULE ───
  const ldrBoardGeo = new THREE.BoxGeometry(0.6, 0.05, 0.8);
  const ldrBoardMat = new THREE.MeshStandardMaterial({
    color: 0x1b4332,
    roughness: 0.5,
    metalness: 0.15,
    emissive: 0x1b4332,
    emissiveIntensity: 0.06,
  });
  const ldrBoard = new THREE.Mesh(ldrBoardGeo, ldrBoardMat);
  ldrBoard.position.set(-2.5, 0.15, 1.2);
  ldrBoard.userData = { title: COMPONENTS[7].title, desc: COMPONENTS[7].desc, baseEmissive: 0.06 };
  scene.add(ldrBoard);
  interactables.push(ldrBoard);

  // LDR photoresistors (4 amber discs in quadrant)
  const ldrPositions = [
    [-2.6, 0.21, 1.0], [-2.4, 0.21, 1.0],
    [-2.6, 0.21, 1.4], [-2.4, 0.21, 1.4],
  ];
  ldrPositions.forEach((pos) => {
    const ldrGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12);
    const ldrMat = new THREE.MeshStandardMaterial({
      color: 0xc67e2a,
      roughness: 0.5,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.15,
    });
    const ldr = new THREE.Mesh(ldrGeo, ldrMat);
    ldr.position.set(pos[0], pos[1], pos[2]);
    scene.add(ldr);

    // Top pattern
    const patGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.008, 12);
    const patMat = new THREE.MeshStandardMaterial({ color: 0x5c3a0a, roughness: 0.8 });
    const pat = new THREE.Mesh(patGeo, patMat);
    pat.position.set(pos[0], pos[1] + 0.025, pos[2]);
    scene.add(pat);
  });

  // ─── SMALL AUXILIARY BREADBOARD ───
  const sbbGeo = new THREE.BoxGeometry(1, 0.08, 0.6);
  const sbbMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.6, emissive: 0xf0ece4, emissiveIntensity: 0.02 });
  const sbb = new THREE.Mesh(sbbGeo, sbbMat);
  sbb.position.set(-1.6, 0.13, 1.6);
  scene.add(sbb);

  // ─── WIRES ───
  addWire(scene, [-1.1, 0.65, -1.7], [-0.8, 0.22, -0.1], 0xe53935, 0.018);
  addWire(scene, [-1.1, 0.6, -1.9], [-1.0, 0.22, 0.1], 0x111111, 0.018);
  addWire(scene, [1.1, 0.65, -1.7], [1.0, 0.22, 0.2], 0xe53935, 0.018);
  addWire(scene, [1.1, 0.6, -1.9], [0.8, 0.22, -0.2], 0x111111, 0.018);
  // Arduino to breadboard
  addWire(scene, [-0.5, 0.22, 1.1], [-0.5, 0.22, 0.3], 0x4caf50, 0.015);
  addWire(scene, [0.3, 0.22, 1.1], [0.5, 0.22, 0.3], 0xffeb3b, 0.015);
  addWire(scene, [0.9, 0.22, 1.4], [1.2, 0.22, 0.2], 0x2196f3, 0.015);
  // Arduino to Arduino
  addWire(scene, [0.2, 0.22, 1.1], [0.2, 0.22, 1.45], 0x4caf50, 0.012);
  addWire(scene, [-0.3, 0.22, 1.1], [-0.3, 0.22, 1.45], 0xe53935, 0.012);
  // LDR to breadboard
  addWire(scene, [-2.3, 0.18, 1.2], [-1.3, 0.22, 0.1], 0x795548, 0.014);
  addWire(scene, [-2.3, 0.16, 1.0], [-1.6, 0.22, 0.2], 0x4caf50, 0.014);
}

/* ─── Helper: Create a curved wire between two points ─── */
function addWire(
  scene: THREE.Scene,
  from: [number, number, number],
  to: [number, number, number],
  color: number,
  thickness: number
) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
  mid.y += 0.2; // Slight droop/arch

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const tubeGeo = new THREE.TubeGeometry(curve, 12, thickness, 6, false);
  const tubeMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  const wire = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(wire);
}
