/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStage =
  | 'TITLE'
  | 'INTRO_CUTSCENE'
  | 'SECTION_1'
  | 'SECTION_2'
  | 'SECTION_2_TRANSITION'
  | 'SECTION_3'
  | 'FINAL_CUTSCENE'
  | 'VICTORY';

export interface Position {
  x: number;
  y: number;
}

export interface CostumeNPC {
  id: string;
  name: string;
  costume: string;
  x: number; // in pixels
  y: number;
  dialogue: string[];
  color: string;
  accessory: string;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  isMoving?: boolean;
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface AcidPool {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FallingEquipment {
  x: number;
  y: number;
  initialY: number;
  vy: number;
  warningTimer: number; // seconds before dropping
  isFalling: boolean;
  hasLanded: boolean;
  radius: number;
  type: 'FLASK' | 'BEAKER' | 'BOOK';
}

export interface RollingHazard {
  x: number;
  y: number;
  vx: number;
  radius: number;
}

export interface SwitchPlate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActivated: boolean;
  linkedDoorOrBridgeId: string;
  label: string;
}

export interface HangingChain {
  x: number;
  topY: number;
  length: number;
}

export interface Ladder {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Checkpoint {
  id: number;
  x: number;
  y: number;
  isReached: boolean;
  label: string;
}