/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { CostumeNPC } from '../types';
import { sound } from '../services/sound';

interface Section1FloorProps {
  onComplete: () => void;
}

export const Section1Floor: React.FC<Section1FloorProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{ speaker: string; text: string } | null>(null);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);

  // Player position in 1st floor exploration area
  const playerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 'left' | 'right' | 'up' | 'down';
    walkFrame: number;
  }>({
    x: 80,
    y: 330,
    vx: 0,
    vy: 0,
    facing: 'right',
    walkFrame: 0,
  });

  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  // 3 Bryn Mawr Students in Halloween Costumes in the Park Science Atrium
  const npcs: CostumeNPC[] = [
    {
      id: 'npc-athena',
      name: 'Maya (Athena Owl)',
      costume: 'Spooky Academic Owl',
      x: 270,
      y: 320,
      dialogue: [
        '“Hoot! Looking for your buddy with the Haverford lanyard? He went through the atrium towards the 2nd Floor Chemistry Lab muttering about Binary Search Trees!”',
        '“Beware the upper mezzanine though... legend says Athena’s ghost stalks the 3rd floor library on Halloween!”',
      ],
      color: '#38bdf8',
      accessory: '🦉',
    },
    {
      id: 'npc-chemist',
      name: 'Zoe (Mad Alchemist)',
      costume: 'Bryn Mawr Chemist',
      x: 520,
      y: 330,
      dialogue: [
        '“Muahaha! Welcome to Park Science! Did Mateo say he was getting coffee? The coffee machine in the 2nd floor lab blew up into an acid vat!”',
        '“You’ll need to leap across the moving platforms to reach the 3rd floor!”',
      ],
      color: '#84cc16',
      accessory: '🧪',
    },
    {
      id: 'npc-vampire',
      name: 'Alex (Count Data-cula)',
      costume: 'Vampire Programmer',
      x: 710,
      y: 310,
      dialogue: [
        '“I vant to count your memory leaks! One dangling pointer! Two dangling pointers! Ha-ha-ha!”',
        '“Hurry to the chemistry lab doors on the right before the midnight bell chimes!”',
      ],
      color: '#f43f5e',
      accessory: '🧛',
    },
  ];

  // Stairs / Door entrance to 2nd Floor Chemistry Lab
  const labEntrance = { x: 840, y: 260, width: 60, height: 120 };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;

      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        const p = playerRef.current;
        const nearbyNpc = npcs.find((npc) => Math.hypot(p.x - npc.x, p.y - npc.y) < 65);
        if (nearbyNpc) {
          sound.playInteract();
          const randomDialogue = nearbyNpc.dialogue[Math.floor(Math.random() * nearbyNpc.dialogue.length)];
          setActiveDialogue({ speaker: nearbyNpc.name, text: randomDialogue });
          return;
        }

        if (p.x > 800) {
          sound.playLevelClear();
          onComplete();
          return;
        }

        if (activeDialogue) {
          setActiveDialogue(null);
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
  }, [activeDialogue, onComplete]);

  // Main Canvas Render Loop
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
      const speed = 190;
      let dx = 0;
      let dy = 0;

      const keys = keysDownRef.current;
      if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        p.x += (dx / len) * speed * dt;
        p.y += (dy / len) * speed * dt;
        p.walkFrame += dt * 10;
        if (Math.abs(dx) > Math.abs(dy)) {
          p.facing = dx > 0 ? 'right' : 'left';
        } else {
          p.facing = dy > 0 ? 'down' : 'up';
        }
      }

      // Bounds clamping for floor area
      p.x = Math.max(30, Math.min(860, p.x));
      p.y = Math.max(240, Math.min(430, p.y));

      // Check proximity to NPCs
      const closeNpc = npcs.find((npc) => Math.hypot(p.x - npc.x, p.y - npc.y) < 65);
      if (closeNpc) {
        setInteractPrompt(`PRESS [E] OR [ENTER] TO TALK TO ${closeNpc.name.toUpperCase()}`);
      } else if (p.x > 790) {
        setInteractPrompt('PRESS [E] OR WALK RIGHT TO ENTER 2ND FLOOR CHEMISTRY LAB');
      } else {
        setInteractPrompt(null);
      }

      if (p.x >= 845) {
        sound.playLevelClear();
        onComplete();
        return;
      }

      // --- RENDER 16-BIT RETRO RPG SCENE (PARK SCIENCE PHOTO INSPIRED) ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. High White Ceiling & Upper Mezzanine Balcony
      // Wall background: light modern academic white/gray, subtly dimmed for Halloween night
      ctx.fillStyle = '#1e293b'; // Night dimmed wall
      ctx.fillRect(0, 0, canvas.width, 210);

      // Upper Mezzanine Balcony (from photo)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, 70);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 64, canvas.width, 6);

      // Upper Mezzanine Cable Railings
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let ry = 35; ry <= 60; ry += 8) {
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(canvas.width, ry);
        ctx.stroke();
      }

      // Skylights in Ceiling (from photo)
      for (let sx = 80; sx < canvas.width; sx += 220) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 60, 0);
        ctx.lineTo(sx + 35, 25);
        ctx.lineTo(sx - 25, 25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
      }

      // Avocado Green Pod Chairs on the Mezzanine Deck (from photo)
      const podColors = ['#65a30d', '#4d7c0f', '#84cc16'];
      for (let px = 60; px < canvas.width - 80; px += 130) {
        ctx.fillStyle = podColors[(px / 130) % podColors.length];
        ctx.beginPath();
        ctx.arc(px, 45, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#365314';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Halloween Cobwebs draped across the Mezzanine
      const drawWeb = (wx: number, wy: number) => {
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 25, wy + 25);
        ctx.moveTo(wx, wy + 12);
        ctx.lineTo(wx + 20, wy + 25);
        ctx.moveTo(wx + 12, wy);
        ctx.lineTo(wx + 25, wy + 16);
        ctx.stroke();
      };
      drawWeb(40, 50);
      drawWeb(280, 50);
      drawWeb(520, 50);
      drawWeb(740, 50);

      // 2. White Architectural Support Columns (from photo)
      const columnPositions = [140, 360, 580, 800];
      columnPositions.forEach((cx) => {
        // Shadow behind pillar
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - 4, 70, 28, 140);

        // White pillar
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, 70, 20, 140);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(cx + 4, 70, 12, 140);

        // Cobweb on column capital
        drawWeb(cx - 5, 70);
      });

      // 3. Large Windows Looking into Moonlit Campus (from photo)
      const windowBoxes = [
        { x: 30, y: 85, w: 90, h: 100 },
        { x: 180, y: 85, w: 80, h: 100 },
        { x: 400, y: 85, w: 80, h: 100 },
        { x: 620, y: 85, w: 80, h: 100 },
      ];

      windowBoxes.forEach((wb) => {
        // Window Night Sky
        ctx.fillStyle = '#090e1a';
        ctx.fillRect(wb.x, wb.y, wb.w, wb.h);

        // Dark Green Window Frame (from photo)
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.strokeRect(wb.x, wb.y, wb.w, wb.h);

        // Window mullions / panes
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(wb.x + wb.w / 2, wb.y);
        ctx.lineTo(wb.x + wb.w / 2, wb.y + wb.h);
        ctx.moveTo(wb.x, wb.y + wb.h / 2);
        ctx.lineTo(wb.x + wb.w, wb.y + wb.h / 2);
        ctx.stroke();

        // Moon & Spooky silhouettes outside
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(wb.x + 20, wb.y + 25, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Background Academic Doors (Glass doors with dark frames from photo)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(280, 85, 65, 115);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(280, 85, 65, 115);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(286, 92, 53, 50);
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('STUDY 104', 312, 160);

      // 5. Entrance to 2nd Floor Chemistry Lab (Right Wall)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(labEntrance.x - 20, 95, 80, 145);
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 3;
      ctx.strokeRect(labEntrance.x - 20, 95, 80, 145);

      // Glass door pane
      ctx.fillStyle = 'rgba(132, 204, 22, 0.2)';
      ctx.fillRect(labEntrance.x - 14, 105, 68, 65);

      // Door Room Plaque
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(labEntrance.x - 30, 75, 100, 22);
      ctx.fillStyle = '#022c22';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHEM LAB 201 ▶', labEntrance.x + 20, 89);

      // 6. Polished Atrium Floor (Light Gray/Concrete with Floor Tile Lines from photo)
      ctx.fillStyle = '#94a3b8'; // Floor base
      ctx.fillRect(0, 210, canvas.width, canvas.height - 210);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 210, canvas.width, 10); // Floor reflection strip

      // Floor perspective tiles
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 1;
      for (let y = 230; y < canvas.height; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 7. Distinctive Park Science Furniture: Green Couches & Yellow Study Chairs (from photo)
      // Avocado Green Lounge Sofas
      const drawGreenSofa = (sx: number, sy: number) => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + 35, sy + 32, 38, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#65a30d'; // Avocado green
        ctx.fillRect(sx, sy, 70, 28);
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(sx + 4, sy + 4, 62, 14);

        // Wooden legs
        ctx.fillStyle = '#d97706';
        ctx.fillRect(sx + 6, sy + 28, 4, 8);
        ctx.fillRect(sx + 60, sy + 28, 4, 8);
      };

      drawGreenSofa(60, 250);
      drawGreenSofa(470, 250);

      // Round Study Tables with Bright Yellow Chairs (from photo)
      const drawStudyTable = (tx: number, ty: number) => {
        // Table shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(tx, ty + 15, 25, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blonde wood round table top
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(tx, ty, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        // Bright Yellow Chairs
        ctx.fillStyle = '#eab308';
        ctx.fillRect(tx - 32, ty - 8, 10, 14);
        ctx.fillRect(tx + 22, ty - 8, 10, 14);
      };

      drawStudyTable(380, 260);

      // Halloween Jack-o'-Lantern on the floor by pillar
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(150, 240, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(148, 228, 4, 4); // Stem
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(147, 238, 2, 2); // Eye
      ctx.fillRect(151, 238, 2, 2); // Eye

      // 8. Render NPCs (Costumed Students)
      npcs.forEach((npc) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(npc.x, npc.y + 16, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Costume Body
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.x, npc.y + 4, 12, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(npc.x, npc.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Accessory / Hat icon
        ctx.font = '14px sans-serif';
        ctx.fillText(npc.accessory, npc.x, npc.y - 20);

        // Name tag
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = npc.color;
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, npc.x, npc.y + 32);

        // Speech bubble indicator if close
        if (Math.hypot(p.x - npc.x, p.y - npc.y) < 65) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(npc.x + 14, npc.y - 24, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillText('?', npc.x + 14, npc.y - 21);
        }
      });

      // 9. Render Ben (Player in bright RED Haverford hoodie)
      ctx.save();
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking feet
      const step = Math.sin(p.walkFrame) * 4;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x - 7, p.y + 14 + (step > 0 ? step : 0), 5, 6);
      ctx.fillRect(p.x + 2, p.y + 14 + (step < 0 ? -step : 0), 5, 6);

      // Bright RED Haverford Hoodie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 4, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White "H" on hoodie chest
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('H', p.x, p.y + 7);

      // Head & Scarlet Haverford Beanie
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#991b1b';
      ctx.fillRect(p.x - 8, p.y - 17, 16, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 2, p.y - 20, 4, 4);

      // Facing indicator eyes
      const eyeOffset = p.facing === 'left' ? -3 : p.facing === 'right' ? 3 : 0;
      ctx.fillStyle = '#000000';
      ctx.fillRect(p.x - 3 + eyeOffset, p.y - 9, 2, 2);
      ctx.fillRect(p.x + 2 + eyeOffset, p.y - 9, 2, 2);

      // Ben Tag
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText('BEN', p.x, p.y - 26);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [npcs, onComplete]);

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      {/* Canvas Screen */}
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-lg border-4 border-[#84cc16] shadow-[0_0_35px_rgba(132,204,22,0.3)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="block w-full h-auto aspect-[15/8] select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Interact Prompt Floating Bar */}
        {interactPrompt && !activeDialogue && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#84cc16] text-slate-950 font-retro text-[10px] md:text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.8)] animate-pulse">
            {interactPrompt}
          </div>
        )}

        {/* 16-Bit RPG Dialogue Modal */}
        {activeDialogue && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#0f172a]/95 border-4 border-[#84cc16] rounded-lg p-4 shadow-[0_0_25px_rgba(132,204,22,0.4)] z-30 animate-in fade-in duration-150">
            <div className="font-retro text-xs text-[#84cc16] mb-1.5 flex items-center justify-between">
              <span>{activeDialogue.speaker.toUpperCase()}</span>
              <span className="text-slate-400 text-[9px]">[SPACE / ENTER TO CLOSE]</span>
            </div>
            <p className="font-vt323 text-xl md:text-2xl text-white leading-snug">
              {activeDialogue.text}
            </p>
          </div>
        )}
      </div>

      {/* Exploration Controls Hint */}
      <div className="w-full max-w-4xl flex items-center justify-between px-2 font-retro text-[9px] text-slate-400">
        <span>MOVE: <strong className="text-white">WASD / ARROWS</strong></span>
        <span>INTERACT: <strong className="text-[#84cc16]">E / ENTER / SPACE</strong></span>
        <span>GOAL: <strong className="text-amber-400">FIND ENTRANCE TO 2ND FLOOR LAB</strong></span>
      </div>
    </div>
  );
};

export default Section1Floor;
