/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';
import { sound } from '../services/sound';

interface IntroCutsceneProps {
  onComplete: () => void;
}

export const IntroCutscene: React.FC<IntroCutsceneProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    sound.playInteract();
  }, [step]);

  const advanceStep = () => {
    sound.playBlip();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        advanceStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);

  return (
    <div className="relative w-full max-w-3xl bg-[#0f172a]/95 border-4 border-[#84cc16] rounded-xl shadow-[0_0_50px_rgba(132,204,22,0.3)] p-6 md:p-8 flex flex-col items-center gap-6 my-auto text-white select-none">
      
      {/* Scene Header */}
      <div className="flex items-center justify-between w-full border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎃</span>
          <span className="font-retro text-xs md:text-sm text-[#84cc16]">
            PARK SCIENCE ATRIUM • BRYN MAWR COLLEGE
          </span>
        </div>
        <span className="font-retro text-[10px] text-slate-400">
          OCTOBER 31 • 11:20 PM
        </span>
      </div>

      {/* 16-bit Pixel Art Staging Area Styled Exactly after Park Science Photo */}
      <div className="w-full h-60 md:h-72 bg-[#1e293b] border-2 border-slate-600 rounded-lg relative overflow-hidden flex flex-col justify-end p-4">
        
        {/* Background Architecture: Park Science High Ceiling, Mezzanine & Windows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Upper Mezzanine Balcony & Skylights */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-[#f8fafc]/90 border-b-4 border-[#cbd5e1] shadow-md flex items-end px-4 pb-1 justify-between">
            {/* Skylight beams */}
            <div className="absolute top-0 right-12 w-28 h-8 bg-sky-200/40 border-b border-sky-300 transform -skew-x-12"></div>
            
            {/* Mezzanine Railing Cable Lines */}
            <div className="w-full h-8 flex flex-col justify-around">
              <div className="w-full h-0.5 bg-slate-400"></div>
              <div className="w-full h-0.5 bg-slate-400"></div>
              <div className="w-full h-0.5 bg-slate-400"></div>
            </div>

            {/* Green Pod Chairs on Balcony */}
            <div className="absolute top-6 left-12 w-8 h-8 rounded-full bg-[#65a30d] border border-[#4d7c0f]"></div>
            <div className="absolute top-6 left-24 w-8 h-8 rounded-full bg-[#65a30d] border border-[#4d7c0f]"></div>
            <div className="absolute top-6 left-48 w-8 h-8 rounded-full bg-[#65a30d] border border-[#4d7c0f]"></div>
            <div className="absolute top-6 right-36 w-8 h-8 rounded-full bg-[#65a30d] border border-[#4d7c0f]"></div>

            {/* Spooky Cobwebs draped on Mezzanine */}
            <div className="absolute top-16 left-6 text-slate-300 opacity-60 text-lg">🕸️</div>
            <div className="absolute top-16 right-20 text-slate-300 opacity-60 text-lg">🕸️</div>
          </div>

          {/* White Architectural Pillars */}
          <div className="absolute top-0 bottom-0 left-36 w-6 bg-[#f1f5f9] shadow-md"></div>
          <div className="absolute top-0 bottom-0 left-72 w-6 bg-[#f1f5f9] shadow-md"></div>
          <div className="absolute top-0 bottom-0 right-48 w-6 bg-[#f1f5f9] shadow-md"></div>

          {/* Large Glass Windows on Left/Back looking into Halloween Night */}
          <div className="absolute top-24 left-4 w-28 h-28 bg-[#0b1329] border-4 border-[#14532d] rounded flex flex-col justify-around p-1 shadow-inner">
            <div className="w-full h-0.5 bg-[#14532d]"></div>
            <div className="w-0.5 h-full bg-[#14532d] absolute left-14 top-0"></div>
            {/* Moon in window */}
            <div className="w-4 h-4 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a] ml-auto"></div>
          </div>

          {/* Background Academic Lab Doors */}
          <div className="absolute top-26 right-8 w-20 h-32 bg-[#0f172a] border-2 border-slate-500 rounded p-1 flex flex-col items-center">
            <div className="w-16 h-12 bg-sky-950/60 border border-slate-600 rounded"></div>
            <span className="font-retro text-[6px] text-slate-300 mt-2">MATH LOUNGE</span>
          </div>

          {/* Distinctive Green Lounge Sofas from photo */}
          <div className="absolute bottom-10 left-10 w-24 h-12 bg-[#65a30d] border-2 border-[#4d7c0f] rounded-lg shadow-md flex items-center justify-center">
            <div className="w-20 h-4 bg-[#84cc16] rounded-sm"></div>
          </div>

          {/* Bright Yellow Chairs from photo */}
          <div className="absolute bottom-10 right-28 w-8 h-8 bg-[#eab308] border border-[#ca8a04] rounded-t-lg shadow"></div>
        </div>

        {/* Polished Atrium Floor */}
        <div className="w-full h-16 bg-[#94a3b8]/90 border-t-2 border-slate-300 relative z-0"></div>

        {/* Characters at Center Study Table */}
        <div className="relative z-10 flex items-end justify-center gap-12 w-full pb-2">
          
          {/* Ben */}
          <div className="flex flex-col items-center">
            {step === 2 && (
              <div className="mb-2 bg-white text-slate-900 font-retro text-[9px] px-2.5 py-1 rounded-full shadow animate-bounce">
                &quot;Where is he?!&quot;
              </div>
            )}
            <div className="w-14 h-24 flex flex-col items-center relative">
              {/* Haverford Red Beanie */}
              <div className="w-9 h-6 bg-[#b91c1c] border-2 border-[#7f1d1d] rounded-t-md relative">
                <div className="w-2.5 h-2.5 bg-white rounded-full absolute -top-1.5 left-3"></div>
              </div>
              {/* Face */}
              <div className="w-8 h-6 bg-[#fed7aa] border-x-2 border-[#b91c1c] flex items-center justify-around px-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
              {/* Bright RED Haverford Hoodie */}
              <div className="w-12 h-10 bg-[#dc2626] border-2 border-[#991b1b] rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <span className="font-retro text-[7px] text-white font-bold tracking-tighter">H</span>
              </div>
              {/* Pants */}
              <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                <div className="w-3.5 h-full bg-[#0f172a]"></div>
                <div className="w-3.5 h-full bg-[#0f172a]"></div>
              </div>
            </div>
            <span className="font-retro text-[10px] text-[#f87171] mt-1">BEN</span>
            <span className="font-vt323 text-xs text-slate-400">Haverford College</span>
          </div>

          {/* Blonde Wood Study Table with Bright Yellow Chairs */}
          <div className="w-36 h-14 bg-[#fde68a] border-2 border-[#d97706] rounded flex flex-col items-center justify-between p-1 shadow-md">
            <div className="w-full flex justify-around text-xs">
              <span title="Laptop">💻</span>
              <span title="Notes">📑</span>
              <span title="Coffee">☕</span>
            </div>
            <div className="w-full text-center font-retro text-[7px] text-slate-800 truncate font-bold">
              DATA STRUCTURES
            </div>
          </div>

          {/* Mateo */}
          <div className="flex flex-col items-center">
            {step === 0 && (
              <div className="mb-2 bg-[#84cc16] text-slate-950 font-retro text-[9px] px-2.5 py-1 rounded-full shadow animate-bounce">
                &quot;Coffee run!&quot;
              </div>
            )}
            {step === 0 ? (
              <div className="w-14 h-24 flex flex-col items-center relative transition-opacity duration-300">
                <div className="w-9 h-6 bg-[#451a03] rounded-t-md"></div>
                <div className="w-8 h-6 bg-[#fde047] flex items-center justify-around px-0.5 border-b border-[#451a03]">
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm"></div>
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm"></div>
                </div>
                {/* Green/Teal Hoodie */}
                <div className="w-12 h-10 bg-[#0f766e] border-2 border-[#115e59] rounded-md relative flex items-center justify-center">
                  <span className="font-retro text-[7px] text-white">M</span>
                </div>
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
            ) : (
              <div className="w-14 h-24 flex flex-col items-center justify-end relative opacity-60">
                <div className="w-10 h-16 border-2 border-dashed border-[#84cc16] rounded flex flex-col items-center justify-center text-slate-400 font-retro text-[8px] text-center p-1">
                  MATEO IS GONE
                </div>
              </div>
            )}
            <span className="font-retro text-[10px] text-[#84cc16] mt-1">MATEO</span>
            <span className="font-vt323 text-xs text-slate-400">
              {step === 0 ? 'Study Buddy' : 'Missing!'}
            </span>
          </div>

        </div>
      </div>

      {/* 16-Bit RPG Dialogue Box */}
      <div className="w-full bg-[#0f172a] border-4 border-[#84cc16] rounded-lg p-4 text-left shadow-[0_0_20px_rgba(132,204,22,0.25)] min-h-[110px] flex flex-col justify-between">
        <div>
          {step === 0 && (
            <div>
              <div className="font-retro text-xs text-[#84cc16] mb-2 tracking-wider">
                MATEO:
              </div>
              <p className="font-vt323 text-2xl text-white leading-snug">
                “I’m going to get us coffee from the Math Lounge.”
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="font-retro text-xs text-[#facc15] mb-2 tracking-wider">
                TIME PASSES...
              </div>
              <p className="font-vt323 text-2xl text-[#fef08a] leading-snug animate-pulse">
                Twenty minutes later, Mateo has not returned.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="font-retro text-xs text-[#f87171] mb-2 tracking-wider">
                BEN:
              </div>
              <p className="font-vt323 text-2xl text-white leading-snug">
                “Where is this guy? I’m going to find him.”
              </p>
            </div>
          )}
        </div>

        {/* Prompt to advance */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700 mt-2 font-retro text-[9px] text-slate-400">
          <span>PRESS [SPACE], [ENTER], OR CLICK NEXT</span>
          <span className="text-[#84cc16] animate-pulse">STEP {step + 1} / 3 ▶</span>
        </div>
      </div>

      {/* Button controls */}
      <div className="w-full flex justify-end">
        <RetroButton
          onClick={advanceStep}
          variant="primary"
          className="w-full sm:w-auto text-sm py-3 px-8 !bg-[#84cc16] !border-white !text-slate-950 hover:!bg-[#65a30d]"
        >
          {step < 2 ? 'CONTINUE ▶' : 'ENTER PARK SCIENCE (SECTION 1) ▶'}
        </RetroButton>
      </div>

    </div>
  );
};

export default IntroCutscene;
