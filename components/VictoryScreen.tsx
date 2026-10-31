/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import RetroButton from './RetroButton';

interface VictoryScreenProps {
  totalAttempts: number;
  onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  totalAttempts,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-[#180a2b] border-4 border-[#ff7700] shadow-[0_0_40px_rgba(255,119,0,0.6)] p-6 md:p-8 rounded-lg flex flex-col items-center text-center gap-5 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Animated Celebration Banner */}
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🎃</span>
          <span className="text-3xl animate-bounce delay-100">💻</span>
          <span className="text-3xl animate-bounce delay-200">🎉</span>
        </div>

        {/* Required Win Message */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-[#ff7700]/20 border border-[#ff7700] text-[#ff7700] font-retro text-[10px] tracking-widest rounded uppercase">
            PARK SCIENCE MISSION ACCOMPLISHED
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-retro text-[#38bdf8] leading-snug tracking-tight">
            Mateo Found!
          </h1>
          <div className="text-xl md:text-2xl font-retro text-[#facc15] retro-text-glow leading-snug">
            Data Structures Midterm: Maybe Survivable.
          </div>
        </div>

        {/* Graphic depicting Ben & Mateo together */}
        <div className="w-full bg-[#0e051c] border-2 border-[#581c87] rounded-lg p-4 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-6 py-2">
            {/* Ben */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#18181b] border-2 border-[#dc2626] flex items-center justify-center text-2xl relative shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                🧣
                <span className="absolute -top-2 bg-[#dc2626] text-white text-[8px] font-retro px-1 rounded">BEN</span>
              </div>
              <span className="font-retro text-[9px] text-[#38bdf8] mt-1">HAVERFORD</span>
            </div>

            <div className="text-2xl font-retro text-[#ff7700]">🤝</div>

            {/* Mateo */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#37204e] border-2 border-[#00e5ff] flex items-center justify-center text-2xl relative shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                👓
                <span className="absolute -top-2 bg-[#00e5ff] text-black text-[8px] font-retro px-1 rounded">MATEO</span>
              </div>
              <span className="font-retro text-[9px] text-[#00e5ff] mt-1">RESCUED</span>
            </div>
          </div>

          <p className="font-vt323 text-base md:text-lg text-gray-300 leading-tight">
            &quot;Ben! You actually braved the Park Science basement ghosts and security lasers for my notes?!
            We have STACK, QUEUE, LINKED LIST, BINARY TREE, GRAPH, and HASH TABLE! We might actually pass tomorrow!&quot;
          </p>
        </div>

        {/* Data Structures Mastered Checklist */}
        <div className="w-full bg-[#0d041a] border border-[#581c87] p-3 rounded text-left font-retro text-[10px] space-y-1.5">
          <div className="text-[#a855f7] border-b border-[#581c87] pb-1 uppercase tracking-wider">
            STUDY GUIDES RECOVERED (6/6):
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="text-[#ff7700]">✓ [STACK] LIFO Panic</div>
            <div className="text-[#ff007f]">✓ [TREE] Red-Black BST</div>
            <div className="text-[#00e5ff]">✓ [QUEUE] Cold Brew FIFO</div>
            <div className="text-[#38bdf8]">✓ [GRAPH] Spooky BFS</div>
            <div className="text-[#39ff14]">✓ [LIST] Node Pointers</div>
            <div className="text-[#facc15]">✓ [HASH] O(1) Zero-Collision</div>
          </div>
          <div className="pt-2 border-t border-[#581c87] flex justify-between text-gray-300">
            <span>TOTAL ATTEMPTS:</span>
            <span className="text-[#39ff14] font-bold">{totalAttempts} (Midterm Ready)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          <RetroButton
            onClick={onRestart}
            variant="primary"
            className="w-full text-sm md:text-base py-4 !bg-[#ff7700] !border-white !text-black hover:!bg-[#ea580c] shadow-[0_0_20px_rgba(255,119,0,0.6)]"
          >
            PLAY AGAIN (RESTART MISSION)
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
