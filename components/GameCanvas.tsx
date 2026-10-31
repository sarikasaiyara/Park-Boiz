/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { LevelConfig, StudyItem, Position } from '../types';
import { sound } from '../services/sound';

interface GameCanvasProps {
  level: LevelConfig;
  collectedItems: StudyItem[];
  onItemCollected: (item: StudyItem) => void;
  onLevelComplete: () => void;
  onPlayerDeath: (cause: string) => void;
  attempts: number;
  externalDirection?: { x: number; y: number } | null;
}

interface RuntimeGhost {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  axis: 'X' | 'Y';
  minCoord: number;
  maxCoord: number;
  color: string;
  wobble: number;
}

interface RuntimeShadow {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  angle: number;
  rangeX: number;
  rangeY: number;
  speed: number;
  pulsePhase: number;
}

interface RuntimeLaser {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  cycleTime: number;
  timer: number;
  state: 'OFF' | 'WARNING' | 'ACTIVE';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  collectedItems,
  onItemCollected,
  onLevelComplete,
  onPlayerDeath,
  attempts,
  externalDirection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player state in pixels
  const playerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    facingAngle: number;
    walkFrame: number;
    isDead: boolean;
  }>({
    x: level.playerStart.x * level.tileSize + level.tileSize / 2,
    y: level.playerStart.y * level.tileSize + level.tileSize / 2,
    vx: 0,
    vy: 0,
    radius: 14,
    facingAngle: 0,
    walkFrame: 0,
    isDead: false,
  });

  // Obstacle references
  const ghostsRef = useRef<RuntimeGhost[]>([]);
  const shadowsRef = useRef<RuntimeShadow[]>([]);
  const lasersRef = useRef<RuntimeLaser[]>([]);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const deathCooldownRef = useRef<boolean>(false);
  const flashAlphaRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize runtime obstacles when level changes or restarts
  const initLevelEntities = useCallback(() => {
    const ts = level.tileSize;

    // Reset player position
    playerRef.current = {
      x: level.playerStart.x * ts + ts / 2,
      y: level.playerStart.y * ts + ts / 2,
      vx: 0,
      vy: 0,
      radius: 13,
      facingAngle: 0,
      walkFrame: 0,
      isDead: false,
    };
    deathCooldownRef.current = false;
    flashAlphaRef.current = 0;

    // Setup Ghosts
    ghostsRef.current = level.ghosts.map((g, idx) => {
      const startPixelX = g.gridX * ts + ts / 2;
      const startPixelY = g.gridY * ts + ts / 2;
      const isX = g.axis === 'X';
      const travelPixels = g.distanceTiles * ts;

      return {
        x: startPixelX,
        y: startPixelY,
        vx: isX ? g.speed : 0,
        vy: isX ? 0 : g.speed,
        radius: 14,
        axis: g.axis,
        minCoord: (isX ? startPixelX : startPixelY) - (travelPixels / 2),
        maxCoord: (isX ? startPixelX : startPixelY) + (travelPixels / 2),
        color: g.color || (idx % 2 === 0 ? '#c084fc' : '#e879f9'),
        wobble: idx * 1.5,
      };
    });

    // Setup Shadows
    shadowsRef.current = level.shadows.map((s, idx) => ({
      x: s.gridX * ts + ts / 2,
      y: s.gridY * ts + ts / 2,
      baseX: s.gridX * ts + ts / 2,
      baseY: s.gridY * ts + ts / 2,
      radius: 20,
      angle: idx * 2.1,
      rangeX: s.rangeX * ts,
      rangeY: s.rangeY * ts,
      speed: s.speed * 0.02,
      pulsePhase: idx * 1.2,
    }));

    // Setup Lasers
    lasersRef.current = level.lasers.map((l) => ({
      startX: l.startGrid.x * ts + ts / 2,
      startY: l.startGrid.y * ts + ts / 2,
      endX: l.endGrid.x * ts + ts / 2,
      endY: l.endGrid.y * ts + ts / 2,
      cycleTime: l.cycleTime,
      timer: l.initialOffset % l.cycleTime,
      state: 'OFF',
    }));
  }, [level]);

  // Re-init on level change or attempts change (restart level)
  useEffect(() => {
    initLevelEntities();
  }, [initLevelEntities, attempts]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDownRef.current[e.code] = true;
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

  // Check circle vs wall collisions with sliding
  const checkWallCollision = (x: number, y: number, radius: number): boolean => {
    const ts = level.tileSize;
    const minCol = Math.floor((x - radius) / ts);
    const maxCol = Math.floor((x + radius) / ts);
    const minRow = Math.floor((y - radius) / ts);
    const maxRow = Math.floor((y + radius) / ts);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r < 0 || r >= level.gridRows || c < 0 || c >= level.gridCols) {
          return true; // Out of bounds is solid
        }
        if (level.walls[r][c] === 1) {
          // Circle vs AABB rectangle collision
          const rectLeft = c * ts;
          const rectRight = (c + 1) * ts;
          const rectTop = r * ts;
          const rectBottom = (r + 1) * ts;

          const closestX = Math.max(rectLeft, Math.min(x, rectRight));
          const closestY = Math.max(rectTop, Math.min(y, rectBottom));

          const distX = x - closestX;
          const distY = y - closestY;
          if (distX * distX + distY * distY < radius * radius) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Distance from point to line segment
  const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  };

  // Trigger player loss on obstacle hit
  const triggerHit = (cause: string) => {
    if (deathCooldownRef.current) return;
    deathCooldownRef.current = true;
    playerRef.current.isDead = true;
    sound.playHit();
    flashAlphaRef.current = 0.8;

    setTimeout(() => {
      onPlayerDeath(cause);
      initLevelEntities();
    }, 450);
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const gameLoop = (currentTime: number) => {
      if (!isMounted) return;

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05); // Cap delta time
      lastTimeRef.current = currentTime;

      const p = playerRef.current;
      const ts = level.tileSize;

      if (!p.isDead) {
        // Compute input movement
        let moveX = 0;
        let moveY = 0;

        const keys = keysDownRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

        // Merge with external touch/D-pad controls if active
        if (externalDirection) {
          moveX += externalDirection.x;
          moveY += externalDirection.y;
        }

        // Normalize movement
        const moveLen = Math.hypot(moveX, moveY);
        const speed = 185; // pixels per second

        if (moveLen > 0.01) {
          const normX = (moveX / moveLen) * speed * dt;
          const normY = (moveY / moveLen) * speed * dt;

          p.facingAngle = Math.atan2(moveY, moveX);
          p.walkFrame += dt * 10;

          // Attempt X movement
          const newX = p.x + normX;
          if (!checkWallCollision(newX, p.y, p.radius)) {
            p.x = newX;
          }

          // Attempt Y movement
          const newY = p.y + normY;
          if (!checkWallCollision(p.x, newY, p.radius)) {
            p.y = newY;
          }
        }

        // Check study item pickup
        level.items.forEach((item) => {
          const isCollected = collectedItems.some((ci) => ci.id === item.id);
          if (!isCollected) {
            const itemPixelX = item.x * ts + ts / 2;
            const itemPixelY = item.y * ts + ts / 2;
            const dist = Math.hypot(p.x - itemPixelX, p.y - itemPixelY);

            if (dist < p.radius + 18) {
              sound.playItemPickup();
              onItemCollected(item);
            }
          }
        });

        // Check Exit condition
        const allItemsCollected = level.items.every((it) =>
          collectedItems.some((ci) => ci.id === it.id)
        );

        const exitPixelX = level.exitCoord.x * ts + ts / 2;
        const exitPixelY = level.exitCoord.y * ts + ts / 2;
        const distToExit = Math.hypot(p.x - exitPixelX, p.y - exitPixelY);

        if (allItemsCollected && distToExit < p.radius + 20) {
          if (level.id === 1) {
            sound.playLevelClear();
          } else {
            sound.playVictory();
          }
          onLevelComplete();
          return;
        }

        // Update & Check Ghosts
        ghostsRef.current.forEach((ghost) => {
          ghost.wobble += dt * 5;
          if (ghost.axis === 'X') {
            ghost.x += ghost.vx * dt;
            if (ghost.x >= ghost.maxCoord) {
              ghost.x = ghost.maxCoord;
              ghost.vx = -Math.abs(ghost.vx);
            } else if (ghost.x <= ghost.minCoord) {
              ghost.x = ghost.minCoord;
              ghost.vx = Math.abs(ghost.vx);
            }
          } else {
            ghost.y += ghost.vy * dt;
            if (ghost.y >= ghost.maxCoord) {
              ghost.y = ghost.maxCoord;
              ghost.vy = -Math.abs(ghost.vy);
            } else if (ghost.y <= ghost.minCoord) {
              ghost.y = ghost.minCoord;
              ghost.vy = Math.abs(ghost.vy);
            }
          }

          // Ghost collision with Ben
          const distGhost = Math.hypot(p.x - ghost.x, p.y - ghost.y);
          if (distGhost < p.radius + ghost.radius - 2) {
            triggerHit('Caught by a Park Science Ghost!');
          }
        });

        // Update & Check Shadows
        shadowsRef.current.forEach((sh) => {
          sh.angle += sh.speed * dt;
          sh.x = sh.baseX + Math.cos(sh.angle) * sh.rangeX;
          sh.y = sh.baseY + Math.sin(sh.angle * 1.5) * sh.rangeY;
          sh.pulsePhase += dt * 4;

          const currentRadius = sh.radius + Math.sin(sh.pulsePhase) * 4;
          const distShadow = Math.hypot(p.x - sh.x, p.y - sh.y);
          if (distShadow < p.radius + currentRadius - 3) {
            triggerHit('Engulfed by a Creeping Shadow!');
          }
        });

        // Update & Check Lasers
        lasersRef.current.forEach((laser) => {
          laser.timer = (laser.timer + dt * 1000) % laser.cycleTime;
          const activeDuration = laser.cycleTime * 0.55;
          const warningDuration = 700;

          if (laser.timer < activeDuration) {
            laser.state = 'ACTIVE';
            // Check collision with Ben
            const distLaser = distToSegment(
              p.x,
              p.y,
              laser.startX,
              laser.startY,
              laser.endX,
              laser.endY
            );
            if (distLaser < p.radius + 4) {
              triggerHit('Zapped by Park Science Security Laser!');
            }
          } else if (laser.timer > laser.cycleTime - warningDuration) {
            laser.state = 'WARNING';
          } else {
            laser.state = 'OFF';
          }
        });
      }

      // --- RENDERING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floor Background
      ctx.fillStyle = level.id === 1 ? '#0c0617' : '#110926';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor Tile Grid & Sub-Floor Decor
      for (let r = 0; r < level.gridRows; r++) {
        for (let c = 0; c < level.gridCols; c++) {
          const rx = c * ts;
          const ry = r * ts;

          if (level.walls[r][c] === 1) {
            // High-tech Gothic Wall Tile
            ctx.fillStyle = level.id === 1 ? '#27173e' : '#331c54';
            ctx.fillRect(rx, ry, ts, ts);

            // Wall Bevel & Circuit Borders
            ctx.strokeStyle = level.id === 1 ? '#492a77' : '#5b3296';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx + 2, ry + 2, ts - 4, ts - 4);

            // Tech conduits / brick accents
            ctx.fillStyle = level.id === 1 ? '#180e28' : '#21123b';
            ctx.fillRect(rx + 6, ry + 6, ts - 12, ts - 12);

            // Spooky orange/cyan accent dot
            if ((r + c) % 5 === 0) {
              ctx.fillStyle = (r + c) % 2 === 0 ? '#ff7700' : '#00e5ff';
              ctx.fillRect(rx + 8, ry + 8, 3, 3);
            }
          } else {
            // Walkable Floor Tile
            ctx.strokeStyle = level.id === 1 ? 'rgba(78, 35, 126, 0.25)' : 'rgba(100, 45, 150, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(rx, ry, ts, ts);

            // Halloween spiderwebs / dust in corners
            if ((r === 1 && c === 1) || (r === 1 && c === 18) || (r === 11 && c === 1)) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
              ctx.beginPath();
              ctx.arc(rx + ts / 2, ry + ts / 2, ts / 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Exit / Stairs / Mateo Room rendering
      const exitPxX = level.exitCoord.x * ts + ts / 2;
      const exitPxY = level.exitCoord.y * ts + ts / 2;
      const allCollected = level.items.every((it) =>
        collectedItems.some((ci) => ci.id === it.id)
      );

      if (level.id === 1) {
        // Basement Stairs Exit
        const pulse = 0.5 + 0.5 * Math.sin(currentTime * 0.006);

        if (allCollected) {
          // Unlocked Neon Green Stairs Portal
          ctx.save();
          ctx.shadowColor = '#39ff14';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#39ff14';
          ctx.beginPath();
          ctx.arc(exitPxX, exitPxY, 18, 0, Math.PI * 2);
          ctx.fill();

          // Stairs steps icon
          ctx.fillStyle = '#051b03';
          ctx.fillRect(exitPxX - 10, exitPxY - 8, 20, 4);
          ctx.fillRect(exitPxX - 7, exitPxY - 2, 14, 4);
          ctx.fillRect(exitPxX - 4, exitPxY + 4, 8, 4);

          // "STAIRS" label
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillStyle = '#39ff14';
          ctx.textAlign = 'center';
          ctx.fillText('STAIRS UP!', exitPxX, exitPxY - 22);
          ctx.restore();
        } else {
          // Locked Stairs Gate
          ctx.fillStyle = '#4a154b';
          ctx.beginPath();
          ctx.arc(exitPxX, exitPxY, 16, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ff2a6d';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Padlock
          ctx.fillStyle = '#f9c80e';
          ctx.fillRect(exitPxX - 5, exitPxY - 3, 10, 8);
          ctx.strokeStyle = '#f9c80e';
          ctx.strokeRect(exitPxX - 3, exitPxY - 8, 6, 6);

          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#ff7700';
          ctx.textAlign = 'center';
          ctx.fillText('LOCKED', exitPxX, exitPxY - 18);
        }
      } else {
        // Level 2: Mateo Waiting in the Math/CS Study Lab
        const mateoPulse = 0.5 + 0.5 * Math.sin(currentTime * 0.005);

        // Security Barrier if not all collected
        if (!allCollected) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 42, 109, ${0.4 + mateoPulse * 0.5})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(exitPxX - 22, exitPxY - 22, 44, 44);
          ctx.restore();

          // Lockdown Label
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillStyle = '#ff2a6d';
          ctx.textAlign = 'center';
          ctx.fillText('LOCKDOWN', exitPxX, exitPxY - 26);
        } else {
          // Rescue Beacon
          ctx.save();
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(exitPxX, exitPxY, 22 + mateoPulse * 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#00e5ff';
          ctx.textAlign = 'center';
          ctx.fillText('SAVE MATEO!', exitPxX, exitPxY - 26);
        }

        // Draw Mateo Sprite at Desk
        ctx.save();
        // Desk
        ctx.fillStyle = '#37204e';
        ctx.fillRect(exitPxX - 16, exitPxY + 2, 32, 10);
        ctx.strokeStyle = '#623588';
        ctx.strokeRect(exitPxX - 16, exitPxY + 2, 32, 10);

        // Laptop with glowing screen
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(exitPxX - 8, exitPxY + 3, 16, 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(exitPxX - 7, exitPxY - 4, 14, 7);

        // Mateo body & head
        ctx.fillStyle = '#b91c1c'; // Haverford Red Hoodie
        ctx.beginPath();
        ctx.arc(exitPxX, exitPxY - 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Glasses & face
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(exitPxX - 4, exitPxY - 11, 8, 5);
        ctx.strokeStyle = '#1e1e1e';
        ctx.lineWidth = 1;
        ctx.strokeRect(exitPxX - 4, exitPxY - 11, 3, 3);
        ctx.strokeRect(exitPxX + 1, exitPxY - 11, 3, 3);

        // Speech bubble
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(exitPxX - 28, exitPxY - 40, 56, 14);
        ctx.fillStyle = '#000000';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(allCollected ? 'BEN!!' : 'HELP!', exitPxX, exitPxY - 30);
        ctx.restore();
      }

      // Draw Study Items
      level.items.forEach((item) => {
        const isCollected = collectedItems.some((ci) => ci.id === item.id);
        if (isCollected) return;

        const ix = item.x * ts + ts / 2;
        const iy = item.y * ts + ts / 2;
        const bob = Math.sin(currentTime * 0.007 + item.x) * 4;

        ctx.save();
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 12;

        // Glowing Item Orb / Cartridge
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(ix, iy + bob, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ix, iy + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // Floating Title Tag
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, ix, iy + bob - 16);

        // Small subtext
        ctx.font = '9px "VT323", monospace';
        ctx.fillStyle = item.color;
        ctx.fillText('ITEM', ix, iy + bob + 20);
        ctx.restore();
      });

      // Draw Shadows (Obstacles)
      shadowsRef.current.forEach((sh) => {
        const pulse = Math.sin(sh.pulsePhase) * 3;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 6, 28, 0.88)';
        ctx.shadowColor = '#581c87';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, sh.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Creepy Yellow/Red Slit Eyes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(sh.x - 6, sh.y - 2, 4, 3);
        ctx.fillRect(sh.x + 2, sh.y - 2, 4, 3);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sh.x - 5, sh.y - 2, 2, 3);
        ctx.fillRect(sh.x + 3, sh.y - 2, 2, 3);
        ctx.restore();
      });

      // Draw Lasers (Obstacles)
      lasersRef.current.forEach((laser) => {
        if (laser.state === 'OFF') {
          // Terminal Nodes only
          ctx.fillStyle = '#475569';
          ctx.fillRect(laser.startX - 4, laser.startY - 4, 8, 8);
          ctx.fillRect(laser.endX - 4, laser.endY - 4, 8, 8);
          return;
        }

        if (laser.state === 'WARNING') {
          // Blinking Warning Guide Beam
          const blink = Math.sin(currentTime * 0.03) > 0;
          ctx.save();
          ctx.strokeStyle = blink ? 'rgba(255, 119, 0, 0.7)' : 'rgba(255, 119, 0, 0.15)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(laser.startX, laser.startY);
          ctx.lineTo(laser.endX, laser.endY);
          ctx.stroke();

          // Terminal warning lights
          ctx.fillStyle = '#ff7700';
          ctx.fillRect(laser.startX - 5, laser.startY - 5, 10, 10);
          ctx.fillRect(laser.endX - 5, laser.endY - 5, 10, 10);
          ctx.restore();
        } else if (laser.state === 'ACTIVE') {
          // High Voltage Deadly Beam
          ctx.save();
          ctx.shadowColor = '#ff2a6d';
          ctx.shadowBlur = 16;
          ctx.strokeStyle = '#ff2a6d';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(laser.startX, laser.startY);
          ctx.lineTo(laser.endX, laser.endY);
          ctx.stroke();

          // White-hot center beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(laser.startX, laser.startY);
          ctx.lineTo(laser.endX, laser.endY);
          ctx.stroke();

          // Glowing Terminals
          ctx.fillStyle = '#ff2a6d';
          ctx.fillRect(laser.startX - 6, laser.startY - 6, 12, 12);
          ctx.fillRect(laser.endX - 6, laser.endY - 6, 12, 12);
          ctx.restore();
        }
      });

      // Draw Ghosts (Obstacles)
      ghostsRef.current.forEach((ghost) => {
        const floatY = Math.sin(ghost.wobble) * 4;
        ctx.save();
        ctx.shadowColor = ghost.color;
        ctx.shadowBlur = 14;

        // Ghost Body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y + floatY - 2, ghost.radius, Math.PI, 0, false);
        // Ghost bottom ruffles
        ctx.lineTo(ghost.x + ghost.radius, ghost.y + floatY + 12);
        ctx.lineTo(ghost.x + ghost.radius * 0.5, ghost.y + floatY + 7);
        ctx.lineTo(ghost.x, ghost.y + floatY + 12);
        ctx.lineTo(ghost.x - ghost.radius * 0.5, ghost.y + floatY + 7);
        ctx.lineTo(ghost.x - ghost.radius, ghost.y + floatY + 12);
        ctx.closePath();
        ctx.fill();

        // Ghost glowing eyes
        const eyeDx = ghost.vx > 0 ? 3 : ghost.vx < 0 ? -3 : 0;
        ctx.fillStyle = '#05030a';
        ctx.beginPath();
        ctx.arc(ghost.x - 4 + eyeDx, ghost.y + floatY - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(ghost.x + 4 + eyeDx, ghost.y + floatY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cyan pupil glint
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(ghost.x - 4 + eyeDx, ghost.y + floatY - 2, 1.5, 1.5);
        ctx.fillRect(ghost.x + 4 + eyeDx, ghost.y + floatY - 2, 1.5, 1.5);
        ctx.restore();
      });

      // Draw Ben (Player)
      if (!p.isDead) {
        ctx.save();

        // Flashlight cone casting ahead into the dark
        const coneAngle = 0.55;
        const coneDistance = 85;
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          5,
          p.x + Math.cos(p.facingAngle) * coneDistance,
          p.y + Math.sin(p.facingAngle) * coneDistance,
          coneDistance
        );
        grad.addColorStop(0, 'rgba(255, 243, 196, 0.45)');
        grad.addColorStop(1, 'rgba(255, 243, 196, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, coneDistance, p.facingAngle - coneAngle, p.facingAngle + coneAngle);
        ctx.closePath();
        ctx.fill();

        // Ben's Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 11, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stepping feet animation
        const step = Math.sin(p.walkFrame) * 4;
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(p.x - 7, p.y + 7 + (step > 0 ? step : 0), 5, 5);
        ctx.fillRect(p.x + 2, p.y + 7 + (step < 0 ? -step : 0), 5, 5);

        // Haverford Coat / Jacket (Black & Scarlet)
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Scarlet Haverford Scarf / Stripe
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(p.x - 7, p.y - 2, 14, 4);

        // Head / Beanie
        ctx.fillStyle = '#fde047'; // Hair/face
        ctx.beginPath();
        ctx.arc(p.x, p.y - 5, 6, 0, Math.PI * 2);
        ctx.fill();

        // Haverford Beanie Hat
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(p.x - 6, p.y - 11, 12, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 2, p.y - 13, 4, 3); // Pom-pom

        // Player Tag
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('BEN', p.x, p.y - 18);

        ctx.restore();
      }

      // Hit / Death flash overlay
      if (flashAlphaRef.current > 0.01) {
        ctx.fillStyle = `rgba(239, 68, 68, ${flashAlphaRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashAlphaRef.current = Math.max(0, flashAlphaRef.current - dt * 2);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [level, collectedItems, onItemCollected, onLevelComplete, onPlayerDeath, externalDirection]);

  return (
    <div className="relative w-full flex items-center justify-center bg-black rounded border-2 border-[#581c87] shadow-[0_0_25px_rgba(88,28,135,0.4)] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={level.gridCols * level.tileSize}
        height={level.gridRows * level.tileSize}
        className="block max-w-full h-auto aspect-[20/13] select-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default GameCanvas;
