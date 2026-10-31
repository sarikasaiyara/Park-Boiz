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
        return 'FLOOR: 1ST FLOOR (SCIENCE ATRIUM)';
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
        return 'EXPLORE ATRIUM • TALK TO COSTUMED STUDENTS • FIND 2ND FL LAB ENTRANCE';
      case 'SECTION_2':
        return 'CROSS ACID VATS • ACTIVATE SWITCHES • REACH 3RD FLOOR STAIRS';
      case 'SECTION_3':
        return 'ESCAPE ATHENA’S ACADEMIC GHOST • REACH MATEO AT THE END OF THE HALL!';
      default:
        return 'RESCUE MATEO BEFORE MIDTERM TOMORROW';
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-2 select-none">
      {/* Top Banner with Floor, Objective, Sound, and Restart */}
      <div className="w-full bg-[#0f172a]/95 border-2 border-[#84cc16] rounded-lg p-2.5 md:p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(132,204,22,0.25)]">
        
        {/* Current Floor */}
        <div className="px-2.5 py-1 bg-black/60 border border-[#84cc16] text-[#bef264] rounded font-retro text-[10px] md:text-xs font-bold">
          {getFloorTitle()}
        </div>

        {/* Objective Tracker */}
        <div className="flex-1 min-w-[200px] text-center">
          <div className="font-retro text-[8px] text-slate-400 uppercase tracking-wider">
            OBJECTIVE:
          </div>
          <div className="font-retro text-[10px] md:text-xs text-amber-300 font-bold tracking-tight">
            {getObjectiveText()}
          </div>
        </div>

        {/* Controls & Sound Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title="Toggle Retro Chiptune Audio"
            className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-500 rounded font-retro text-xs text-slate-200 transition-colors"
          >
            {soundEnabled ? '🔊 SFX ON' : '🔇 MUTED'}
          </button>

          {/* Restart Section Button */}
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
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded font-retro text-[10px] text-slate-300 transition-all hover:scale-105"
          >
            TITLE MENU
          </button>
        </div>
      </div>

      {/* Checkpoint Status Bar if present */}
      {checkpointStatus && (
        <div className="w-full bg-[#090d16] border border-slate-700 rounded px-3 py-1 flex items-center justify-between text-[9px] font-retro text-slate-400">
          <span>CHECKPOINT STATUS: <strong className="text-[#84cc16]">{checkpointStatus}</strong></span>
          <span className="text-[#bef264]">ACTIVE</span>
        </div>
      )}
    </div>
  );
};

export default HUD;
