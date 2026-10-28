import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Play, RotateCcw, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

export const FocusZoneView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'game_over'>('title');
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [focusTime, setFocusTime] = useState(0);

  const stateRef = useRef({ gameState, score, energy });
  stateRef.current = { gameState, score, energy };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafc);
    scene.fog = new THREE.Fog(0xfafafc, 15, 45);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 7, 14);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe0dcfe, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 1.2);
    dirLight.position.set(8, 16, 10);
    scene.add(dirLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f8, roughness: 0.8, metalness: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // 3. Composite 3-12 Part Procedural Model: Campus Monument & Library Pavilion
    const campusMonument = new THREE.Group();

    // Part 1: Stepped Foundation Plinth
    const plinthGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.4, 32);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0xe8e8ef, roughness: 0.6, metalness: 0.2 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.2;
    campusMonument.add(plinth);

    // Part 2: Inner Sanctuary Floor
    const innerFloorGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.2, 32);
    const innerFloorMat = new THREE.MeshStandardMaterial({ color: 0x7065e8, roughness: 0.3, metalness: 0.4 });
    const innerFloor = new THREE.Mesh(innerFloorGeo, innerFloorMat);
    innerFloor.position.y = 0.45;
    campusMonument.add(innerFloor);

    // Parts 3-8: 6 Circumferential Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.2, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.3 });
    const numPillars = 6;
    for (let i = 0; i < numPillars; i++) {
      const angle = (i / numPillars) * Math.PI * 2;
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(Math.cos(angle) * 3.0, 2.05, Math.sin(angle) * 3.0);
      campusMonument.add(pillar);
    }

    // Part 9: Architrave Ring
    const ringGeo = new THREE.TorusGeometry(3.0, 0.2, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xe8e8ef, roughness: 0.5, metalness: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 3.7;
    campusMonument.add(ring);

    // Part 10: Glowing Focus Core Orb (AI Knowledge Sparkle)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x7065e8,
      emissive: 0x5a4ed6,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 2.0;
    campusMonument.add(core);

    // Part 11: Orbiting Mindful Ring
    const orbitRingGeo = new THREE.TorusGeometry(1.5, 0.05, 12, 32);
    const orbitRingMat = new THREE.MeshStandardMaterial({ color: 0x18856b, roughness: 0.2, metalness: 0.8 });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.position.y = 2.0;
    campusMonument.add(orbitRing);

    scene.add(campusMonument);

    // 4. Floating Focus Orbs (collectibles in game)
    const orbs: THREE.Mesh[] = [];
    const orbGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0x18856b, roughness: 0.2, metalness: 0.7 });

    for (let i = 0; i < 5; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      const ang = (i / 5) * Math.PI * 2;
      orb.position.set(Math.cos(ang) * 5.5, 1.2, Math.sin(ang) * 5.5);
      scene.add(orb);
      orbs.push(orb);
    }

    // 5. Game Loop & Interactive Input
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameState !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        campusMonument.rotation.y += 0.15;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        campusMonument.rotation.y -= 0.15;
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Collect closest orb
        setScore((prev) => prev + 10);
        core.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => core.scale.set(1, 1, 1), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const animate = () => {
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate procedural monument
      if (stateRef.current.gameState === 'title') {
        campusMonument.rotation.y += 0.3 * dt;
      } else {
        campusMonument.rotation.y += 0.1 * dt;
      }

      core.position.y = 2.0 + Math.sin(elapsed * 2) * 0.15;
      orbitRing.rotation.x = elapsed * 1.5;
      orbitRing.rotation.y = elapsed * 0.8;

      orbs.forEach((o, idx) => {
        o.position.y = 1.0 + Math.sin(elapsed * 2 + idx) * 0.25;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleStartGame = () => {
    setGameState('playing');
    setScore(0);
    setEnergy(100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#7065E8]" />
            3D Campus Zen Focus Zone & Study Break Minigame
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Procedural 11-part architectural Three.js monument for Pomodoro breaks and mental focus reboot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#18856B] bg-[#EAF7F3] px-3 py-1.5 rounded-xl border border-[#A7E3D3]">
            Score: {score} XP
          </span>
          {gameState === 'playing' ? (
            <button
              onClick={() => setGameState('title')}
              className="bg-white border border-[#E8E8EF] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#717487]"
            >
              Reset Session
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Mindful Break Game</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-[520px] bg-white rounded-3xl border border-[#E8E8EF] shadow-md overflow-hidden">
        <div ref={mountRef} className="w-full h-full" />

        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E8E8EF] text-xs pointer-events-none">
          <p className="font-bold text-[#171827]">SAREC Mirzapur Campus Knowledge Pavilion</p>
          <p className="text-[10px] text-[#717487]">Procedural PBR Lighting • ACES Tone Mapping</p>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E8E8EF] text-xs text-[#53566B] font-medium flex items-center gap-4 shadow-sm">
          <span>Controls: <strong className="text-[#171827]">A / D or ← →</strong> Rotate Pavilion</span>
          <span>•</span>
          <span><strong className="text-[#171827]">Space</strong> Collect Focus Sparks (+10 XP)</span>
        </div>

        {gameState === 'title' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center pointer-events-auto">
            <div className="bg-white p-6 rounded-3xl border border-[#E8E8EF] shadow-2xl max-w-sm text-center space-y-3">
              <div className="w-12 h-12 bg-[#F0EEFF] text-[#7065E8] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#171827]">Mindful Study Break</h3>
              <p className="text-xs text-[#717487] leading-relaxed">
                Take a 3-minute breather between heavy assignments. Relax your eyes, align the knowledge core, and recharge mental endurance.
              </p>
              <button
                onClick={handleStartGame}
                className="w-full py-2.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Enter Focus Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
