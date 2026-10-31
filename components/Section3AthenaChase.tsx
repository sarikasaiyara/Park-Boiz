/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sound } from '../services/sound';

interface Section3AthenaChaseProps {
  onComplete: () => void;
}

export const Section3AthenaChase: React.FC<Section3AthenaChaseProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [escapeProgress, setEscapeProgress] = useState<number>(0);
  const [athenaDistance, setAthenaDistance] = useState<number>(300); // pixels behind Ben
  const [mashPrompt, setMashPrompt] = useState<boolean>(true);
  const [lossBanner, setLossBanner] = useState<string | null>(null);
  const [checkpointStatus, setCheckpointStatus] = useState<string>('START OF 3RD FLOOR');

  // Track total length of chase corridor: 4000 pixels
  const totalTrackLength = 3800;

  // Player physics state
  const playerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    isGrounded: boolean;
    isClimbing: boolean;
    facing: 'left' | 'right';
    sprintBoost: number;
    isDead: boolean;
  }>({
    x: 80,
    y: 350,
    vx: 0,
    vy: 0,
    width: 22,
    height: 34,
    isGrounded: true,
    isClimbing: false,
    facing: 'right',
    sprintBoost: 0,
    isDead: false,
  });

  // Athena Ghost state
  const athenaRef = useRef<{
    x: number;
    y: number;
    baseSpeed: number;
    wobble: number;
  }>({
    x: -220,
    y: 330,
    baseSpeed: 175, // balanced to give player thrilling 60-75s demo chase
    wobble: 0,
  });

  // Checkpoints along the 3rd floor chase
  const checkpointsRef = useRef<number[]>([80, 1300, 2500]);
  const activeCheckpointIndexRef = useRef<number>(0);

  // Dynamic Obstacles along the chase corridor
  const obstacles = useRef<{
    platforms: { x: number; y: number; width: number; height: number }[];
    ladders: { x: number; y: number; width: number; height: number }[];
    gaps: { x: number; width: number }[];
    rollingBeakers: { x: number; y: number; vx: number }[];
    fallingBooks: { x: number; y: number; initialY: number; isFalling: boolean; timer: number }[];
  }>({
    platforms: [
      { x: 400, y: 310, width: 140, height: 20 },
      { x: 750, y: 280, width: 130, height: 20 },
      { x: 1050, y: 320, width: 150, height: 20 },
      { x: 1450, y: 300, width: 160, height: 20 },
      { x: 1800, y: 270, width: 140, height: 20 },
      { x: 2200, y: 310, width: 160, height: 20 },
      { x: 2650, y: 280, width: 150, height: 20 },
      { x: 3100, y: 300, width: 180, height: 20 },
    ],
    ladders: [
      { x: 740, y: 280, width: 24, height: 110 },
      { x: 1790, y: 270, width: 24, height: 120 },
      { x: 2640, y: 280, width: 24, height: 110 },
    ],
    gaps: [
      { x: 600, width: 110 },
      { x: 1250, width: 120 },
      { x: 2000, width: 130 },
      { x: 2900, width: 140 },
    ],
    rollingBeakers: [
      { x: 950, y: 375, vx: -120 },
      { x: 1650, y: 375, vx: -130 },
      { x: 2450, y: 375, vx: -140 },
      { x: 3350, y: 375, vx: -130 },
    ],
    fallingBooks: [
      { x: 500, y: 60, initialY: 60, isFalling: false, timer: 1.8 },
      { x: 1100, y: 60, initialY: 60, isFalling: false, timer: 2.2 },
      { x: 1900, y: 60, initialY: 60, isFalling: false, timer: 2.0 },
      { x: 2750, y: 60, initialY: 60, isFalling: false, timer: 1.9 },
      { x: 3450, y: 60, initialY: 60, isFalling: false, timer: 2.1 },
    ],
  });

  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  // Reset to most recent checkpoint
  const respawnAtCheckpoint = useCallback((reason: string) => {
    sound.playHit();
    setLossBanner(reason);
    playerRef.current.isDead = true;

    setTimeout(() => {
      const cpX = checkpointsRef.current[activeCheckpointIndexRef.current];
      playerRef.current.x = cpX;
      playerRef.current.y = 350;
      playerRef.current.vx = 0;
      playerRef.current.vy = 0;
      playerRef.current.sprintBoost = 0;
      playerRef.current.isDead = false;

      // Reset Athena behind player by 350px
      athenaRef.current.x = cpX - 350;

      setLossBanner(null);
    }, 500);
  }, []);

  // Keyboard handlers for movement and Spacebar mash boost
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;

      // Spacebar repeated press: gives a burst of speed / increases escape progress!
      if (e.code === 'Space' || e.code === 'KeyE') {
        const p = playerRef.current;
        if (!p.isDead) {
          // Repeated press boost
          p.sprintBoost = Math.min(p.sprintBoost + 60, 220);
          sound.playDash();

          // Jump if grounded
          if (p.isGrounded) {
            p.vy = -460;
            p.isGrounded = false;
            sound.playJump();
          }
        }
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

  // Main Platforming Chase Loop
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
      const athena = athenaRef.current;

      if (!p.isDead) {
        // Base running speed + mash boost decay
        const keys = keysDownRef.current;
        let baseRun = 180;
        if (keys['KeyD'] || keys['ArrowRight']) baseRun = 210;
        if (keys['KeyA'] || keys['ArrowLeft']) baseRun = 90; // slow down if running backward

        p.sprintBoost = Math.max(0, p.sprintBoost - dt * 90);
        const currentSpeed = baseRun + p.sprintBoost;

        p.vx = currentSpeed;
        p.x += p.vx * dt;

        // Gravity & Vertical Movement
        const gravity = 1100;
        p.vy += gravity * dt;
        p.y += p.vy * dt;

        // Check if on ladder
        const touchingLadder = obstacles.current.ladders.some(
          (lad) =>
            p.x + p.width > lad.x &&
            p.x < lad.x + lad.width &&
            p.y + p.height >= lad.y &&
            p.y <= lad.y + lad.height
        );

        if (touchingLadder && (keys['KeyW'] || keys['ArrowUp'])) {
          p.vy = -180;
          p.isGrounded = true;
        }

        // Floor ground collision (Ground Y = 390)
        let isOverGap = false;
        obstacles.current.gaps.forEach((gap) => {
          if (p.x + p.width > gap.x && p.x < gap.x + gap.width) {
            isOverGap = true;
          }
        });

        p.isGrounded = false;
        if (!isOverGap && p.y + p.height >= 390) {
          p.y = 390 - p.height;
          p.vy = 0;
          p.isGrounded = true;
        }

        // Platforms collision
        obstacles.current.platforms.forEach((plat) => {
          const withinX = p.x + p.width > plat.x && p.x < plat.x + plat.width;
          const falling = p.vy >= 0;
          if (withinX && falling && p.y + p.height >= plat.y && p.y + p.height <= plat.y + 15) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        });

        // Bottom pit check
        if (p.y > 480) {
          respawnAtCheckpoint('Fell into broken 3rd floor chasm!');
        }

        // Update Rolling Beakers
        obstacles.current.rollingBeakers.forEach((rb) => {
          rb.x += rb.vx * dt;
          // Hit check with Ben
          const dist = Math.hypot(p.x + p.width / 2 - rb.x, p.y + p.height / 2 - rb.y);
          if (dist < 18) {
            respawnAtCheckpoint('Tripped on rolling chemistry beaker!');
          }
        });

        // Update Falling Books
        obstacles.current.fallingBooks.forEach((fb) => {
          // If player is within 140px, trigger book fall
          if (Math.abs(p.x - fb.x) < 140 && !fb.isFalling && fb.y === fb.initialY) {
            fb.isFalling = true;
          }
          if (fb.isFalling) {
            fb.y += 350 * dt;
            // Hit check with Ben
            if (Math.abs(p.x + p.width / 2 - fb.x) < 20 && Math.abs(p.y + p.height / 2 - fb.y) < 22) {
              respawnAtCheckpoint('Struck by falling library reference books!');
            }
          }
        });

        // Checkpoints Check
        if (p.x >= 2500 && activeCheckpointIndexRef.current < 2) {
          activeCheckpointIndexRef.current = 2;
          sound.playCheckpoint();
          setCheckpointStatus('CHECKPOINT 2 SAVED (MATH LOUNGE REACHED)');
        } else if (p.x >= 1300 && activeCheckpointIndexRef.current < 1) {
          activeCheckpointIndexRef.current = 1;
          sound.playCheckpoint();
          setCheckpointStatus('CHECKPOINT 1 SAVED (LIBRARY CORRIDOR)');
        }

        // Update Athena (The Spooky Bryn Mawr Academic Ghost)
        athena.wobble += dt * 4;
        const distToPlayer = p.x - athena.x;

        // Athena speeds up if player is far, but slows down slightly if close so player has escape chance
        const athenaSpeed = athena.baseSpeed + (distToPlayer > 380 ? 40 : distToPlayer < 180 ? -15 : 10);
        athena.x += athenaSpeed * dt;
        athena.y = 320 + Math.sin(athena.wobble) * 20;

        // Distance state
        const currentDist = Math.max(0, Math.round(p.x - athena.x));
        setAthenaDistance(currentDist);

        // Athena catches Ben!
        if (athena.x >= p.x - 18) {
          respawnAtCheckpoint('Caught by Athena’s Academic Ghost!');
        }

        // Escape Progress (0 to 100%)
        const progressPct = Math.min(100, Math.max(0, Math.round((p.x / totalTrackLength) * 100)));
        setEscapeProgress(progressPct);

        // Reached end of 3rd Floor! (Mateo is found!)
        if (p.x >= totalTrackLength) {
          sound.playVictory();
          onComplete();
          return;
        }
      }

      // --- RENDER ATHENA CHASE SCENE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera centered on Ben
      const cameraX = Math.max(0, p.x - 280);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // 3rd Floor Library Walls (Dark Midnight Navy/Blue with Halloween Orange Lamps)
      ctx.fillStyle = '#08081a';
      ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

      // Starry Observatory Windows overlooking campus in background
      for (let wx = Math.floor(cameraX / 240) * 240; wx < cameraX + canvas.width + 240; wx += 240) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(wx + 20, 40, 110, 140);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx + 20, 40, 110, 140);

        // Starry night sky in window
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(wx + 45, 65, 2, 2);
        ctx.fillRect(wx + 80, 85, 2, 2);
        ctx.fillRect(wx + 60, 120, 3, 3);
        // Orange moon
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(wx + 95, 65, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Library Bookshelves Background
      for (let bx = Math.floor(cameraX / 300) * 300; bx < cameraX + canvas.width + 300; bx += 300) {
        ctx.fillStyle = '#2e1065';
        ctx.fillRect(bx + 140, 140, 90, 250);
        ctx.strokeStyle = '#581c87';
        ctx.strokeRect(bx + 140, 140, 90, 250);
      }

      // Solid Floor (with Gaps for broken sections)
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(cameraX, 390, canvas.width, 90);
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 3;
      ctx.strokeRect(cameraX, 390, canvas.width, 90);

      // Clear Gaps
      obstacles.current.gaps.forEach((gap) => {
        ctx.clearRect(gap.x, 390, gap.width, 90);
        ctx.fillStyle = '#030208';
        ctx.fillRect(gap.x, 390, gap.width, 90);
        // Hazard warning edge
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(gap.x - 4, 390, 4, 15);
        ctx.fillRect(gap.x + gap.width, 390, 4, 15);
      });

      // Render Elevated Platforms
      obstacles.current.platforms.forEach((plat) => {
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      });

      // Render Ladders
      obstacles.current.ladders.forEach((lad) => {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        // Rails
        ctx.beginPath();
        ctx.moveTo(lad.x, lad.y);
        ctx.lineTo(lad.x, lad.y + lad.height);
        ctx.moveTo(lad.x + lad.width, lad.y);
        ctx.lineTo(lad.x + lad.width, lad.y + lad.height);
        ctx.stroke();

        // Rungs
        for (let ry = lad.y + 12; ry < lad.y + lad.height; ry += 16) {
          ctx.beginPath();
          ctx.moveTo(lad.x, ry);
          ctx.lineTo(lad.x + lad.width, ry);
          ctx.stroke();
        }
      });

      // Render Rolling Beakers
      obstacles.current.rollingBeakers.forEach((rb) => {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(rb.x, rb.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      // Render Falling Books
      obstacles.current.fallingBooks.forEach((fb) => {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(fb.x - 10, fb.y, 20, 26);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(fb.x - 10, fb.y, 20, 26);
      });

      // Render ATHENA (The Spooky Bryn Mawr Academic Ghost)
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;

      // Eerie Spectral Trail & Aura
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(athena.x - 15, athena.y, 28, 0, Math.PI * 2);
      ctx.fill();

      // Ghost Academic Robes
      ctx.fillStyle = 'rgba(224, 242, 254, 0.95)';
      ctx.beginPath();
      ctx.arc(athena.x, athena.y, 20, Math.PI, 0, false);
      ctx.lineTo(athena.x + 20, athena.y + 36);
      ctx.lineTo(athena.x + 10, athena.y + 28);
      ctx.lineTo(athena.x, athena.y + 38);
      ctx.lineTo(athena.x - 10, athena.y + 28);
      ctx.lineTo(athena.x - 20, athena.y + 36);
      ctx.closePath();
      ctx.fill();

      // Academic Mortarboard Cap
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(athena.x - 18, athena.y - 28, 36, 6);
      ctx.fillRect(athena.x - 8, athena.y - 22, 16, 6);
      // Tassel
      ctx.fillStyle = '#facc15';
      ctx.fillRect(athena.x + 14, athena.y - 26, 3, 12);

      // Glowing Cyan Ghost Eyes
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(athena.x + 6, athena.y - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(athena.x + 14, athena.y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Ghost Label
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('ATHENA GHOST', athena.x, athena.y - 36);

      ctx.restore();

      // Render Ben (Player in RED Haverford Hoodie sprinting)
      if (!p.isDead) {
        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width / 2, p.y + p.height, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Speed trail lines if sprinting
        if (p.sprintBoost > 40) {
          ctx.strokeStyle = 'rgba(255, 119, 0, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x - 20, p.y + 10);
          ctx.lineTo(p.x, p.y + 10);
          ctx.moveTo(p.x - 30, p.y + 20);
          ctx.lineTo(p.x - 5, p.y + 20);
          ctx.stroke();
        }

        // Bright RED Haverford Hoodie
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.x, p.y + 10, p.width, 16);

        // White 'H' on chest
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('H', p.x + p.width / 2, p.y + 22);

        // Running legs
        const runCycle = Math.sin(time * 0.02) * 8;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x + 2 + runCycle, p.y + 26, 6, 8);
        ctx.fillRect(p.x + p.width - 8 - runCycle, p.y + 26, 6, 8);

        // Head & Beanie
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + 4, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.fillRect(p.x + 2, p.y - 6, p.width - 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + p.width / 2 - 2, p.y - 8, 4, 3);

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
  }, [totalTrackLength, onComplete, respawnAtCheckpoint]);

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      {/* Action Platformer Canvas Container */}
      <div className="relative w-full max-w-4xl bg-black rounded-lg border-4 border-[#ff2a6d] shadow-[0_0_40px_rgba(255,42,109,0.5)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="block w-full h-auto aspect-[15/8] select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* HUD Overlay: Escape Progress & Athena Distance Bar */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
          
          {/* Escape Progress Bar */}
          <div className="bg-[#0b0318]/90 border-2 border-[#00e5ff] rounded-lg p-2 flex items-center gap-3 min-w-[260px] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <span className="font-retro text-[9px] text-[#00e5ff]">
              ESCAPE PROGRESS:
            </span>
            <div className="flex-1 bg-black/60 border border-[#00e5ff] h-4 rounded overflow-hidden p-0.5">
              <div
                className="bg-[#00e5ff] h-full rounded transition-all duration-100"
                style={{ width: `${escapeProgress}%` }}
              ></div>
            </div>
            <span className="font-retro text-[10px] text-white font-bold w-10 text-right">
              {escapeProgress}%
            </span>
          </div>

          {/* Athena Distance Proximity Alert */}
          <div
            className={`border-2 rounded-lg p-2 font-retro text-[9px] flex items-center gap-2 transition-all ${
              athenaDistance < 140
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : athenaDistance < 240
                ? 'bg-yellow-950/90 border-yellow-500 text-yellow-300'
                : 'bg-purple-950/90 border-purple-500 text-purple-300'
            }`}
          >
            <span>👻 ATHENA:</span>
            <span className="font-bold text-xs">{athenaDistance}px BEHIND</span>
          </div>
        </div>

        {/* Button Mashing Instruction Prompt */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#ff7700] text-black font-retro text-[10px] md:text-xs px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(255,119,0,0.8)] animate-pulse z-20">
          ⚡ MASH [SPACEBAR] OR [E] REPEATEDLY TO SPRINT & ESCAPE!
        </div>

        {/* Hazard / Reset Banner */}
        {lossBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white font-retro text-[10px] md:text-xs px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce text-center z-30">
            💀 {lossBanner}
            <div className="text-[9px] text-[#fef08a] mt-0.5">Respawning at checkpoint...</div>
          </div>
        )}
      </div>

      {/* Checkpoint Status Bar & Controls */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between px-2 font-retro text-[9px] text-gray-400 gap-2">
        <span>MOVE: <strong className="text-white">A, D / ARROWS</strong></span>
        <span>JUMP & SPRINT: <strong className="text-[#38bdf8]">SPACEBAR (MASH TO BOOST)</strong></span>
        <span className="text-[#facc15] font-bold">{checkpointStatus}</span>
      </div>
    </div>
  );
};

export default Section3AthenaChase;
