/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameStage } from './types';
import { sound } from './services/sound';
import StartScreen from './components/StartScreen';
import IntroCutscene from './components/IntroCutscene';
import Section1Floor from './components/Section1Floor';
import Section2ChemLab from './components/Section2ChemLab';
import Section3AthenaChase from './components/Section3AthenaChase';
import FinalScene from './components/FinalScene';
import HUD from './components/HUD';

export const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>('TITLE');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sectionKey, setSectionKey] = useState<number>(0);

  // Synchronize BGM tracks with the game stages:
  // - Intro & Story Cutscene: Spooky, mysterious music
  // - Game Levels (Sections 1, 2, 3): Really scary horror music
  // - Final Scene: Cheesy romantic love ballad music
  useEffect(() => {
    if (stage === 'TITLE' || stage === 'INTRO_CUTSCENE') {
      sound.playBGM('SPOOKY_MYSTERY');
    } else if (stage === 'SECTION_1' || stage === 'SECTION_2' || stage === 'SECTION_3') {
      sound.playBGM('REALLY_SCARY');
    } else if (stage === 'FINAL_CUTSCENE' || stage === 'VICTORY') {
      sound.playBGM('CHEESY_ROMANTIC');
    }
  }, [stage]);

  // Ensure AudioContext resumes upon first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      sound.initCtx();
      if (stage === 'TITLE') {
        sound.playBGM('SPOOKY_MYSTERY');
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [stage]);

  const handleStartGame = () => {
    sound.playBlip();
    setStage('INTRO_CUTSCENE');
  };

  const handleCompleteIntro = () => {
    sound.playBlip();
    setStage('SECTION_1');
  };

  const handleCompleteSection1 = () => {
    sound.playLevelClear();
    setStage('SECTION_2');
  };

  const handleCompleteSection2 = () => {
    sound.playLevelClear();
    setStage('SECTION_3');
  };

  const handleCompleteSection3 = () => {
    sound.playVictory();
    setStage('FINAL_CUTSCENE');
  };

  const handleRestartSection = () => {
    sound.playBlip();
    setSectionKey((prev) => prev + 1);
  };

  const handleRestartGame = () => {
    sound.playBlip();
    setSectionKey(0);
    setStage('TITLE');
  };

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="relative min-h-dvh w-full bg-[#090e1a] text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-vt323">
      
      {/* Background Architectural Aesthetic: Park Science Science Atrium (Photo Resemblance) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between overflow-hidden">
        {/* Upper Mezzanine Balcony & Cable Railings */}
        <div className="w-full h-28 bg-[#f8fafc] border-b-4 border-[#94a3b8] flex flex-col justify-around px-8 relative">
          <div className="w-full h-0.5 bg-slate-400"></div>
          <div className="w-full h-0.5 bg-slate-400"></div>
          <div className="w-full h-0.5 bg-slate-400"></div>
          {/* Green Pod Chairs */}
          <div className="absolute top-4 left-20 w-10 h-10 rounded-full bg-[#65a30d]"></div>
          <div className="absolute top-4 left-64 w-10 h-10 rounded-full bg-[#65a30d]"></div>
          <div className="absolute top-4 right-32 w-10 h-10 rounded-full bg-[#65a30d]"></div>
          {/* Halloween Cobwebs */}
          <div className="absolute top-16 left-8 text-2xl text-slate-300">🕸️</div>
          <div className="absolute top-16 right-8 text-2xl text-slate-300">🕸️</div>
        </div>

        {/* Tall Windows and White Columns on flanks */}
        <div className="w-full flex-1 flex justify-between px-12 relative">
          {/* Left White Pillar */}
          <div className="w-10 h-full bg-[#f8fafc] shadow-2xl"></div>
          {/* Left Tall Window with dark green frame */}
          <div className="w-36 h-3/4 border-4 border-[#14532d] bg-[#030712] rounded flex flex-col justify-around p-2 my-auto">
            <div className="w-full h-0.5 bg-[#166534]"></div>
            <div className="w-full h-0.5 bg-[#166534]"></div>
          </div>
          {/* Right Tall Window with dark green frame */}
          <div className="w-36 h-3/4 border-4 border-[#14532d] bg-[#030712] rounded flex flex-col justify-around p-2 my-auto">
            <div className="w-full h-0.5 bg-[#166534]"></div>
            <div className="w-full h-0.5 bg-[#166534]"></div>
          </div>
          {/* Right White Pillar */}
          <div className="w-10 h-full bg-[#f8fafc] shadow-2xl"></div>
        </div>

        {/* Lower Polished Floor */}
        <div className="w-full h-20 bg-[#94a3b8] border-t-2 border-slate-300"></div>
      </div>

      {/* CRT Scanline & Ambient Overlay */}
      <div className="crt-overlay pointer-events-none fixed inset-0 z-40 opacity-15"></div>

      {/* Main Arcade Cabinet / Game Stage Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-3">
        
        {/* Title Screen: Clean Title, Subtitle, and Start Button */}
        {stage === 'TITLE' && (
          <div className="w-full flex items-center justify-center">
            <StartScreen onStart={handleStartGame} />
          </div>
        )}

        {/* Intro Cutscene */}
        {stage === 'INTRO_CUTSCENE' && (
          <div className="w-full flex items-center justify-center">
            <IntroCutscene onComplete={handleCompleteIntro} />
          </div>
        )}

        {/* Playable Game Sections */}
        {(stage === 'SECTION_1' || stage === 'SECTION_2' || stage === 'SECTION_3') && (
          <div className="w-full flex flex-col items-center gap-2">
            <HUD
              stage={stage}
              onRestartSection={handleRestartSection}
              onRestartGame={handleRestartGame}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
            />

            {/* Section 1: First Floor Exploration */}
            {stage === 'SECTION_1' && (
              <Section1Floor
                key={`sec1-${sectionKey}`}
                onComplete={handleCompleteSection1}
              />
            )}

            {/* Section 2: Second Floor Chemistry Lab Platforming */}
            {stage === 'SECTION_2' && (
              <Section2ChemLab
                key={`sec2-${sectionKey}`}
                onComplete={handleCompleteSection2}
              />
            )}

            {/* Section 3: Third Floor Athena Chase */}
            {stage === 'SECTION_3' && (
              <Section3AthenaChase
                key={`sec3-${sectionKey}`}
                onComplete={handleCompleteSection3}
              />
            )}

            {/* Footer Lore Indicator */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 font-retro px-1">
              <span>🎃 PARK SCIENCE BUILDING • BRYN MAWR COLLEGE</span>
              <span className="text-[#84cc16]">BEN IN RED HAVERFORD HOODIE</span>
            </div>
          </div>
        )}

        {/* Final Scene & Victory Screen */}
        {(stage === 'FINAL_CUTSCENE' || stage === 'VICTORY') && (
          <div className="w-full flex items-center justify-center">
            <FinalScene onRestart={handleRestartGame} />
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
