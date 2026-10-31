/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RetroButton from './RetroButton';
import { sound } from '../services/sound';

interface FinalSceneProps {
  onRestart: () => void;
}

export const FinalScene: React.FC<FinalSceneProps> = ({ onRestart }) => {
  const [cutsceneStep, setCutsceneStep] = useState<number>(0);

  useEffect(() => {
    sound.playVictory();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cutsceneStep < 4) {
        setCutsceneStep((prev) => prev + 1);
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [cutsceneStep]);

  const advanceCutscene = () => {
    sound.playBlip();
    if (cutsceneStep < 4) {
      setCutsceneStep(cutsceneStep + 1);
    }
  };

  return (
    <div className="relative w-full max-w-3xl bg-[#0f172a]/95 border-4 border-[#84cc16] rounded-xl shadow-[0_0_55px_rgba(132,204,22,0.4)] p-6 md:p-8 flex flex-col items-center gap-6 my-auto text-white select-none">
      
      {/* Celebration Header */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl animate-bounce">🎃</span>
          <span className="text-3xl animate-bounce delay-100">🤝</span>
          <span className="text-3xl animate-bounce delay-200">🎉</span>
        </div>
        <div className="px-3 py-1 bg-rose-950/80 border border-rose-500 rounded-full font-retro text-[9px] text-rose-300 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
          <span>💖</span> NOW PLAYING: CHEESY ROMANTIC BALLAD
        </div>
      </div>

      {/* 16-Bit Pixel Art Cutscene Stage: Park Science 3rd Floor Math Lounge */}
      <div className="w-full h-64 bg-[#1e293b] border-2 border-slate-600 rounded-lg relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-inner">
        
        {/* Background Architecture from Park Science Photo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Upper Mezzanine Balcony & Skylights */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-[#f8fafc] border-b-2 border-slate-300 flex items-center justify-between px-6">
            <div className="w-24 h-5 bg-sky-200/40 transform -skew-x-12"></div>
            <div className="w-24 h-5 bg-sky-200/40 transform -skew-x-12"></div>
          </div>

          {/* White Columns */}
          <div className="absolute top-0 bottom-0 left-20 w-5 bg-[#ffffff] shadow"></div>
          <div className="absolute top-0 bottom-0 right-20 w-5 bg-[#ffffff] shadow"></div>

          {/* Windows with Dark Green Frames looking into Halloween night */}
          <div className="absolute top-18 left-32 w-28 h-24 bg-[#090e1a] border-2 border-[#14532d] rounded flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]"></div>
          </div>
          <div className="absolute top-18 right-32 w-28 h-24 bg-[#090e1a] border-2 border-[#14532d] rounded flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]"></div>
          </div>

          {/* Background Academic Door (Math Lounge) */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-28 bg-[#0f172a] border border-slate-400 rounded p-1 flex flex-col items-center">
            <span className="font-retro text-[6px] text-[#84cc16] mt-1">MATH LOUNGE</span>
          </div>

          {/* Green Lounge Chairs & Yellow Study Furniture from photo */}
          <div className="absolute bottom-6 left-6 w-16 h-10 bg-[#65a30d] border border-[#4d7c0f] rounded-lg"></div>
          <div className="absolute bottom-6 right-6 w-16 h-10 bg-[#65a30d] border border-[#4d7c0f] rounded-lg"></div>

          {/* Halloween cobwebs */}
          <div className="absolute top-12 left-16 text-slate-300 opacity-60 text-base">🕸️</div>
          <div className="absolute top-12 right-16 text-slate-300 opacity-60 text-base">🕸️</div>
        </div>

        {/* Floating Heart / Bro-mance Sparks */}
        {cutsceneStep >= 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 animate-bounce z-20">
            <span className="text-2xl text-red-500">❤️</span>
            <span className="text-xl text-yellow-400">✨</span>
            <span className="text-2xl text-red-500">❤️</span>
          </div>
        )}

        {/* Character Interaction Stage */}
        <div className="relative z-10 flex-1 flex items-end justify-center w-full">
          <div
            className={`flex items-end transition-all duration-700 ease-out ${
              cutsceneStep === 0
                ? 'gap-32'
                : 'gap-3'
            }`}
          >
            {/* Ben (Left) */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-24 flex flex-col items-center relative">
                <div className="w-9 h-6 bg-[#b91c1c] border-2 border-[#7f1d1d] rounded-t-md relative">
                  <div className="w-2.5 h-2.5 bg-white rounded-full absolute -top-1.5 left-3"></div>
                </div>
                <div className="w-8 h-6 bg-[#fed7aa] border-x-2 border-[#b91c1c] flex items-center justify-around px-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full ml-1"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full ml-1"></div>
                </div>
                <div className="w-12 h-10 bg-[#dc2626] border-2 border-[#991b1b] rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  <span className="font-retro text-[7px] text-white font-bold">H</span>
                  {cutsceneStep >= 1 && (
                    <div className="absolute -right-3 top-2 w-4 h-3 bg-[#dc2626] rounded-r border-r border-black"></div>
                  )}
                </div>
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
              <span className="font-retro text-[9px] text-[#f87171] mt-1">BEN</span>
            </div>

            {/* Mateo (Right) */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-24 flex flex-col items-center relative">
                <div className="w-9 h-6 bg-[#451a03] rounded-t-md"></div>
                <div className="w-8 h-6 bg-[#fde047] flex items-center justify-around px-0.5 border-b border-[#451a03]">
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm mr-1"></div>
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm mr-1"></div>
                </div>
                <div className="w-12 h-10 bg-[#0f766e] border-2 border-[#115e59] rounded-md relative flex items-center justify-center">
                  <span className="font-retro text-[7px] text-white">M</span>
                  {cutsceneStep >= 1 && (
                    <div className="absolute -left-3 top-2 w-4 h-3 bg-[#0f766e] rounded-l border-l border-black"></div>
                  )}
                </div>
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
              <span className="font-retro text-[9px] text-[#84cc16] mt-1">MATEO</span>
            </div>
          </div>
        </div>

        {/* Polished Gray Floor Line */}
        <div className="w-full h-3 bg-[#94a3b8] border-t-2 border-slate-300 rounded"></div>
      </div>

      {/* 16-Bit RPG Dialogue Box with Exact Required Dialogue */}
      <div className="w-full bg-[#0b1329] border-4 border-[#84cc16] rounded-lg p-5 text-left shadow-[0_0_25px_rgba(132,204,22,0.3)] min-h-[120px] flex flex-col justify-between">
        <div>
          {cutsceneStep <= 1 && (
            <div>
              <div className="font-retro text-xs text-[#facc15] mb-2 tracking-wider">
                PARK SCIENCE 3RD FLOOR MATH LOUNGE:
              </div>
              <p className="font-vt323 text-2xl text-white leading-snug">
                Ben vaults past the spectral Athena ghost and spots Mateo in the study alcove!
                They walk together and embrace.
              </p>
            </div>
          )}

          {cutsceneStep === 2 && (
            <div>
              <div className="font-retro text-xs text-[#f87171] mb-2 tracking-wider">
                BEN:
              </div>
              <p className="font-vt323 text-3xl text-white leading-snug">
                “I missed you, bro.”
              </p>
            </div>
          )}

          {(cutsceneStep === 3 || cutsceneStep === 4) && (
            <div>
              <div className="font-retro text-xs text-[#84cc16] mb-2 tracking-wider">
                MATEO:
              </div>
              <p className="font-vt323 text-3xl text-white leading-snug">
                “Let’s never leave each other again.”
              </p>
            </div>
          )}
        </div>

        {cutsceneStep < 4 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700 mt-3 font-retro text-[9px] text-slate-400">
            <span>CLICK TO ADVANCE DIALOGUE</span>
            <span className="text-[#84cc16] animate-pulse">CONTINUE ▶</span>
          </div>
        )}
      </div>

      {/* Exact Required Victory Screen Display */}
      {cutsceneStep >= 4 && (
        <div className="w-full bg-[#0f172a] border-4 border-[#84cc16] p-5 rounded-lg text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200 shadow-[0_0_35px_rgba(132,204,22,0.5)]">
          <div className="text-2xl md:text-3xl lg:text-4xl font-retro text-[#84cc16] retro-text-glow leading-tight">
            VICTORY — MATEO FOUND
          </div>
          <div className="text-xl md:text-2xl font-retro text-[#facc15] leading-tight">
            Data Structures Exam Survival: 1%
          </div>
          <p className="font-vt323 text-lg md:text-xl text-slate-300 max-w-lg mt-1">
            Against all odds, Ben traversed the 1st floor atrium, survived the 2nd floor hazardous
            chemistry acid vats, and escaped the haunting academic ghost of Athena on the 3rd floor!
          </p>

          <div className="w-full pt-3">
            <RetroButton
              onClick={onRestart}
              variant="primary"
              className="w-full text-base md:text-lg py-4 !bg-[#84cc16] !border-white !text-slate-950 hover:!bg-[#65a30d] shadow-[0_0_20px_rgba(132,204,22,0.7)]"
            >
              PLAY AGAIN (RESTART ADVENTURE) ↺
            </RetroButton>
          </div>
        </div>
      )}

      {/* Step Advance Button if before step 4 */}
      {cutsceneStep < 4 && (
        <div className="w-full flex justify-end">
          <RetroButton
            onClick={advanceCutscene}
            variant="secondary"
            className="text-xs py-2 px-6"
          >
            NEXT ▶
          </RetroButton>
        </div>
      )}

    </div>
  );
};

export default FinalScene;
