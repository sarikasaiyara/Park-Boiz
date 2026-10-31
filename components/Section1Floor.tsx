/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  // Dimensions: 900px wide x 480px high
  const playerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 'left' | 'right' | 'up' | 'down';
    walkFrame: number;
  }>({
    x: 80,
    y: 300,
    vx: 0,
    vy: 0,
    facing: 'right',
    walkFrame: 0,
  });

  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  // 3 Bryn Mawr Students in Halloween Costumes
  const npcs: CostumeNPC[] = [
    {
      id: 'npc-athena',
      name: 'Maya (Athena Owl)',
      costume: 'Spooky Academic Owl',
      x: 270,
      y: 280,
      dialogue: [
        '“Hoot! Looking for your buddy with the Haverford lanyard? He went scurrying towards the 2nd Floor Chemistry Lab muttering about Binary Search Trees!”',
        '“Beware the upper floors though... legend says the ghost of Athena stalks the 3rd floor library on Halloween!”',
      ],
      color: '#38bdf8',
      accessory: '🦉',
    },
    {
      id: 'npc-chemist',
      name: 'Zoe (Mad Alchemist)',
      costume: 'Bryn Mawr Chemist',
      x: 520,
      y: 290,
      dialogue: [
        '“Muahaha! Welcome to Park Science! Did Mateo say he was getting coffee? The coffee machine in the 2nd floor lab blew up into an acid vat!”',
        '“You’ll need to leap across the moving platforms to reach the 3rd floor!”',
      ],
      color: '#39ff14',
      accessory: '🧪',
    },
    {
      id: 'npc-vampire',
      name: 'Alex (Count Data-cula)',
      costume: 'Vampire Programmer',
      x: 710,
      y: 280,
      dialogue: [
        '“I vant to count your memory leaks! One dangling pointer! Two dangling pointers! Ha-ha-ha!”',
        '“Hurry up the stairs on the right before the midnight bell chimes!”',
      ],
      color: '#f43f5e',
      accessory: '🧛',
    },
  ];

  // Stairs entrance to 2nd Floor Chemistry Lab
  const labEntrance = { x: 840, y: 260, width: 60, height: 100 };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;

      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        // Check for NPC interaction
        const p = playerRef.current;
        const nearbyNpc = npcs.find((npc) => Math.hypot(p.x - npc.x, p.y - npc.y) < 65);
        if (nearbyNpc) {
          sound.playInteract();
          const randomDialogue = nearbyNpc.dialogue[Math.floor(Math.random() * nearbyNpc.dialogue.length)];
          setActiveDialogue({ speaker: nearbyNpc.name, text: randomDialogue });
          return;
        }

        // Check if inside lab entrance
        if (p.x > 800) {
          sound.playLevelClear();
          onComplete();
          return;
        }

        // Close dialogue if open
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
      p.y = Math.max(210, Math.min(420, p.y));

      // Check proximity to NPCs
      const closeNpc = npcs.find((npc) => Math.hypot(p.x - npc.x, p.y - npc.y) < 65);
      if (closeNpc) {
        setInteractPrompt(`PRESS [E] OR [ENTER] TO TALK TO ${closeNpc.name.toUpperCase()}`);
      } else if (p.x > 790) {
        setInteractPrompt('PRESS [E] OR WALK RIGHT TO ENTER 2ND FLOOR CHEMISTRY LAB');
      } else {
        setInteractPrompt(null);
      }

      // Auto-trigger entrance if walked far right
      if (p.x >= 845) {
        sound.playLevelClear();
        onComplete();
        return;
      }

      // --- RENDER 16-BIT RETRO RPG SCENE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floor Wallpaper & Tiles (Dark Orange/Purple Halloween Science Vibe)
      ctx.fillStyle = '#100720';
      ctx.fillRect(0, 0, canvas.width, 190); // Back wall

      ctx.fillStyle = '#1c0d38';
      ctx.fillRect(0, 190, canvas.width, canvas.height - 190); // Walkable Floor

      // Floor plank lines
      ctx.strokeStyle = '#2b1352';
      ctx.lineWidth = 1;
      for (let y = 220; y < canvas.height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Wall Baseboard
      ctx.fillStyle = '#2f1457';
      ctx.fillRect(0, 185, canvas.width, 8);

      // Bookshelves on the back wall
      const renderBookshelf = (bx: number) => {
        ctx.fillStyle = '#3a1f14';
        ctx.fillRect(bx, 50, 90, 135);
        ctx.strokeStyle = '#633522';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, 50, 90, 135);

        // Shelves with books
        const colors = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#ea580c'];
        for (let row = 0; row < 4; row++) {
          const sy = 60 + row * 30;
          ctx.fillStyle = '#22120b';
          ctx.fillRect(bx + 4, sy + 22, 82, 3);
          for (let book = 0; book < 7; book++) {
            ctx.fillStyle = colors[(bx + row + book) % colors.length];
            ctx.fillRect(bx + 8 + book * 11, sy, 8, 22);
          }
        }
      };

      renderBookshelf(40);
      renderBookshelf(350);
      renderBookshelf(590);

      // Science Posters on Wall
      const renderPoster = (px: number, py: number, title: string, color: string) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, 64, 80);
        ctx.fillStyle = color;
        ctx.fillRect(px + 4, py + 4, 56, 45);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(title, px + 32, py + 66);
      };

      renderPoster(160, 70, 'PARK CHEM', '#0284c7');
      renderPoster(465, 70, 'HALLOWEEN', '#ea580c');

      // Science Display Case / Periodic Table
      ctx.fillStyle = '#1e1135';
      ctx.fillRect(240, 70, 85, 75);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(240, 70, 85, 75);
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = '#00e5ff';
      ctx.fillText('ELEMENTS', 282, 105);

      // Entrance to 2nd Floor Chemistry Lab (Right Wall)
      ctx.fillStyle = '#05020a';
      ctx.fillRect(labEntrance.x - 20, 120, 80, 160);
      ctx.strokeStyle = '#ff7700';
      ctx.lineWidth = 4;
      ctx.strokeRect(labEntrance.x - 20, 120, 80, 160);

      // Stairs up graphic
      ctx.fillStyle = '#ff7700';
      for (let s = 0; s < 5; s++) {
        ctx.fillRect(labEntrance.x - 15 + s * 8, 260 - s * 22, 30, 8);
      }

      // Exit sign above door
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(labEntrance.x - 30, 85, 100, 24);
      ctx.fillStyle = '#000000';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('2ND FL LAB ▶', labEntrance.x + 20, 101);

      // Render NPCs (Costumed Bryn Mawr Students)
      npcs.forEach((npc) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
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

      // Render Ben (Player in bright RED Haverford hoodie)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking feet
      const step = Math.sin(p.walkFrame) * 4;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x - 7, p.y + 14 + (step > 0 ? step : 0), 5, 6);
      ctx.fillRect(p.x + 2, p.y + 14 + (step < 0 ? -step : 0), 5, 6);

      // Bright RED Haverford Hoodie
      ctx.fillStyle = '#dc2626'; // Vibrant Red
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
      ctx.fillRect(p.x - 2, p.y - 20, 4, 4); // Pom-pom

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

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [npcs, onComplete]);

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      {/* Canvas Screen */}
      <div className="relative w-full max-w-4xl bg-black rounded-lg border-4 border-[#581c87] shadow-[0_0_35px_rgba(88,28,135,0.4)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="block w-full h-auto aspect-[15/8] select-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Interact Prompt Floating Bar */}
        {interactPrompt && !activeDialogue && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#ff7700] text-black font-retro text-[10px] md:text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,119,0,0.8)] animate-pulse">
            {interactPrompt}
          </div>
        )}

        {/* 16-Bit RPG Dialogue Modal */}
        {activeDialogue && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#0e041d]/95 border-4 border-[#38bdf8] rounded-lg p-4 shadow-[0_0_25px_rgba(56,189,248,0.5)] z-30 animate-in fade-in duration-150">
            <div className="font-retro text-xs text-[#38bdf8] mb-1.5 flex items-center justify-between">
              <span>{activeDialogue.speaker.toUpperCase()}</span>
              <span className="text-gray-400 text-[9px]">[SPACE / ENTER TO CLOSE]</span>
            </div>
            <p className="font-vt323 text-xl md:text-2xl text-white leading-snug">
              {activeDialogue.text}
            </p>
          </div>
        )}
      </div>

      {/* Exploration Controls Hint */}
      <div className="w-full max-w-4xl flex items-center justify-between px-2 font-retro text-[9px] text-gray-400">
        <span>MOVE: <strong className="text-white">WASD / ARROWS</strong></span>
        <span>INTERACT: <strong className="text-[#38bdf8]">E / ENTER / SPACE</strong></span>
        <span>GOAL: <strong className="text-[#ff7700]">FIND ENTRANCE TO 2ND FLOOR LAB</strong></span>
      </div>
    </div>
  );
};

export default Section1Floor;
