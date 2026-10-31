/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStage } from '../types';

interface HUDProps {
  stage: GameStage;
  checkpointStatus?: string;
  onRestartSection: () => void;
  onRestartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stage,
  checkpointStatus,
  onRestartSection,
  onRestartGame,
  soundEnabled,
  onToggleSound,
}) => {
  const getFloorTitle = () => {
    switch (stage) {
      case 'SECTION_1':
        return 'FLOOR: 1ST FLOOR (LIBRARY EXPLORATION)';
      case 'SECTION_2':
        return 'FLOOR: 2ND FLOOR (CHEMISTRY LAB)';
      case 'SECTION_3':
        return 'FLOOR: 3RD FLOOR (ATHENA CHASE)';
      default:
        return 'PARK SCIENCE BUILDING';
    }
  };

  const getObjectiveText = () => {
    switch (stage) {
      case 'SECTION_1':
        return 'FIND ENTRANCE TO 2ND FLOOR LAB • TALK TO COSTUMED STUDENTS';
      case 'SECTION_2':
        return 'CROSS ACID VATS • ACTIVATE SWITCHES • REACH 3RD FLOOR STAIRS';
      case 'SECTION_3':
        return 'ESCAPE ATHENA’S ACADEMIC GHOST • REACH MATEO AT THE END OF THE HALL!';
      default:
        return 'RESCUE MATEO BEFORE MIDTERM TOMORROW';
    }
  };

  const getAccentColor = () => {
    switch (stage) {
      case 'SECTION_1':
        return 'border-[#38bdf8] text-[#38bdf8]';
      case 'SECTION_2':
        return 'border-[#39ff14] text-[#39ff14]';
      case 'SECTION_3':
        return 'border-[#ff2a6d] text-[#ff2a6d]';
      default:
        return 'border-[#ff7700] text-[#ff7700]';
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-2 select-none">
      {/* Top Banner with Floor, Objective, Sound, and Restart */}
      <div className="w-full bg-[#140624] border-2 border-[#581c87] rounded-lg p-2.5 md:p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(88,28,135,0.3)]">
        
        {/* Current Floor */}
        <div className={`px-2.5 py-1 bg-black/50 border rounded font-retro text-[10px] md:text-xs font-bold ${getAccentColor()}`}>
          {getFloorTitle()}
        </div>

        {/* Objective Tracker */}
        <div className="flex-1 min-w-[200px] text-center">
          <div className="font-retro text-[8px] text-gray-400 uppercase tracking-wider">
            OBJECTIVE:
          </div>
          <div className="font-retro text-[10px] md:text-xs text-[#facc15] font-bold tracking-tight">
            {getObjectiveText()}
          </div>
        </div>

        {/* Controls & Sound Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title="Toggle Retro Chiptune Audio"
            className="p-1.5 px-2 bg-[#230c3d] hover:bg-[#391561] border border-[#a855f7] rounded font-retro text-xs text-gray-200 transition-colors"
          >
            {soundEnabled ? '🔊 SFX ON' : '🔇 MUTED'}
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestartSection}
            title="Restart Current Section"
            className="px-2.5 py-1 bg-[#dc2626]/20 hover:bg-[#dc2626]/40 border border-[#dc2626] rounded font-retro text-[10px] text-[#f87171] transition-all hover:scale-105"
          >
            ↺ RESTART SECTION
          </button>

          {/* Title Menu Button */}
          <button
            onClick={onRestartGame}
            title="Return to Title Menu"
            className="px-2.5 py-1 bg-[#475569]/30 hover:bg-[#475569]/50 border border-gray-600 rounded font-retro text-[10px] text-gray-300 transition-all hover:scale-105"
          >
            TITLE MENU
          </button>
        </div>
      </div>

      {/* Checkpoint Status Bar if present */}
      {checkpointStatus && (
        <div className="w-full bg-[#0a0214] border border-[#581c87]/60 rounded px-3 py-1 flex items-center justify-between text-[9px] font-retro text-gray-400">
          <span>CHECKPOINT STATUS: <strong className="text-[#38bdf8]">{checkpointStatus}</strong></span>
          <span className="text-[#39ff14]">ACTIVE</span>
        </div>
      )}
    </div>
  );
};

export default HUD;
