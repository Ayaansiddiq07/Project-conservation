"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const COMPONENT_MARKERS = [
  { id: 1, title: 'Photovoltaic Module', desc: 'Generating power proportional to incident light angle.', x: 0, z: -3.5 },
  { id: 2, title: 'Servo Motor (SG90)', desc: 'Precision PWM controlled structural rotation.', x: -2.3, z: -3.5 },
  { id: 3, title: 'DHT11 Thermal Sensor', desc: 'Digital temperature/humidity polling.', x: 2.0, z: -0.5 },
  { id: 4, title: 'Arduino Uno (Current Limiter)', desc: 'Acts as buffer to reduce current, protecting servos from overload.', x: -2.5, z: 3.5 },
  { id: 5, title: 'Arduino R4 WiFi', desc: 'Main logic core running PID calculations and telemetry dispatch.', x: 1.5, z: 3.5 }
];

export default function ThreeDModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ title: "", desc: "", visible: false, x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = 600;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 10, 12);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const loader = new THREE.TextureLoader();
    let imgRatio = 4 / 3;
    let prototypeTexture: THREE.Texture | null = null;
    let boardWidth = 10;
    
    // Group interactables for easy cleanup
    const interactables: THREE.Group[] = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const buildBoard = () => {
      const boardDepth = boardWidth / imgRatio;
      const boardGeo = new THREE.BoxGeometry(boardWidth, 0.4, boardDepth);
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const topMat = prototypeTexture 
        ? new THREE.MeshStandardMaterial({ map: prototypeTexture, roughness: 0.5 })
        : new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
      
      const materials = [ sideMat, sideMat, topMat, sideMat, sideMat, sideMat ];
      const board = new THREE.Mesh(boardGeo, materials);
      board.position.y = -0.2;
      scene.add(board);

      const pinGeo = new THREE.SphereGeometry(0.2, 32, 32);
      const pinInnerGeo = new THREE.SphereGeometry(0.1, 16, 16);

      COMPONENT_MARKERS.forEach(comp => {
        const pinGroup = new THREE.Group();
        pinGroup.position.set(comp.x, 0.5, comp.z);
        
        const outerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const ringGeo = new THREE.RingGeometry(0.25, 0.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        
        const outerMesh = new THREE.Mesh(pinGeo, outerMat);
        const innerMesh = new THREE.Mesh(pinInnerGeo, innerMat);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.4;
        
        pinGroup.add(outerMesh, innerMesh, ring);
        pinGroup.userData = { title: comp.title, desc: comp.desc, baseRing: ring };
        
        scene.add(pinGroup);
        interactables.push(pinGroup);
      });
    };

    loader.load('/assets/prototype_working.jpg', (texture) => {
      prototypeTexture = texture;
      imgRatio = texture.image.width / texture.image.height;
      buildBoard();
    }, undefined, () => buildBoard());

    let hoveredPin: THREE.Group | null = null;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables, true);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const group = intersects[0].object.parent as THREE.Group;
        if (hoveredPin !== group) {
          hoveredPin = group;
          hoveredPin.scale.set(1.4, 1.4, 1.4);
        }
        setTooltip({
          title: group.userData.title,
          desc: group.userData.desc,
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      } else {
        document.body.style.cursor = 'default';
        if (hoveredPin) {
          hoveredPin.scale.set(1, 1, 1);
          hoveredPin = null;
        }
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      
      const t = performance.now() * 0.003;
      interactables.forEach((pin, i) => {
        pin.position.y = 0.5 + Math.sin(t + i) * 0.1;
        const ring = pin.userData.baseRing;
        if (ring) {
          const scale = 1 + Math.max(0, Math.sin(t * 2 + i) * 0.5);
          ring.scale.setScalar(scale);
          ring.material.opacity = 1 - (scale - 1) * 2;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <section id="interactive">
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
        <div className="section-head" style={{ marginBottom: 64 }}>
          <span className="section-tag">02 / Visualization</span>
          <h2 className="section-title">3D Prototype Analysis</h2>
        </div>

        <div ref={containerRef} style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 16, display: 'block' }}></canvas>
          
          <div ref={tooltipRef} className={`tooltip-3d ${tooltip.visible ? '' : 'hidden'}`} style={{ left: tooltip.x, top: tooltip.y }}>
            <h4>{tooltip.title}</h4>
            <p>{tooltip.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
