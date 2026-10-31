/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  const [sectionKey, setSectionKey] = useState<number>(0); // Used to force-restart current section cleanly

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
    <div className="relative min-h-dvh w-full bg-[#070111] text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none font-vt323">
      {/* CRT Scanline & Ambient Overlay */}
      <div className="crt-overlay pointer-events-none fixed inset-0 z-40 opacity-20"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-3">
        
        {/* Title Screen */}
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
            <div className="w-full flex items-center justify-between text-xs text-gray-500 font-retro px-1">
              <span>🎃 PARK SCIENCE BUILDING • BRYN MAWR COLLEGE</span>
              <span>BEN IN RED HAVERFORD HOODIE</span>
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
