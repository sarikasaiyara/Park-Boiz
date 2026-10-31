/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import RetroButton from './RetroButton';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="relative w-full max-w-2xl bg-[#0f172a]/90 backdrop-blur-md border-4 border-[#84cc16] rounded-2xl p-8 md:p-12 shadow-[0_0_60px_rgba(132,204,22,0.35)] flex flex-col items-center text-center gap-6 my-auto select-none">
      {/* Halloween & Campus Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#84cc16]/20 border border-[#84cc16] text-[#bef264] font-retro text-[10px] uppercase tracking-widest rounded-full">
        <span>🎃</span> BRYN MAWR COLLEGE • PARK SCIENCE BUILDING
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-retro text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          PARK SCIENCE:
          <span className="block text-[#84cc16] text-2xl sm:text-3xl md:text-4xl mt-1 retro-text-glow">
            HALLOWEEN DATA RESCUE
          </span>
        </h1>
        <p className="font-vt323 text-xl md:text-2xl text-slate-300 max-w-lg mx-auto leading-snug">
          Mateo is lost in the building on Halloween night. Ben must navigate the floors,
          survive the hazards, and rescue him before tomorrow’s Data Structures exam.
        </p>
      </div>

      {/* Simplified Controls Note */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-retro text-slate-400 py-1">
        <span><strong className="text-white">WASD / ARROWS:</strong> Move</span>
        <span>•</span>
        <span><strong className="text-[#84cc16]">SPACE:</strong> Jump</span>
        <span>•</span>
        <span><strong className="text-amber-400">E / ENTER:</strong> Interact</span>
      </div>

      {/* Prominent Start Button */}
      <div className="w-full max-w-md pt-2">
        <RetroButton
          onClick={onStart}
          variant="primary"
          className="w-full text-base sm:text-lg py-4 !bg-[#84cc16] !border-white !text-slate-950 hover:!bg-[#65a30d] shadow-[0_0_25px_rgba(132,204,22,0.6)] animate-pulse"
        >
          START ADVENTURE ▶
        </RetroButton>
      </div>
    </div>
  );
};

export default StartScreen;
