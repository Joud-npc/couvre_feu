import { GAME_CONFIG } from '../config/GameConfig.js';

const LEVEL_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,0,1,1,0,1,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export function isWalkable(tileX, tileY) {
    if (tileY < 0 || tileY >= LEVEL_MAP.length ||
        tileX < 0 || tileX >= LEVEL_MAP[0].length) {
        return false;
    }
    return LEVEL_MAP[tileY][tileX] === 0;
}

export function createMaze(scene) {
    const walls = scene.physics.add.staticGroup();
    const tileSize = GAME_CONFIG.tileSize;

    for (let row = 0; row < LEVEL_MAP.length; row++) {
        for (let col = 0; col < LEVEL_MAP[0].length; col++) {
            if (LEVEL_MAP[row][col] === 1) {
                const x = col * tileSize + tileSize / 2;
                const y = row * tileSize + tileSize / 2;

                const wall = scene.add.rectangle(
                    x,
                    y,
                    tileSize,
                    tileSize,
                    GAME_CONFIG.colors.wall
                );

                scene.physics.add.existing(wall, true);
                walls.add(wall);
            }
        }
    }

    return { walls };
}