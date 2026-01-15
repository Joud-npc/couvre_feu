import { GAME_CONFIG } from '../config/GameConfig.js';
import { EASTER_EGG_MAP, EASTER_EGG_CHANCE } from './easterEggMap.js';

let LEVEL_MAP = [];
let PORTAL_POSITIONS = [];

function generateMaze(width, height) {
    const maze = Array(height).fill(null).map(() => Array(width).fill(0));

    for (let x = 0; x < width; x++) {
        maze[0][x] = 1;
        maze[height - 1][x] = 1;
    }
    for (let y = 0; y < height; y++) {
        maze[y][0] = 1;
        maze[y][width - 1] = 1;
    }

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

function findPortalPositions(width, height) {
    const sides = ['top', 'bottom', 'left', 'right'];
    const randomSide = sides[Math.floor(Math.random() * sides.length)];

    let x, y;
    let attempts = 0;

    do {
        switch(randomSide) {
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
        return [{ x, y, side: randomSide }];
    }

    return [{ x: Math.floor(width / 2), y: 1, side: 'top' }];
}

function analyzeWallGroups() {
    const height = LEVEL_MAP.length;
    const width = LEVEL_MAP[0].length;
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));
    const wallGroups = [];

    function floodFill(startY, startX) {
        const stack = [{y: startY, x: startX}];
        const group = [];

        while (stack.length > 0) {
            const {y, x} = stack.pop();

            if (y < 0 || y >= height || x < 0 || x >= width) continue;
            if (visited[y][x] || LEVEL_MAP[y][x] !== 1) continue;

            visited[y][x] = true;
            group.push({y, x});

            stack.push({y: y - 1, x});
            stack.push({y: y + 1, x});
            stack.push({y, x: x - 1});
            stack.push({y, x: x + 1});
        }

        return group;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (LEVEL_MAP[y][x] === 1 && !visited[y][x]) {
                const group = floodFill(y, x);
                if (group.length > 0) {
                    wallGroups.push(group);
                }
            }
        }
    }

    return wallGroups;
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
    const portals = scene.physics.add.staticGroup();
    const tileSize = GAME_CONFIG.tileSize;

    const wallGroups = analyzeWallGroups();
    const processedPositions = new Set();

    wallGroups.forEach(group => {
        const groupSize = group.length;

        // 🆕 Seulement les groupes de 2 blocs deviennent des voitures (horizontales uniquement)
        if (groupSize === 2) {
            const sortedGroup = [...group].sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);

            // Vérifier si les 2 blocs sont horizontaux
            const isHorizontal = sortedGroup[0].y === sortedGroup[1].y &&
                sortedGroup[1].x === sortedGroup[0].x + 1;

            if (isHorizontal) {
                // Créer une voiture horizontale
                const {y, x} = sortedGroup[0];
                processedPositions.add(`${y},${x}`);
                processedPositions.add(`${y},${x+1}`);

                const pixelX = x * tileSize + tileSize;
                const pixelY = y * tileSize + tileSize / 2;

                const wall = scene.add.sprite(pixelX, pixelY, 'car');
                wall.setDisplaySize(tileSize * 2, tileSize);

                scene.physics.add.existing(wall, true);
                walls.add(wall);
            } else {
                // Si les 2 blocs ne sont pas horizontaux, les mettre en mur
                sortedGroup.forEach(({y, x}) => {
                    const posKey = `${y},${x}`;
                    if (processedPositions.has(posKey)) return;
                    processedPositions.add(posKey);

                    const pixelX = x * tileSize + tileSize / 2;
                    const pixelY = y * tileSize + tileSize / 2;

                    const wall = scene.add.sprite(pixelX, pixelY, 'wall');
                    wall.setDisplaySize(tileSize, tileSize);

                    scene.physics.add.existing(wall, true);
                    walls.add(wall);
                });
            }
        }
        // Tous les autres groupes (1, 3, 4+) : tout en mur
        else {
            group.forEach(({y, x}) => {
                const posKey = `${y},${x}`;
                if (processedPositions.has(posKey)) return;
                processedPositions.add(posKey);

                const pixelX = x * tileSize + tileSize / 2;
                const pixelY = y * tileSize + tileSize / 2;

                const wall = scene.add.sprite(pixelX, pixelY, 'wall');
                wall.setDisplaySize(tileSize, tileSize);

                scene.physics.add.existing(wall, true);
                walls.add(wall);
            });
        }
    });

    PORTAL_POSITIONS.forEach(portal => {
        const x = portal.x * tileSize + tileSize / 2;
        const y = portal.y * tileSize + tileSize / 2;

        const portalRect = scene.add.rectangle(
            x,
            y,
            tileSize,
            tileSize,
            0xFFD700
        );

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