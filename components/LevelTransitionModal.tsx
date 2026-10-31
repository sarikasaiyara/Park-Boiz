/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import RetroButton from './RetroButton';

interface LevelTransitionModalProps {
  onContinue: () => void;
  attempts: number;
}

export const LevelTransitionModal: React.FC<LevelTransitionModalProps> = ({
  onContinue,
  attempts,
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#1b0b30] border-4 border-[#39ff14] shadow-[0_0_35px_rgba(57,255,20,0.5)] p-6 md:p-8 rounded-lg flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#39ff14]/20 border-2 border-[#39ff14] flex items-center justify-center text-3xl">
          🪜
        </div>

        <div>
          <span className="px-3 py-1 bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14] font-retro text-[10px] uppercase tracking-widest rounded">
            LEVEL 1 COMPLETED
          </span>
          <h2 className="text-2xl md:text-3xl font-retro text-[#39ff14] mt-3 tracking-wide leading-tight">
            Basement cleared — take the stairs!
          </h2>
        </div>

        <p className="font-vt323 text-lg md:text-xl text-[#d8b4fe] leading-snug max-w-md">
          Ben sprinted through the subterranean server tunnels, secured the foundational
          notes (<span className="text-[#ff7700]">STACK</span>, <span className="text-[#00e5ff]">QUEUE</span>, <span className="text-[#39ff14]">LINKED LIST</span>), and reached the emergency stairwell!
        </p>

        <div className="w-full bg-[#0d041a] border border-[#581c87] p-3 rounded text-left font-retro text-xs space-y-1">
          <div className="text-[#a855f7]">FLOOR 1 STATS:</div>
          <div className="text-white flex justify-between">
            <span>STUDY ITEMS:</span> <span className="text-[#39ff14]">3 / 3 COLLECTED</span>
          </div>
          <div className="text-white flex justify-between">
            <span>FLOOR ATTEMPTS:</span> <span className="text-[#facc15]">{attempts}</span>
          </div>
          <div className="text-white flex justify-between">
            <span>NEXT DESTINATION:</span> <span className="text-[#00e5ff]">3RD FLOOR MATH & CS</span>
          </div>
        </div>

        <div className="w-full pt-2">
          <RetroButton
            onClick={onContinue}
            variant="accent"
            className="w-full text-sm md:text-base py-4 !bg-[#39ff14] !border-white !text-black hover:!bg-[#22c55e] shadow-[0_0_20px_rgba(57,255,20,0.6)]"
          >
            ASCEND TO 3RD FLOOR →
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default LevelTransitionModal;
