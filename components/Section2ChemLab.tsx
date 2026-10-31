/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Platform, AcidPool, FallingEquipment, SwitchPlate, Checkpoint } from '../types';
import { sound } from '../services/sound';
import RetroButton from './RetroButton';

interface Section2ChemLabProps {
  onComplete: () => void;
  onRestartWholeGame?: () => void;
}

export const Section2ChemLab: React.FC<Section2ChemLabProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [clearedModal, setClearedModal] = useState<boolean>(false);
  const [checkpointStatus, setCheckpointStatus] = useState<string>('CHECKPOINT: START OF LAB');
  const [lossBanner, setLossBanner] = useState<string | null>(null);

  // Player platformer physics state
  const playerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    isGrounded: boolean;
    facing: 'left' | 'right';
    isDead: boolean;
  }>({
    x: 60,
    y: 360,
    vx: 0,
    vy: 0,
    width: 22,
    height: 34,
    isGrounded: false,
    facing: 'right',
    isDead: false,
  });

  // Checkpoints
  const checkpointsRef = useRef<Checkpoint[]>([
    { id: 0, x: 60, y: 360, isReached: true, label: 'LAB ENTRANCE' },
    { id: 1, x: 500, y: 330, isReached: false, label: 'VENTILATION RIG' },
    { id: 2, x: 920, y: 270, isReached: false, label: 'CENTRAL ACID VATS' },
  ]);

  const activeCheckpointIndexRef = useRef<number>(0);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  // Level World Configuration (Total width: 1400px x height: 480px, camera tracks Ben)
  const worldWidth = 1450;
  const worldHeight = 480;

  // Solid Platforms
  const staticPlatforms: Platform[] = [
    // Starting dock
    { x: 0, y: 400, width: 220, height: 80, color: '#331c54' },
    { x: 260, y: 350, width: 120, height: 25, color: '#4a2578' },
    // First high ledge
    { x: 420, y: 310, width: 100, height: 25, color: '#4a2578' },
    // Intermediate platform (Checkpoint 1)
    { x: 480, y: 380, width: 140, height: 100, color: '#331c54' },
    // Elevated catwalk
    { x: 670, y: 300, width: 130, height: 25, color: '#4a2578' },
    // Platform between acid vats (Checkpoint 2)
    { x: 880, y: 330, width: 130, height: 150, color: '#331c54' },
    // High lab storage rack
    { x: 1070, y: 260, width: 120, height: 25, color: '#4a2578' },
    // Final exit platform
    { x: 1240, y: 360, width: 210, height: 120, color: '#331c54' },
  ];

  // Moving Platforms
  const movingPlatformsRef = useRef<Platform[]>([
    {
      x: 230,
      y: 410,
      width: 80,
      height: 18,
      color: '#f97316',
      isMoving: true,
      vx: 65,
      vy: 0,
      minX: 220,
      maxX: 380,
    },
    {
      x: 800,
      y: 350,
      width: 75,
      height: 18,
      color: '#f97316',
      isMoving: true,
      vx: 75,
      vy: 0,
      minX: 790,
      maxX: 880,
    },
    {
      x: 1000,
      y: 370,
      width: 75,
      height: 18,
      color: '#f97316',
      isMoving: true,
      vx: 0,
      vy: -55,
      minY: 270,
      maxY: 390,
    },
  ]);

  // Acid Pools on the Floor
  const acidPools: AcidPool[] = [
    { x: 220, y: 440, width: 260, height: 40 },
    { x: 620, y: 440, width: 260, height: 40 },
    { x: 1010, y: 440, width: 230, height: 40 },
  ];

  // Switches & Pressure Plates
  const switchesRef = useRef<SwitchPlate[]>([
    {
      id: 'sw-catwalk',
      x: 710,
      y: 290,
      width: 32,
      height: 10,
      isActivated: false,
      linkedDoorOrBridgeId: 'bridge-1',
      label: 'EXTEND SAFETY BRIDGE',
    },
    {
      id: 'sw-exitdoor',
      x: 1120,
      y: 250,
      width: 32,
      height: 10,
      isActivated: false,
      linkedDoorOrBridgeId: 'door-exit',
      label: 'UNLOCK 3RD FL STAIRWELL',
    },
  ]);

  // Falling Lab Equipment
  const fallingEquipRef = useRef<FallingEquipment[]>([
    {
      x: 340,
      y: 40,
      initialY: 40,
      vy: 0,
      warningTimer: 2.2,
      isFalling: false,
      hasLanded: false,
      radius: 12,
      type: 'FLASK',
    },
    {
      x: 740,
      y: 30,
      initialY: 30,
      vy: 0,
      warningTimer: 2.8,
      isFalling: false,
      hasLanded: false,
      radius: 14,
      type: 'BEAKER',
    },
    {
      x: 1150,
      y: 30,
      initialY: 30,
      vy: 0,
      warningTimer: 2.4,
      isFalling: false,
      hasLanded: false,
      radius: 12,
      type: 'FLASK',
    },
  ]);

  // Exit Door location
  const exitDoor = { x: 1370, y: 280, width: 45, height: 80 };

  // Respawn at latest checkpoint
  const respawnAtCheckpoint = useCallback((reason: string) => {
    sound.playHit();
    setLossBanner(reason);
    playerRef.current.isDead = true;

    setTimeout(() => {
      const activeCp = checkpointsRef.current[activeCheckpointIndexRef.current];
      playerRef.current.x = activeCp.x;
      playerRef.current.y = activeCp.y;
      playerRef.current.vx = 0;
      playerRef.current.vy = 0;
      playerRef.current.isDead = false;
      setLossBanner(null);
    }, 450);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;

      // Jump
      if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && playerRef.current.isGrounded && !playerRef.current.isDead) {
        playerRef.current.vy = -450; // Jump impulse
        playerRef.current.isGrounded = false;
        sound.playJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Physics & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const p = playerRef.current;

      if (!p.isDead && !clearedModal) {
        // Horizontal Movement Input
        const keys = keysDownRef.current;
        const moveSpeed = 220;
        let moveX = 0;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

        p.vx = moveX * moveSpeed;
        if (moveX !== 0) {
          p.facing = moveX > 0 ? 'right' : 'left';
        }

        // Apply Gravity
        const gravity = 1100;
        p.vy += gravity * dt;

        // Update Moving Platforms
        movingPlatformsRef.current.forEach((mp) => {
          if (mp.vx) {
            mp.x += mp.vx * dt;
            if (mp.minX && mp.x <= mp.minX) {
              mp.x = mp.minX;
              mp.vx = Math.abs(mp.vx);
            } else if (mp.maxX && mp.x >= mp.maxX) {
              mp.x = mp.maxX;
              mp.vx = -Math.abs(mp.vx);
            }
          }
          if (mp.vy) {
            mp.y += mp.vy * dt;
            if (mp.minY && mp.y <= mp.minY) {
              mp.y = mp.minY;
              mp.vy = Math.abs(mp.vy);
            } else if (mp.maxY && mp.y >= mp.maxY) {
              mp.y = mp.maxY;
              mp.vy = -Math.abs(mp.vy);
            }
          }
        });

        // Compute Bridge state from Switch 1
        const bridgeActive = switchesRef.current.find((s) => s.id === 'sw-catwalk')?.isActivated;
        const bridgePlatform: Platform | null = bridgeActive
          ? { x: 740, y: 340, width: 140, height: 18, color: '#38bdf8' }
          : null;

        const allPlatforms = [
          ...staticPlatforms,
          ...movingPlatformsRef.current,
          ...(bridgePlatform ? [bridgePlatform] : []),
        ];

        // Horizontal integration
        p.x += p.vx * dt;
        p.x = Math.max(10, Math.min(worldWidth - p.width - 10, p.x));

        // Vertical integration & Collision
        p.y += p.vy * dt;
        p.isGrounded = false;

        allPlatforms.forEach((plat) => {
          // Check collision from above (landing on top)
          const isFallingDown = p.vy >= 0;
          const prevY = p.y - p.vy * dt;
          const withinX = p.x + p.width > plat.x && p.x < plat.x + plat.width;

          if (withinX && isFallingDown && prevY + p.height <= plat.y + 12 && p.y + p.height >= plat.y) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;

            // Carry player if on a moving platform
            if (plat.isMoving && plat.vx) {
              p.x += plat.vx * dt;
            }
          }
        });

        // Check Pressure Plates / Switches
        switchesRef.current.forEach((sw) => {
          const onSwitch =
            p.x + p.width > sw.x &&
            p.x < sw.x + sw.width &&
            Math.abs(p.y + p.height - (sw.y + sw.height)) < 12;

          if (onSwitch && !sw.isActivated) {
            sw.isActivated = true;
            sound.playSwitch();
          }
        });

        // Check Falling Lab Equipment
        fallingEquipRef.current.forEach((fe) => {
          fe.warningTimer -= dt;
          if (fe.warningTimer <= 0 && !fe.isFalling && !fe.hasLanded) {
            fe.isFalling = true;
          }

          if (fe.isFalling) {
            fe.vy += 850 * dt;
            fe.y += fe.vy * dt;

            // Check hit with player
            const dist = Math.hypot(p.x + p.width / 2 - fe.x, p.y + p.height / 2 - fe.y);
            if (dist < fe.radius + 14) {
              respawnAtCheckpoint('Struck by Falling Lab Equipment!');
            }

            // Floor hit
            if (fe.y >= 440) {
              fe.isFalling = false;
              fe.hasLanded = true;
              // Reset after 2.5s
              setTimeout(() => {
                fe.y = fe.initialY;
                fe.vy = 0;
                fe.warningTimer = 2.5 + Math.random();
                fe.hasLanded = false;
              }, 2200);
            }
          }
        });

        // Check Acid Pools Collision
        acidPools.forEach((pool) => {
          if (
            p.x + p.width > pool.x &&
            p.x < pool.x + pool.width &&
            p.y + p.height > pool.y + 4
          ) {
            respawnAtCheckpoint('Fell into Hazardous Acid Pool!');
          }
        });

        // Check Bottom Boundary (Falling into abyss)
        if (p.y > worldHeight + 40) {
          respawnAtCheckpoint('Fell into the Lab Chasm!');
        }

        // Check Checkpoints
        checkpointsRef.current.forEach((cp, idx) => {
          if (!cp.isReached && Math.abs(p.x - cp.x) < 35 && Math.abs(p.y - cp.y) < 60) {
            cp.isReached = true;
            activeCheckpointIndexRef.current = idx;
            sound.playCheckpoint();
            setCheckpointStatus(`CHECKPOINT SAVED: ${cp.label}`);
          }
        });

        // Check Exit Door
        const exitUnlocked = switchesRef.current.find((s) => s.id === 'sw-exitdoor')?.isActivated;
        if (
          p.x + p.width > exitDoor.x &&
          p.x < exitDoor.x + exitDoor.width &&
          p.y + p.height > exitDoor.y
        ) {
          if (exitUnlocked) {
            sound.playLevelClear();
            setClearedModal(true);
          } else {
            setLossBanner('Security lock active! Step on the switch on the upper rack!');
            setTimeout(() => setLossBanner(null), 1800);
          }
        }
      }

      // --- RENDERING WITH SMOOTH CAMERA TRACKING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera Offset (Keep Ben centered in view)
      const cameraX = Math.max(0, Math.min(worldWidth - canvas.width, p.x - canvas.width / 2));

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Background Lab Wall (Dark Purple & Toxic Halloween Hues)
      ctx.fillStyle = '#0f051c';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Pipework and conduits in background
      ctx.fillStyle = '#1e0c38';
      ctx.fillRect(0, 80, worldWidth, 14);
      ctx.fillRect(0, 140, worldWidth, 8);

      // Periodic beaker shelves in background
      for (let x = 120; x < worldWidth; x += 280) {
        ctx.fillStyle = '#261145';
        ctx.fillRect(x, 100, 70, 60);
        ctx.strokeStyle = '#3b186b';
        ctx.strokeRect(x, 100, 70, 60);
      }

      // Hanging Chains from the Ceiling
      for (let cx = 180; cx < worldWidth - 100; cx += 220) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, 220);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hanging Flask or Hook
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 5, 220, 10, 12);
      }

      // Render Static Platforms & Ledges
      staticPlatforms.forEach((plat) => {
        ctx.fillStyle = plat.color || '#331c54';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        // Tech grating accents
        ctx.fillStyle = '#220f3a';
        ctx.fillRect(plat.x + 4, plat.y + 4, plat.width - 8, 4);
      });

      // Render Moving Platforms
      movingPlatformsRef.current.forEach((mp) => {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(mp.x, mp.y, mp.width, mp.height);
        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 2;
        ctx.strokeRect(mp.x, mp.y, mp.width, mp.height);

        // Hazard chevron stripes on platform
        ctx.fillStyle = '#7c2d12';
        for (let stripe = 0; stripe < mp.width; stripe += 16) {
          ctx.fillRect(mp.x + stripe, mp.y + 2, 8, mp.height - 4);
        }
      });

      // Render Extended Catwalk Bridge if Switch 1 activated
      const bridgeActive = switchesRef.current.find((s) => s.id === 'sw-catwalk')?.isActivated;
      if (bridgeActive) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(740, 340, 140, 18);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(740, 340, 140, 18);
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('SAFETY CATWALK', 810, 352);
      }

      // Render Hazardous Acid Pools (Bubbling Green Slime)
      acidPools.forEach((pool) => {
        // Pool basin
        ctx.fillStyle = '#0f2913';
        ctx.fillRect(pool.x, pool.y, pool.width, pool.height);

        // Bubbling Slime Surface
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(pool.x, pool.y, pool.width, 10);

        // Acid Bubbles
        const bubbleWave = Math.sin(time * 0.008 + pool.x) * 4;
        for (let b = 10; b < pool.width; b += 25) {
          const bY = pool.y - 2 + Math.sin(time * 0.006 + b) * 3;
          ctx.beginPath();
          ctx.arc(pool.x + b, bY, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#86efac';
        ctx.textAlign = 'center';
        ctx.fillText('DANGEROUS ACID', pool.x + pool.width / 2, pool.y + 25);
      });

      // Render Switches / Pressure Plates
      switchesRef.current.forEach((sw) => {
        ctx.fillStyle = sw.isActivated ? '#22c55e' : '#f97316';
        ctx.fillRect(sw.x, sw.y + (sw.isActivated ? 4 : 0), sw.width, sw.height - (sw.isActivated ? 4 : 0));
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(sw.x, sw.y + (sw.isActivated ? 4 : 0), sw.width, sw.height - (sw.isActivated ? 4 : 0));

        // Switch sign
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = sw.isActivated ? '#4ade80' : '#fdba74';
        ctx.textAlign = 'center';
        ctx.fillText(sw.isActivated ? 'ON' : 'STEP', sw.x + sw.width / 2, sw.y - 8);
      });

      // Render Checkpoints (Lantern Beacons)
      checkpointsRef.current.forEach((cp, idx) => {
        ctx.save();
        ctx.shadowColor = cp.isReached ? '#facc15' : '#38bdf8';
        ctx.shadowBlur = 12;

        ctx.fillStyle = cp.isReached ? '#eab308' : '#0284c7';
        ctx.beginPath();
        ctx.arc(cp.x + 10, cp.y - 12, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`CP ${idx + 1}`, cp.x + 10, cp.y - 26);
        ctx.restore();
      });

      // Render Falling Equipment & Warning Shadows
      fallingEquipRef.current.forEach((fe) => {
        // Floor Warning Shadow
        if (fe.warningTimer > 0 && fe.warningTimer < 1.4) {
          const blink = Math.sin(time * 0.03) > 0;
          ctx.fillStyle = blink ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.2)';
          ctx.beginPath();
          ctx.ellipse(fe.x, 435, 18, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillStyle = '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ FALLING', fe.x, 420);
        }

        // Falling Flask/Beaker
        if (fe.isFalling || fe.warningTimer > 0) {
          ctx.save();
          ctx.fillStyle = fe.type === 'FLASK' ? '#38bdf8' : '#a855f7';
          ctx.beginPath();
          ctx.arc(fe.x, fe.y, fe.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Neck of flask
          ctx.fillRect(fe.x - 3, fe.y - fe.radius - 6, 6, 6);
          ctx.restore();
        }
      });

      // Render Exit Door (to 3rd Floor)
      const exitUnlocked = switchesRef.current.find((s) => s.id === 'sw-exitdoor')?.isActivated;
      ctx.fillStyle = exitUnlocked ? '#15803d' : '#991b1b';
      ctx.fillRect(exitDoor.x, exitDoor.y, exitDoor.width, exitDoor.height);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.strokeRect(exitDoor.x, exitDoor.y, exitDoor.width, exitDoor.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(exitUnlocked ? 'OPEN ▶' : 'LOCKED', exitDoor.x + exitDoor.width / 2, exitDoor.y - 12);

      // Render Ben (Player)
      if (!p.isDead) {
        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width / 2, p.y + p.height, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright RED Haverford Hoodie
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.x, p.y + 10, p.width, 16);

        // White 'H' on chest
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('H', p.x + p.width / 2, p.y + 22);

        // Pants & Shoes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x + 2, p.y + 26, 7, 8);
        ctx.fillRect(p.x + p.width - 9, p.y + 26, 7, 8);

        // Head & Beanie
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Scarlet Haverford Beanie
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(p.x + 2, p.y - 6, p.width - 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + p.width / 2 - 2, p.y - 8, 4, 3); // Pom-pom

        // Ben label
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#f87171';
        ctx.textAlign = 'center';
        ctx.fillText('BEN', p.x + p.width / 2, p.y - 14);
        ctx.restore();
      }

      ctx.restore(); // Restore camera translation

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [clearedModal, respawnAtCheckpoint]);

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      {/* Platformer Canvas Container */}
      <div className="relative w-full max-w-4xl bg-black rounded-lg border-4 border-[#39ff14] shadow-[0_0_35px_rgba(57,255,20,0.3)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="block w-full h-auto aspect-[15/8] select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hazard / Reset Banner */}
        {lossBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white font-retro text-[10px] md:text-xs px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce text-center z-20">
            💀 {lossBanner}
            <div className="text-[9px] text-[#fef08a] mt-0.5">Respawning at checkpoint...</div>
          </div>
        )}

        {/* Level 2 Cleared Modal with Required Exact Message */}
        {clearedModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#170a2c] border-4 border-[#39ff14] shadow-[0_0_35px_rgba(57,255,20,0.6)] p-6 rounded-lg text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-150">
              <span className="text-4xl">🧪</span>
              <div className="px-2.5 py-1 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] font-retro text-[10px] rounded uppercase">
                SECTION 2 COMPLETE
              </div>

              {/* Exact required message */}
              <h2 className="text-xl md:text-2xl font-retro text-[#39ff14] leading-snug">
                “Chemistry lab cleared. Mateo must be on the third floor.”
              </h2>

              <p className="font-vt323 text-lg text-gray-300 leading-tight">
                Ben vaulted over hazardous acid vats, engaged the safety bridges, and reached the
                stairwell to the 3rd floor library!
              </p>

              <div className="w-full pt-2">
                <RetroButton
                  onClick={onComplete}
                  variant="accent"
                  className="w-full text-base py-3.5 !bg-[#39ff14] !border-white !text-black hover:!bg-[#22c55e] shadow-[0_0_20px_rgba(57,255,20,0.6)]"
                >
                  ENTER 3RD FLOOR (ATHENA CHASE) ▶
                </RetroButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkpoint Status Bar & Controls */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between px-2 font-retro text-[9px] text-gray-400 gap-2">
        <span>MOVE: <strong className="text-white">A, D / ARROWS</strong></span>
        <span>JUMP: <strong className="text-[#38bdf8]">SPACEBAR / W</strong></span>
        <span className="text-[#facc15] font-bold">{checkpointStatus}</span>
      </div>
    </div>
  );
};

export default Section2ChemLab;
