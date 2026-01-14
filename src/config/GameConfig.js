export const GAME_CONFIG = {
    width: 1600,  // 32 tiles × 50 = 1600 (au lieu de 1500)
    height: 800,  // 16 tiles × 50 = 800 ✅
    tileSize: 50,
    moveSpeed: 120,
    ernest: {
        size: 18,
        color: 0xffff00
    },
    ghost: {
        size: 16,
        baseSpeed: 0.75,
        updateInterval: 500
    },
    colors: {
        wall: 0x0000ff,
        background: 0x000000,
        ghosts: [0xff0000, 0xff00ff, 0x00ffff, 0xffb852]
    }
};

export const GHOST_NAMES = ['Blinky', 'Pinky', 'Inky', 'Clyde'];

export const GHOST_START_POSITIONS = [
    {x: 14, y: 1},
    {x: 1, y: 11},
    {x: 14, y: 11},
    {x: 7, y: 6}
];

export const DIRECTIONS = {
    NONE: { x: 0, y: 0 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 }
};