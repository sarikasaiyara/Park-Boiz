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
  // Cutscene steps:
  // 0: Ben spots Mateo in the 3rd floor alcove, Mateo turns around
  // 1: They walk toward each other, hold hands / embrace with sweet hearts
  // 2: Ben speaks: “I missed you, bro.”
  // 3: Mateo speaks: “Let’s never leave each other again.”
  // 4: Full Victory banner: “VICTORY — MATEO FOUND” & “Data Structures Exam Survival: 1%”

  useEffect(() => {
    sound.playVictory();
  }, []);

  useEffect(() => {
    // Automatically advance cutscene beats or allow click
    const timer = setTimeout(() => {
      if (cutsceneStep < 4) {
        setCutsceneStep((prev) => prev + 1);
        sound.playInteract();
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
    <div className="relative w-full max-w-3xl bg-[#110521] border-4 border-[#ff7700] rounded-xl shadow-[0_0_50px_rgba(255,119,0,0.5)] p-6 md:p-8 flex flex-col items-center gap-6 my-auto text-white select-none">
      
      {/* Celebration Header */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-3xl animate-bounce">🎃</span>
        <span className="text-3xl animate-bounce delay-100">🤝</span>
        <span className="text-3xl animate-bounce delay-200">🎉</span>
      </div>

      {/* 16-Bit Pixel Art Cutscene Stage: Ben & Mateo Reunite */}
      <div className="w-full h-64 bg-[#080210] border-2 border-[#581c87] rounded-lg relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-inner">
        
        {/* Background Library Bookshelves & Spooky Halloween Lights */}
        <div className="absolute inset-0 opacity-25 flex justify-between p-4 pointer-events-none">
          <div className="w-24 h-48 bg-[#2e1065] border border-[#6b21a8] rounded flex flex-col p-1 gap-1">
            <div className="h-4 bg-[#7c3aed]"></div>
            <div className="h-4 bg-[#9333ea]"></div>
            <div className="h-4 bg-[#a855f7]"></div>
          </div>
          <div className="font-retro text-[8px] text-[#00e5ff] border border-[#00e5ff] p-2 h-16 rounded bg-black/60 text-center">
            PARK SCIENCE<br/>3RD FLOOR<br/>STUDY NOOK
          </div>
          <div className="w-24 h-48 bg-[#2e1065] border border-[#6b21a8] rounded flex flex-col p-1 gap-1">
            <div className="h-4 bg-[#7c3aed]"></div>
            <div className="h-4 bg-[#9333ea]"></div>
          </div>
        </div>

        {/* Floating Heart / Bro-mance Sparks */}
        {cutsceneStep >= 1 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 animate-bounce z-20">
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
                ? 'gap-32' // Started across the room
                : 'gap-3'  // Walked together, standing arm-in-arm / holding hands
            }`}
          >
            {/* Ben (Left) */}
            <div className="flex flex-col items-center">
              {/* Ben Pixel Character */}
              <div className="w-14 h-24 flex flex-col items-center relative">
                {/* Red Haverford Beanie */}
                <div className="w-9 h-6 bg-[#b91c1c] border-2 border-[#7f1d1d] rounded-t-md relative">
                  <div className="w-2.5 h-2.5 bg-white rounded-full absolute -top-1.5 left-3"></div>
                </div>
                {/* Face looking right toward Mateo */}
                <div className="w-8 h-6 bg-[#fed7aa] border-x-2 border-[#b91c1c] flex items-center justify-around px-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full ml-1"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full ml-1"></div>
                </div>
                {/* Bright RED Haverford Hoodie */}
                <div className="w-12 h-10 bg-[#dc2626] border-2 border-[#991b1b] rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  <span className="font-retro text-[7px] text-white font-bold">H</span>
                  {/* Extended Arm when holding hands */}
                  {cutsceneStep >= 1 && (
                    <div className="absolute -right-3 top-2 w-4 h-3 bg-[#dc2626] rounded-r border-r border-black"></div>
                  )}
                </div>
                {/* Pants */}
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
              <span className="font-retro text-[9px] text-[#f87171] mt-1">BEN</span>
            </div>

            {/* Mateo (Right) */}
            <div className="flex flex-col items-center">
              {/* Mateo Pixel Character */}
              <div className="w-14 h-24 flex flex-col items-center relative">
                {/* Hair */}
                <div className="w-9 h-6 bg-[#451a03] rounded-t-md"></div>
                {/* Face & Glasses looking left toward Ben */}
                <div className="w-8 h-6 bg-[#fde047] flex items-center justify-around px-0.5 border-b border-[#451a03]">
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm mr-1"></div>
                  <div className="w-3 h-2 border border-black bg-cyan-100 rounded-sm mr-1"></div>
                </div>
                {/* Green/Teal Hoodie */}
                <div className="w-12 h-10 bg-[#0f766e] border-2 border-[#115e59] rounded-md relative flex items-center justify-center">
                  <span className="font-retro text-[7px] text-white">M</span>
                  {/* Extended Arm when holding hands */}
                  {cutsceneStep >= 1 && (
                    <div className="absolute -left-3 top-2 w-4 h-3 bg-[#0f766e] rounded-l border-l border-black"></div>
                  )}
                </div>
                {/* Pants */}
                <div className="w-10 h-7 bg-[#1e293b] flex justify-between px-1">
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                  <div className="w-3.5 h-full bg-[#0f172a]"></div>
                </div>
              </div>
              <span className="font-retro text-[9px] text-[#00e5ff] mt-1">MATEO</span>
            </div>
          </div>
        </div>

        {/* Floor Line */}
        <div className="w-full h-3 bg-[#311b58] border-t-2 border-[#581c87] rounded"></div>
      </div>

      {/* 16-Bit RPG Dialogue Box with Exact Required Dialogue */}
      <div className="w-full bg-[#0b0314] border-4 border-[#ff7700] rounded-lg p-5 text-left shadow-[0_0_25px_rgba(255,119,0,0.3)] min-h-[120px] flex flex-col justify-between">
        <div>
          {cutsceneStep <= 1 && (
            <div>
              <div className="font-retro text-xs text-[#facc15] mb-2 tracking-wider">
                PARK SCIENCE 3RD FLOOR:
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
              <div className="font-retro text-xs text-[#00e5ff] mb-2 tracking-wider">
                MATEO:
              </div>
              <p className="font-vt323 text-3xl text-white leading-snug">
                “Let’s never leave each other again.”
              </p>
            </div>
          )}
        </div>

        {cutsceneStep < 4 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#3b1263] mt-3 font-retro text-[9px] text-gray-400">
            <span>CLICK TO ADVANCE DIALOGUE</span>
            <span className="text-[#ff7700] animate-pulse">CONTINUE ▶</span>
          </div>
        )}
      </div>

      {/* Exact Required Victory Screen Display */}
      {cutsceneStep >= 4 && (
        <div className="w-full bg-[#180a2b] border-4 border-[#39ff14] p-5 rounded-lg text-center flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200 shadow-[0_0_35px_rgba(57,255,20,0.5)]">
          <div className="text-2xl md:text-3xl lg:text-4xl font-retro text-[#39ff14] retro-text-glow leading-tight">
            VICTORY — MATEO FOUND
          </div>
          <div className="text-xl md:text-2xl font-retro text-[#facc15] leading-tight">
            Data Structures Exam Survival: 1%
          </div>
          <p className="font-vt323 text-lg md:text-xl text-gray-300 max-w-lg mt-1">
            Against all odds, Ben traversed the 1st floor labyrinth, survived the 2nd floor hazardous
            chemistry acid vats, and escaped the haunting academic ghost of Athena on the 3rd floor.
          </p>

          <div className="w-full pt-3">
            <RetroButton
              onClick={onRestart}
              variant="primary"
              className="w-full text-base md:text-lg py-4 !bg-[#ff7700] !border-white !text-black hover:!bg-[#ea580c] shadow-[0_0_20px_rgba(255,119,0,0.7)]"
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
