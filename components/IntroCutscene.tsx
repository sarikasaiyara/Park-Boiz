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
    <div className="relative w-full max-w-3xl bg-[#120722] border-4 border-[#ff7700] rounded-xl shadow-[0_0_45px_rgba(255,119,0,0.4)] p-6 md:p-8 flex flex-col items-center gap-6 my-auto text-white select-none">
      
      {/* Scene Header */}
      <div className="flex items-center justify-between w-full border-b-2 border-[#581c87] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎃</span>
          <span className="font-retro text-xs md:text-sm text-[#ff7700]">
            BRYN MAWR COLLEGE • PARK SCIENCE BUILDING
          </span>
        </div>
        <span className="font-retro text-[10px] text-gray-400">
          OCTOBER 31 • 11:20 PM
        </span>
      </div>

      {/* 16-bit Pixel Art Staging Area */}
      <div className="w-full h-56 md:h-64 bg-[#0a0314] border-2 border-[#3b1263] rounded-lg relative overflow-hidden flex items-center justify-center p-4">
        
        {/* Background Library & Science posters */}
        <div className="absolute inset-0 opacity-30 flex justify-between p-3 pointer-events-none">
          <div className="w-16 h-36 bg-[#2d1b4e] border border-[#6b21a8] rounded flex flex-col p-1 gap-1">
            <div className="h-3 bg-[#4c1d95] rounded"></div>
            <div className="h-3 bg-[#581c87] rounded"></div>
            <div className="h-3 bg-[#6b21a8] rounded"></div>
            <div className="h-3 bg-[#3b0764] rounded"></div>
          </div>
          <div className="text-center font-retro text-[8px] text-[#00e5ff] border border-[#00e5ff]/40 p-1.5 h-16 rounded bg-black/40">
            DATA STRUCTURES<br/>EXAM TOMORROW<br/>9:00 AM
          </div>
          <div className="w-16 h-36 bg-[#2d1b4e] border border-[#6b21a8] rounded flex flex-col p-1 gap-1">
            <div className="h-3 bg-[#4c1d95] rounded"></div>
            <div className="h-3 bg-[#581c87] rounded"></div>
            <div className="h-3 bg-[#6b21a8] rounded"></div>
          </div>
        </div>

        {/* Characters at Study Desk */}
        <div className="relative z-10 flex items-end justify-center gap-12 w-full">
          
          {/* Ben */}
          <div className="flex flex-col items-center">
            {/* Thought or speech indicator */}
            {step === 2 && (
              <div className="mb-2 bg-white text-black font-retro text-[9px] px-2.5 py-1 rounded-full shadow animate-bounce">
                &quot;Where is he?!&quot;
              </div>
            )}
            {/* Ben Character Pixel Sprite Representation */}
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
              <div className="w-12 h-10 bg-[#dc2626] border-2 border-[#991b1b] rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <span className="font-retro text-[7px] text-white font-bold tracking-tighter">H</span>
              </div>
              {/* Pants */}
              <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                <div className="w-3.5 h-full bg-[#0f172a]"></div>
                <div className="w-3.5 h-full bg-[#0f172a]"></div>
              </div>
            </div>
            <span className="font-retro text-[10px] text-[#f87171] mt-1">BEN</span>
            <span className="font-vt323 text-xs text-gray-400">Haverford College</span>
          </div>

          {/* Study Table in Middle */}
          <div className="w-36 h-14 bg-[#3f2719] border-2 border-[#78350f] rounded flex flex-col items-center justify-between p-1">
            <div className="w-full flex justify-around text-xs">
              <span title="Laptop">💻</span>
              <span title="Notes">📑</span>
              <span title="Coffee">☕</span>
            </div>
            <div className="w-full text-center font-retro text-[7px] text-[#facc15] truncate">
              TREES & HASH MAPS
            </div>
          </div>

          {/* Mateo */}
          <div className="flex flex-col items-center">
            {step === 0 && (
              <div className="mb-2 bg-[#00e5ff] text-black font-retro text-[9px] px-2.5 py-1 rounded-full shadow animate-bounce">
                &quot;Coffee run!&quot;
              </div>
            )}
            {/* Mateo Sprite or Empty Chair depending on step */}
            {step === 0 ? (
              <div className="w-14 h-24 flex flex-col items-center relative transition-opacity duration-300">
                {/* Hair */}
                <div className="w-9 h-6 bg-[#451a03] rounded-t-md"></div>
                {/* Face & Glasses */}
                <div className="w-8 h-6 bg-[#fde047] flex items-center justify-around px-0.5 border-b border-[#451a03]">
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm"></div>
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm"></div>
                </div>
                {/* Green/Teal Hoodie */}
                <div className="w-12 h-10 bg-[#0f766e] border-2 border-[#115e59] rounded-md relative flex items-center justify-center">
                  <span className="font-retro text-[7px] text-white">M</span>
                </div>
                {/* Pants */}
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
            ) : (
              <div className="w-14 h-24 flex flex-col items-center justify-end relative opacity-60">
                {/* Empty Chair */}
                <div className="w-10 h-16 border-2 border-dashed border-[#a855f7] rounded flex flex-col items-center justify-center text-gray-500 font-retro text-[8px] text-center p-1">
                  MATEO IS GONE
                </div>
              </div>
            )}
            <span className="font-retro text-[10px] text-[#00e5ff] mt-1">MATEO</span>
            <span className="font-vt323 text-xs text-gray-400">
              {step === 0 ? 'Study Buddy' : 'Missing!'}
            </span>
          </div>

        </div>
      </div>

      {/* 16-Bit RPG Dialogue Box */}
      <div className="w-full bg-[#0c0418] border-4 border-[#a855f7] rounded-lg p-4 text-left shadow-[0_0_20px_rgba(168,85,247,0.3)] min-h-[110px] flex flex-col justify-between">
        <div>
          {step === 0 && (
            <div>
              <div className="font-retro text-xs text-[#00e5ff] mb-2 tracking-wider">
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
        <div className="flex items-center justify-between pt-2 border-t border-[#3b1263] mt-2 font-retro text-[9px] text-gray-400">
          <span>PRESS [SPACE], [ENTER], OR CLICK NEXT</span>
          <span className="text-[#ff7700] animate-pulse">STEP {step + 1} / 3 ▶</span>
        </div>
      </div>

      {/* Button controls */}
      <div className="w-full flex justify-end">
        <RetroButton
          onClick={advanceStep}
          variant="primary"
          className="w-full sm:w-auto text-sm py-3 px-8 !bg-[#ff7700] !border-white !text-black hover:!bg-[#ea580c]"
        >
          {step < 2 ? 'CONTINUE ▶' : 'ENTER PARK SCIENCE (SECTION 1) ▶'}
        </RetroButton>
      </div>

    </div>
  );
};

export default IntroCutscene;
