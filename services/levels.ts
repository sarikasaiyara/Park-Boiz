/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig } from '../types';

// 20 columns x 13 rows grid
// 1 = Solid wall, 0 = Walkable floor
// Map 1: Park Science Building Basement
const BASEMENT_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // (18, 1) Exit Stairs
  [1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1], // (2, 2) STACK
  [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1], // (10, 6) QUEUE
  [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // (1, 11) Ben start, (18, 11) LINKED LIST
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Map 2: Park Science Building 3rd Floor (Math & CS Hall)
const THIRD_FLOOR_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1], // (10, 2) GRAPH, (18, 2) Mateo
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1], // (3, 3) BINARY TREE
  [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // (12, 10) HASH TABLE
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // (1, 11) Ben start
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'LEVEL 1: BASEMENT',
    floorName: 'Park Science Sub-Level B',
    description: 'Ben arrives via Haverford Shuttle. Collect 3 Data Structure notes from the server tunnels to unlock the emergency staircase to the upper floors.',
    gridCols: 20,
    gridRows: 13,
    tileSize: 40,
    walls: BASEMENT_MAP,
    playerStart: { x: 1, y: 11 },
    exitCoord: { x: 18, y: 1 },
    items: [
      {
        id: 'l1-stack',
        name: 'STACK',
        tagline: 'LIFO Notes (Last-In First-Out)',
        x: 2,
        y: 2,
        collected: false,
        color: '#ff7700', // Neon orange
      },
      {
        id: 'l1-queue',
        name: 'QUEUE',
        tagline: 'FIFO Cold Brew Queue',
        x: 10,
        y: 6,
        collected: false,
        color: '#00e5ff', // Neon cyan
      },
      {
        id: 'l1-linked-list',
        name: 'LINKED LIST',
        tagline: 'Node-to-Node Lab Pointers',
        x: 18,
        y: 11,
        collected: false,
        color: '#39ff14', // Neon slime green
      },
    ],
    ghosts: [
      {
        gridX: 6,
        gridY: 1,
        axis: 'X',
        distanceTiles: 4,
        speed: 85,
        color: '#c084fc',
      },
      {
        gridX: 14,
        gridY: 3,
        axis: 'Y',
        distanceTiles: 4,
        speed: 95,
        color: '#e879f9',
      },
      {
        gridX: 7,
        gridY: 9,
        axis: 'X',
        distanceTiles: 5,
        speed: 110,
        color: '#a855f7',
      },
    ],
    shadows: [
      {
        gridX: 8,
        gridY: 4,
        rangeX: 3,
        rangeY: 2,
        speed: 60,
      },
    ],
    lasers: [
      {
        startGrid: { x: 3, y: 3 },
        endGrid: { x: 6, y: 3 },
        cycleTime: 3200,
        initialOffset: 0,
      },
      {
        startGrid: { x: 16, y: 2 },
        endGrid: { x: 16, y: 5 },
        cycleTime: 2800,
        initialOffset: 1200,
      },
    ],
  },
  {
    id: 2,
    title: 'LEVEL 2: 3RD FLOOR',
    floorName: 'Park Science 3rd Floor (Math & CS Wing)',
    description: 'Mateo is holed up in the Computer Lab alcove! Collect 3 advanced Data Structure study guides to disable the campus security lockdown and reach him.',
    gridCols: 20,
    gridRows: 13,
    tileSize: 40,
    walls: THIRD_FLOOR_MAP,
    playerStart: { x: 1, y: 11 },
    exitCoord: { x: 18, y: 2 }, // Mateo's location
    items: [
      {
        id: 'l2-tree',
        name: 'BINARY TREE',
        tagline: 'Balanced Red-Black BST Sheet',
        x: 3,
        y: 3,
        collected: false,
        color: '#ff007f', // Neon magenta
      },
      {
        id: 'l2-graph',
        name: 'GRAPH',
        tagline: 'Spooky Adjacency BFS Matrix',
        x: 10,
        y: 2,
        collected: false,
        color: '#00e5ff', // Neon cyan
      },
      {
        id: 'l2-hashtable',
        name: 'HASH TABLE',
        tagline: 'O(1) Collision-Free Buckets',
        x: 12,
        y: 10,
        collected: false,
        color: '#facc15', // Neon gold
      },
    ],
    ghosts: [
      {
        gridX: 2,
        gridY: 5,
        axis: 'X',
        distanceTiles: 4,
        speed: 105,
        color: '#c084fc',
      },
      {
        gridX: 10,
        gridY: 4,
        axis: 'Y',
        distanceTiles: 4,
        speed: 115,
        color: '#f43f5e',
      },
      {
        gridX: 14,
        gridY: 5,
        axis: 'X',
        distanceTiles: 4,
        speed: 120,
        color: '#a855f7',
      },
    ],
    shadows: [
      {
        gridX: 4,
        gridY: 9,
        rangeX: 2,
        rangeY: 2,
        speed: 70,
      },
      {
        gridX: 15,
        gridY: 8,
        rangeX: 2,
        rangeY: 2,
        speed: 75,
      },
    ],
    lasers: [
      {
        startGrid: { x: 7, y: 1 },
        endGrid: { x: 7, y: 4 },
        cycleTime: 2900,
        initialOffset: 600,
      },
      {
        startGrid: { x: 14, y: 3 },
        endGrid: { x: 18, y: 3 },
        cycleTime: 3400,
        initialOffset: 1600,
      },
    ],
  },
];
