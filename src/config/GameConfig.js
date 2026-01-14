export const GAME_CONFIG = {
    width: 800,
    height: 650,
    tileSize: 50,
    moveSpeed: 120, // Réduit pour un meilleur contrôle
    ernest: {
        size: 18, // Réduit de 22 à 1
        color: 0xffff00
    },
    ghost: {
        size: 16, // Réduit de 18 à 16
        baseSpeed: 0.75, // 75% de la vitesse de ernest
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