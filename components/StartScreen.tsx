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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 md:p-6 text-center select-none overflow-y-auto">
      <div className="max-w-3xl w-full bg-[#140626]/95 border-4 border-[#ff7700] rounded-xl p-6 md:p-8 shadow-[0_0_55px_rgba(255,119,0,0.4)] flex flex-col items-center gap-5 my-auto">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3 py-1 bg-[#581c87]/70 border border-[#c084fc] text-[#c084fc] font-retro text-[9px] uppercase tracking-wider rounded">
            🎃 BRYN MAWR COLLEGE • PARK SCIENCE BUILDING
          </span>
          <span className="px-3 py-1 bg-[#dc2626]/30 border border-[#dc2626] text-[#f87171] font-retro text-[9px] uppercase tracking-wider rounded">
            16-BIT RETRO ADVENTURE
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-retro text-[#ff7700] tracking-tight leading-tight retro-text-glow">
            PARK SCIENCE:
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-retro text-[#38bdf8] tracking-tight">
            HALLOWEEN DATA RESCUE
          </h2>
        </div>

        {/* Story Summary Box */}
        <div className="w-full bg-[#0a0314] border border-[#581c87] rounded-lg p-3.5 text-left font-vt323 text-lg md:text-xl text-[#e9d5ff] leading-snug">
          <p className="mb-2">
            It is <strong className="text-[#ff7700]">Halloween night</strong> at Bryn Mawr College’s three-story Park Science Building.
            <strong className="text-[#f87171]"> Ben</strong> (wearing his bright RED Haverford hoodie) and his friend <strong className="text-[#00e5ff]">Mateo</strong> are studying for tomorrow’s Data Structures exam.
          </p>
          <p>
            When Mateo leaves for coffee and vanishes, Ben ventures into the building to find him. Talk with costumed Bryn Mawr students, survive the hazardous 2nd floor chemistry lab, and escape the spooky academic ghost of <strong className="text-[#38bdf8]">Athena</strong>!
          </p>
        </div>

        {/* Three Playable Sections Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
          {/* Section 1 */}
          <div className="bg-[#1c0c38] border border-[#38bdf8]/50 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="font-retro text-[10px] text-[#38bdf8] mb-1">SECTION 1: 1ST FLOOR</div>
              <div className="font-vt323 text-base text-gray-300">
                Explore library halls, chat with silly/scary costumed students, and find the entrance to the chemistry lab.
              </div>
            </div>
            <div className="font-vt323 text-xs text-cyan-300 mt-2">
              ✦ Exploration & Dialogue
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-[#1c0c38] border border-[#39ff14]/50 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="font-retro text-[10px] text-[#39ff14] mb-1">SECTION 2: CHEM LAB</div>
              <div className="font-vt323 text-base text-gray-300">
                Single-player co-op style platforming: leap over acid pools, ride moving platforms, avoid falling beakers, and hit switches!
              </div>
            </div>
            <div className="font-vt323 text-xs text-green-300 mt-2">
              ✦ Precision Platforming & Checkpoints
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#1c0c38] border border-[#ff2a6d]/50 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="font-retro text-[10px] text-[#ff2a6d] mb-1">SECTION 3: ATHENA CHASE</div>
              <div className="font-vt323 text-base text-gray-300">
                Action chase on the 3rd floor! Athena’s ghost is pursuing you. Mash Spacebar to sprint, jump gaps, and find Mateo!
              </div>
            </div>
            <div className="font-vt323 text-xs text-pink-300 mt-2">
              ✦ 60-90s High-Stakes Chase
            </div>
          </div>
        </div>

        {/* Visible Controls Box */}
        <div className="w-full bg-[#080212] border-2 border-[#581c87] p-3.5 rounded-lg text-left font-retro text-[9px] sm:text-[10px] text-gray-300 space-y-1.5">
          <div className="text-[#a855f7] uppercase font-bold tracking-wider">
            CONTROLS:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <div><span className="text-[#38bdf8]">WASD / ARROW KEYS:</span> Move Ben</div>
            <div><span className="text-[#39ff14]">SPACEBAR:</span> Jump / Vault</div>
            <div><span className="text-[#facc15]">E / ENTER:</span> Interact with Costumes / Switches</div>
            <div><span className="text-[#ff7700]">MASH SPACEBAR:</span> Sprint boost during Athena Chase</div>
          </div>
          <div className="text-gray-400 pt-1 border-t border-[#3b1263] text-[9px]">
            * Fair checkpoints throughout every section. If you hit an obstacle, you restart at your latest checkpoint!
          </div>
        </div>

        {/* Big Start Button */}
        <div className="w-full pt-1">
          <RetroButton
            onClick={onStart}
            variant="primary"
            className="w-full text-base md:text-lg py-4 !bg-[#ff7700] !border-white !text-black hover:!bg-[#ea580c] shadow-[0_0_30px_rgba(255,119,0,0.7)] animate-pulse"
          >
            START ADVENTURE (BEGIN INTRO CUTSCENE) ▶
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
