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
  const [athenaDistance, setAthenaDistance] = useState<number>(300);
  const [lossBanner, setLossBanner] = useState<string | null>(null);
  const [checkpointStatus, setCheckpointStatus] = useState<string>('START OF 3RD FLOOR');

  const totalTrackLength = 3800;

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

  const athenaRef = useRef<{
    x: number;
    y: number;
    baseSpeed: number;
    wobble: number;
  }>({
    x: -220,
    y: 330,
    baseSpeed: 175,
    wobble: 0,
  });

  const checkpointsRef = useRef<number[]>([80, 1300, 2500]);
  const activeCheckpointIndexRef = useRef<number>(0);

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

      athenaRef.current.x = cpX - 350;
      setLossBanner(null);
    }, 500);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;

      if (e.code === 'Space' || e.code === 'KeyE') {
        const p = playerRef.current;
        if (!p.isDead) {
          p.sprintBoost = Math.min(p.sprintBoost + 60, 220);
          sound.playDash();

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
        const keys = keysDownRef.current;
        let baseRun = 180;
        if (keys['KeyD'] || keys['ArrowRight']) baseRun = 210;
        if (keys['KeyA'] || keys['ArrowLeft']) baseRun = 90;

        p.sprintBoost = Math.max(0, p.sprintBoost - dt * 90);
        const currentSpeed = baseRun + p.sprintBoost;

        p.vx = currentSpeed;
        p.x += p.vx * dt;

        const gravity = 1100;
        p.vy += gravity * dt;
        p.y += p.vy * dt;

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

        obstacles.current.platforms.forEach((plat) => {
          const withinX = p.x + p.width > plat.x && p.x < plat.x + plat.width;
          const falling = p.vy >= 0;
          if (withinX && falling && p.y + p.height >= plat.y && p.y + p.height <= plat.y + 15) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
          }
        });

        if (p.y > 480) {
          respawnAtCheckpoint('Fell into broken 3rd floor chasm!');
        }

        obstacles.current.rollingBeakers.forEach((rb) => {
          rb.x += rb.vx * dt;
          const dist = Math.hypot(p.x + p.width / 2 - rb.x, p.y + p.height / 2 - rb.y);
          if (dist < 18) {
            respawnAtCheckpoint('Tripped on rolling chemistry beaker!');
          }
        });

        obstacles.current.fallingBooks.forEach((fb) => {
          if (Math.abs(p.x - fb.x) < 140 && !fb.isFalling && fb.y === fb.initialY) {
            fb.isFalling = true;
          }
          if (fb.isFalling) {
            fb.y += 350 * dt;
            if (Math.abs(p.x + p.width / 2 - fb.x) < 20 && Math.abs(p.y + p.height / 2 - fb.y) < 22) {
              respawnAtCheckpoint('Struck by falling library reference books!');
            }
          }
        });

        if (p.x >= 2500 && activeCheckpointIndexRef.current < 2) {
          activeCheckpointIndexRef.current = 2;
          sound.playCheckpoint();
          setCheckpointStatus('CHECKPOINT 2 SAVED (MATH LOUNGE REACHED)');
        } else if (p.x >= 1300 && activeCheckpointIndexRef.current < 1) {
          activeCheckpointIndexRef.current = 1;
          sound.playCheckpoint();
          setCheckpointStatus('CHECKPOINT 1 SAVED (LIBRARY CORRIDOR)');
        }

        athena.wobble += dt * 4;
        const distToPlayer = p.x - athena.x;

        const athenaSpeed = athena.baseSpeed + (distToPlayer > 380 ? 40 : distToPlayer < 180 ? -15 : 10);
        athena.x += athenaSpeed * dt;
        athena.y = 320 + Math.sin(athena.wobble) * 20;

        const currentDist = Math.max(0, Math.round(p.x - athena.x));
        setAthenaDistance(currentDist);

        if (athena.x >= p.x - 18) {
          respawnAtCheckpoint('Caught by Athena’s Academic Ghost!');
        }

        const progressPct = Math.min(100, Math.max(0, Math.round((p.x / totalTrackLength) * 100)));
        setEscapeProgress(progressPct);

        if (p.x >= totalTrackLength) {
          sound.playVictory();
          onComplete();
          return;
        }
      }

      // --- RENDER PARK SCIENCE 3RD FLOOR MEZZANINE ATMOSPHERE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cameraX = Math.max(0, p.x - 280);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // 1. High Ceiling Wall: Modern Academic Science Atrium (White/Slate with Halloween night lighting)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cameraX, 0, canvas.width, canvas.height);

      // Clerestory Skylights Running Overhead (from photo)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cameraX, 0, canvas.width, 30);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cameraX, 30, canvas.width, 4);

      for (let sx = Math.floor(cameraX / 180) * 180; sx < cameraX + canvas.width + 180; sx += 180) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(sx + 30, 0);
        ctx.lineTo(sx + 90, 0);
        ctx.lineTo(sx + 65, 30);
        ctx.lineTo(sx + 5, 30);
        ctx.closePath();
        ctx.fill();
      }

      // White Support Columns & Balcony Railings
      for (let cx = Math.floor(cameraX / 260) * 260; cx < cameraX + canvas.width + 260; cx += 260) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, 30, 18, 360);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cx + 4, 30, 8, 360);

        // Cobweb draped on column
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 10, 35);
        ctx.lineTo(cx + 15, 60);
        ctx.stroke();
      }

      // Large Glass Windows with Dark Green Mullions (from photo)
      for (let wx = Math.floor(cameraX / 240) * 240; wx < cameraX + canvas.width + 240; wx += 240) {
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(wx + 20, 50, 100, 130);
        ctx.strokeStyle = '#14532d'; // Dark green frame
        ctx.lineWidth = 3;
        ctx.strokeRect(wx + 20, 50, 100, 130);

        // Window panes
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + 70, 50);
        ctx.lineTo(wx + 70, 180);
        ctx.moveTo(wx + 20, 115);
        ctx.lineTo(wx + 120, 115);
        ctx.stroke();

        // Moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(wx + 40, 75, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Background Academic Doors (from photo)
      for (let dx = Math.floor(cameraX / 340) * 340; dx < cameraX + canvas.width + 340; dx += 340) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(dx + 130, 70, 50, 110);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(dx + 130, 70, 50, 110);
        ctx.fillStyle = 'rgba(132, 204, 22, 0.2)';
        ctx.fillRect(dx + 136, 78, 38, 42);
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillStyle = '#84cc16';
        ctx.fillText('CS 304', dx + 138, 135);
      }

      // Green Pod Chairs along the 3rd floor hallway (from photo)
      for (let gx = Math.floor(cameraX / 280) * 280; gx < cameraX + canvas.width + 280; gx += 280) {
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(gx + 180, 200, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#365314';
        ctx.stroke();
      }

      // Polished Floor (Light Gray/Concrete)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cameraX, 390, canvas.width, 90);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cameraX, 390, canvas.width, 6);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(cameraX, 390, canvas.width, 90);

      // Gaps
      obstacles.current.gaps.forEach((gap) => {
        ctx.clearRect(gap.x, 390, gap.width, 90);
        ctx.fillStyle = '#05070e';
        ctx.fillRect(gap.x, 390, gap.width, 90);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(gap.x - 4, 390, 4, 15);
        ctx.fillRect(gap.x + gap.width, 390, 4, 15);
      });

      // Platforms (White/Slate Science Benches with Green Trims)
      obstacles.current.platforms.forEach((plat) => {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      });

      // Ladders
      obstacles.current.ladders.forEach((lad) => {
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lad.x, lad.y);
        ctx.lineTo(lad.x, lad.y + lad.height);
        ctx.moveTo(lad.x + lad.width, lad.y);
        ctx.lineTo(lad.x + lad.width, lad.y + lad.height);
        ctx.stroke();

        for (let ry = lad.y + 12; ry < lad.y + lad.height; ry += 16) {
          ctx.beginPath();
          ctx.moveTo(lad.x, ry);
          ctx.lineTo(lad.x + lad.width, ry);
          ctx.stroke();
        }
      });

      // Rolling Beakers
      obstacles.current.rollingBeakers.forEach((rb) => {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(rb.x, rb.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      // Falling Books
      obstacles.current.fallingBooks.forEach((fb) => {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(fb.x - 10, fb.y, 20, 26);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(fb.x - 10, fb.y, 20, 26);
      });

      // ATHENA GHOST
      ctx.save();
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 25;

      ctx.fillStyle = 'rgba(132, 204, 22, 0.35)';
      ctx.beginPath();
      ctx.arc(athena.x - 15, athena.y, 28, 0, Math.PI * 2);
      ctx.fill();

      // Ghost Academic Robes
      ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
      ctx.beginPath();
      ctx.arc(athena.x, athena.y, 20, Math.PI, 0, false);
      ctx.lineTo(athena.x + 20, athena.y + 36);
      ctx.lineTo(athena.x + 10, athena.y + 28);
      ctx.lineTo(athena.x, athena.y + 38);
      ctx.lineTo(athena.x - 10, athena.y + 28);
      ctx.lineTo(athena.x - 20, athena.y + 36);
      ctx.closePath();
      ctx.fill();

      // Academic Cap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(athena.x - 18, athena.y - 28, 36, 6);
      ctx.fillRect(athena.x - 8, athena.y - 22, 16, 6);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(athena.x + 14, athena.y - 26, 3, 12);

      // Eyes
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(athena.x + 6, athena.y - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(athena.x + 14, athena.y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#84cc16';
      ctx.textAlign = 'center';
      ctx.fillText('ATHENA GHOST', athena.x, athena.y - 36);
      ctx.restore();

      // Ben (Player)
      if (!p.isDead) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width / 2, p.y + p.height, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (p.sprintBoost > 40) {
          ctx.strokeStyle = 'rgba(132, 204, 22, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x - 20, p.y + 10);
          ctx.lineTo(p.x, p.y + 10);
          ctx.moveTo(p.x - 30, p.y + 20);
          ctx.lineTo(p.x - 5, p.y + 20);
          ctx.stroke();
        }

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.x, p.y + 10, p.width, 16);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('H', p.x + p.width / 2, p.y + 22);

        const runCycle = Math.sin(time * 0.02) * 8;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x + 2 + runCycle, p.y + 26, 6, 8);
        ctx.fillRect(p.x + p.width - 8 - runCycle, p.y + 26, 6, 8);

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

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalTrackLength, onComplete, respawnAtCheckpoint]);

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-lg border-4 border-[#84cc16] shadow-[0_0_40px_rgba(132,204,22,0.4)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="block w-full h-auto aspect-[15/8] select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* HUD Overlay: Escape Progress & Athena Distance Bar */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
          
          <div className="bg-slate-900/90 border-2 border-[#84cc16] rounded-lg p-2 flex items-center gap-3 min-w-[260px] shadow-[0_0_15px_rgba(132,204,22,0.4)]">
            <span className="font-retro text-[9px] text-[#84cc16]">
              ESCAPE PROGRESS:
            </span>
            <div className="flex-1 bg-black/60 border border-[#84cc16] h-4 rounded overflow-hidden p-0.5">
              <div
                className="bg-[#84cc16] h-full rounded transition-all duration-100"
                style={{ width: `${escapeProgress}%` }}
              ></div>
            </div>
            <span className="font-retro text-[10px] text-white font-bold w-10 text-right">
              {escapeProgress}%
            </span>
          </div>

          <div
            className={`border-2 rounded-lg p-2 font-retro text-[9px] flex items-center gap-2 transition-all ${
              athenaDistance < 140
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : athenaDistance < 240
                ? 'bg-yellow-950/90 border-yellow-500 text-yellow-300'
                : 'bg-emerald-950/90 border-[#84cc16] text-emerald-300'
            }`}
          >
            <span>👻 ATHENA:</span>
            <span className="font-bold text-xs">{athenaDistance}px BEHIND</span>
          </div>
        </div>

        {/* Button Mashing Instruction Prompt */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#84cc16] text-slate-950 font-retro text-[10px] md:text-xs px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(132,204,22,0.8)] animate-pulse z-20">
          ⚡ MASH [SPACEBAR] OR [E] REPEATEDLY TO SPRINT & ESCAPE!
        </div>

        {lossBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white font-retro text-[10px] md:text-xs px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce text-center z-30">
            💀 {lossBanner}
            <div className="text-[9px] text-[#fef08a] mt-0.5">Respawning at checkpoint...</div>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between px-2 font-retro text-[9px] text-slate-400 gap-2">
        <span>MOVE: <strong className="text-white">A, D / ARROWS</strong></span>
        <span>JUMP & SPRINT: <strong className="text-[#84cc16]">SPACEBAR (MASH TO BOOST)</strong></span>
        <span className="text-amber-400 font-bold">{checkpointStatus}</span>
      </div>
    </div>
  );
};

export default Section3AthenaChase;
