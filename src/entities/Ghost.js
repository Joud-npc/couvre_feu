import { GAME_CONFIG, DIRECTIONS } from '../config/GameConfig.js';
import { getTileCoord, getPixelCoord, isAlignedToGrid } from '../utils/gridUtils.js';
import { isWalkable } from '../map/level1.js';

export class Ghost {
    constructor(scene, startTileX, startTileY, colorIndex, name) {
        this.scene = scene;
        this.name = name;
        this.size = GAME_CONFIG.ghost.size;
        this.speed = GAME_CONFIG.moveSpeed * GAME_CONFIG.ghost.baseSpeed;
        this.updateTimer = 0;
        this.currentDirection = DIRECTIONS.NONE;

        const startX = getPixelCoord(startTileX);
        const startY = getPixelCoord(startTileY);

        this.sprite = scene.physics.add.sprite(startX, startY, `ghost${colorIndex}`);
        this.sprite.setSize(GAME_CONFIG.tileSize * 0.6, GAME_CONFIG.tileSize * 0.6);
        this.sprite.setDisplaySize(GAME_CONFIG.tileSize * 0.8, GAME_CONFIG.tileSize * 0.8);
    }

    static preload(scene) {
        GAME_CONFIG.colors.ghosts.forEach((color, index) => {
            const graphics = scene.add.graphics();
            const size = GAME_CONFIG.ghost.size;

            // Corps du fantôme
            graphics.fillStyle(color);
            graphics.fillCircle(size, size, size);

            // Base ondulée
            graphics.beginPath();
            graphics.moveTo(size - size, size);
            for (let i = 0; i <= 4; i++) {
                const x = size - size + (i * size / 2);
                const y = size + (i % 2 === 0 ? size / 3 : 0);
                graphics.lineTo(x, y);
            }
            graphics.lineTo(size + size, size);
            graphics.closePath();
            graphics.fillPath();

            // Yeux blancs
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(size - 6, size - 4, 5);
            graphics.fillCircle(size + 6, size - 4, 5);

            // Pupilles
            graphics.fillStyle(0x000000);
            graphics.fillCircle(size - 6, size - 4, 3);
            graphics.fillCircle(size + 6, size - 4, 3);

            graphics.generateTexture(`ghost${index}`, size * 2, size * 2);
            graphics.destroy();
        });
    }

    update(delta, ernestTileX, ernestTileY) {
        this.updateTimer += delta;

        const tileX = getTileCoord(this.sprite.x);
        const tileY = getTileCoord(this.sprite.y);
        const alignedX = isAlignedToGrid(this.sprite.x);
        const alignedY = isAlignedToGrid(this.sprite.y);

        if (alignedX && alignedY && this.updateTimer > GAME_CONFIG.ghost.updateInterval) {
            this.updateTimer = 0;

            const dx = ernestTileX - tileX;
            const dy = ernestTileY - tileY;

            let possibleDirections = [];

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && isWalkable(tileX + 1, tileY)) {
                    possibleDirections.push(DIRECTIONS.RIGHT);
                }
                if (dx < 0 && isWalkable(tileX - 1, tileY)) {
                    possibleDirections.push(DIRECTIONS.LEFT);
                }
                if (dy > 0 && isWalkable(tileX, tileY + 1)) {
                    possibleDirections.push(DIRECTIONS.DOWN);
                }
                if (dy < 0 && isWalkable(tileX, tileY - 1)) {
                    possibleDirections.push(DIRECTIONS.UP);
                }
            } else {
                if (dy > 0 && isWalkable(tileX, tileY + 1)) {
                    possibleDirections.push(DIRECTIONS.DOWN);
                }
                if (dy < 0 && isWalkable(tileX, tileY - 1)) {
                    possibleDirections.push(DIRECTIONS.UP);
                }
                if (dx > 0 && isWalkable(tileX + 1, tileY)) {
                    possibleDirections.push(DIRECTIONS.RIGHT);
                }
                if (dx < 0 && isWalkable(tileX - 1, tileY)) {
                    possibleDirections.push(DIRECTIONS.LEFT);
                }
            }

            if (possibleDirections.length === 0) {
                if (isWalkable(tileX + 1, tileY)) possibleDirections.push(DIRECTIONS.RIGHT);
                if (isWalkable(tileX - 1, tileY)) possibleDirections.push(DIRECTIONS.LEFT);
                if (isWalkable(tileX, tileY + 1)) possibleDirections.push(DIRECTIONS.DOWN);
                if (isWalkable(tileX, tileY - 1)) possibleDirections.push(DIRECTIONS.UP);
            }

            if (possibleDirections.length > 0) {
                this.currentDirection = possibleDirections[0];
            }
        }

        this.sprite.setVelocity(
            this.currentDirection.x * this.speed,
            this.currentDirection.y * this.speed
        );
    }

    getSprite() {
        return this.sprite;
    }
}