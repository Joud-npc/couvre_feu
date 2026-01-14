import { GAME_CONFIG } from '../config/GameConfig.js';
import { EASTER_EGG_MAP, EASTER_EGG_CHANCE } from './easterEggMap.js';

let LEVEL_MAP = [];
let PORTAL_POSITIONS = []; // Nouvelles positions des portails

// Génération style Pac-Man classique avec des couloirs et des intersections
function generateMaze(width, height) {
    const maze = Array(height).fill(null).map(() => Array(width).fill(0));

    // Ajouter les bordures
    for (let x = 0; x < width; x++) {
        maze[0][x] = 1;
        maze[height - 1][x] = 1;
    }
    for (let y = 0; y < height; y++) {
        maze[y][0] = 1;
        maze[y][width - 1] = 1;
    }

    // Créer une grille de petits obstacles réguliers (style Pac-Man)
    for (let y = 2; y < height - 2; y += 3) {
        for (let x = 2; x < width - 2; x += 3) {
            if (Math.random() < 0.9) {
                const obstacleType = Math.floor(Math.random() * 4);

                switch(obstacleType) {
                    case 0:
                        maze[y][x] = 1;
                        break;
                    case 1:
                        maze[y][x] = 1;
                        if (x + 1 < width - 1) maze[y][x + 1] = 1;
                        break;
                    case 2:
                        maze[y][x] = 1;
                        if (y + 1 < height - 1) maze[y + 1][x] = 1;
                        break;
                    case 3:
                        maze[y][x] = 1;
                        if (x + 1 < width - 1) maze[y][x + 1] = 1;
                        if (y + 1 < height - 1) maze[y + 1][x] = 1;
                        if (x + 1 < width - 1 && y + 1 < height - 1) maze[y + 1][x + 1] = 1;
                        break;
                }
            }
        }
    }

    const extraObstacles = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < extraObstacles; i++) {
        const x = Math.floor(Math.random() * (width - 4)) + 2;
        const y = Math.floor(Math.random() * (height - 4)) + 2;

        maze[y][x] = 1;
        if (Math.random() < 0.5 && x + 1 < width - 1) {
            maze[y][x + 1] = 1;
        }
    }

    for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
            const wallCount = [
                maze[y-1][x], maze[y+1][x],
                maze[y][x-1], maze[y][x+1]
            ].filter(v => v === 1).length;

            if (wallCount > 2 && maze[y][x] === 1) {
                if (Math.random() < 0.6) {
                    maze[y][x] = 0;
                }
            }
        }
    }

    return maze;
}

// 🚪 Trouver des positions pour les portails sur les bords
function findPortalPositions(width, height) {
    const portals = [];
    const sides = ['top', 'bottom', 'left', 'right'];

    sides.forEach(side => {
        let x, y;
        let attempts = 0;

        do {
            switch(side) {
                case 'top':
                    x = Math.floor(Math.random() * (width - 4)) + 2;
                    y = 1;
                    break;
                case 'bottom':
                    x = Math.floor(Math.random() * (width - 4)) + 2;
                    y = height - 2;
                    break;
                case 'left':
                    x = 1;
                    y = Math.floor(Math.random() * (height - 4)) + 2;
                    break;
                case 'right':
                    x = width - 2;
                    y = Math.floor(Math.random() * (height - 4)) + 2;
                    break;
            }
            attempts++;
        } while (LEVEL_MAP[y][x] === 1 && attempts < 50);

        if (LEVEL_MAP[y][x] === 0) {
            portals.push({ x, y, side });
        }
    });

    return portals;
}

export function findValidSpawnPosition(avoidX, avoidY, minDistance = 5) {
    const attempts = 200;

    for (let i = 0; i < attempts; i++) {
        const x = Math.floor(Math.random() * (LEVEL_MAP[0].length - 2)) + 1;
        const y = Math.floor(Math.random() * (LEVEL_MAP.length - 2)) + 1;

        if (isWalkable(x, y)) {
            const freeDirs = [
                isWalkable(x + 1, y),
                isWalkable(x - 1, y),
                isWalkable(x, y + 1),
                isWalkable(x, y - 1)
            ].filter(Boolean).length;

            if (freeDirs >= 2) {
                const distance = Math.abs(x - avoidX) + Math.abs(y - avoidY);
                if (distance >= minDistance || avoidX === -1) {
                    return { x, y };
                }
            }
        }
    }

    for (let y = 1; y < LEVEL_MAP.length - 1; y++) {
        for (let x = 1; x < LEVEL_MAP[0].length - 1; x++) {
            if (isWalkable(x, y)) {
                const freeDirs = [
                    isWalkable(x + 1, y),
                    isWalkable(x - 1, y),
                    isWalkable(x, y + 1),
                    isWalkable(x, y - 1)
                ].filter(Boolean).length;

                if (freeDirs >= 1) {
                    return { x, y };
                }
            }
        }
    }

    return { x: 1, y: 1 };
}

export function generateNewLevel() {
    const width = 32;
    const height = 16;

    const isEasterEgg = Math.random() < EASTER_EGG_CHANCE;

    if (isEasterEgg) {
        LEVEL_MAP = EASTER_EGG_MAP.map(row => [...row]);
        console.log('🎉 EASTER EGG! Special map generated!');
    } else {
        LEVEL_MAP = generateMaze(width, height);
    }

    // 🚪 Générer les positions des portails
    PORTAL_POSITIONS = findPortalPositions(width, height);

    return LEVEL_MAP;
}

export function isWalkable(tileX, tileY) {
    if (tileY < 0 || tileY >= LEVEL_MAP.length ||
        tileX < 0 || tileX >= LEVEL_MAP[0].length) {
        return false;
    }
    return LEVEL_MAP[tileY][tileX] === 0;
}

export function createMaze(scene) {
    if (LEVEL_MAP.length === 0) {
        generateNewLevel();
    }

    const walls = scene.physics.add.staticGroup();
    const portals = scene.physics.add.staticGroup(); // 🚪 Nouveau groupe pour les portails
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

    // 🚪 Créer les portails visuels
    PORTAL_POSITIONS.forEach(portal => {
        const x = portal.x * tileSize + tileSize / 2;
        const y = portal.y * tileSize + tileSize / 2;

        const portalRect = scene.add.rectangle(
            x,
            y,
            tileSize,
            tileSize,
            0xFFD700  // Couleur or/jaune pour les portails
        );

        // Ajouter un effet de pulsation
        scene.tweens.add({
            targets: portalRect,
            alpha: { from: 0.6, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        scene.physics.add.existing(portalRect, true);
        portalRect.setData('isPortal', true);
        portalRect.setData('portalData', portal);
        portals.add(portalRect);
    });

    return { walls, portals };
}

export function getCurrentMap() {
    return LEVEL_MAP;
}

export function getPortalPositions() {
    return PORTAL_POSITIONS;
}