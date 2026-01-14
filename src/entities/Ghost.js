import { GAME_CONFIG, DIRECTIONS } from '../config/GameConfig.js';
import { getTileCoord, getPixelCoord, isAlignedToGrid } from '../utils/gridUtils.js';
import { isWalkable } from '../map/level1.js';

export class Ghost {

    static preload(scene) {
        scene.load.image('soldier_down_left', 'assets/images/images_ghost/spr_soldier_down_left.png');
        scene.load.image('soldier_down_mid', 'assets/images/images_ghost/spr_soldier_down_mid.png');
        scene.load.image('soldier_down_right', 'assets/images/images_ghost/spr_soldier_down_right.png');

        scene.load.image('soldier_up_left', 'assets/images/images_ghost/spr_soldier_up_left.png');
        scene.load.image('soldier_up_mid', 'assets/images/images_ghost/spr_soldier_up_mid.png');
        scene.load.image('soldier_up_right', 'assets/images/images_ghost/spr_soldier_up_right.png');

        scene.load.image('soldier_left_1', 'assets/images/images_ghost/spr_soldier_left.png');
        scene.load.image('soldier_left_2', 'assets/images/images_ghost/spr_soldier_left_2.png');

        scene.load.image('soldier_right_1', 'assets/images/images_ghost/spr_soldier_right.png');
        scene.load.image('soldier_right_2', 'assets/images/images_ghost/spr_soldier_right_2.png');
    }

    static createAnimations(scene) {
        if (scene.anims.exists('soldier-walk-down')) return;

        scene.anims.create({
            key: 'soldier-walk-down',
            frames: [
                { key: 'soldier_down_left' },
                { key: 'soldier_down_mid' },
                { key: 'soldier_down_right' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier-walk-up',
            frames: [
                { key: 'soldier_up_left' },
                { key: 'soldier_up_mid' },
                { key: 'soldier_up_right' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier-walk-left',
            frames: [
                { key: 'soldier_left_1' },
                { key: 'soldier_left_2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier-walk-right',
            frames: [
                { key: 'soldier_right_1' },
                { key: 'soldier_right_2' }
            ],
            frameRate: 8,
            repeat: -1
        });
    }

    constructor(scene, startTileX, startTileY, colorIndex, name) {
        this.scene = scene;
        this.name = name;
        this.size = GAME_CONFIG.ghost.size;
        this.speed = GAME_CONFIG.moveSpeed * GAME_CONFIG.ghost.baseSpeed;
        this.updateTimer = 0;
        this.currentDirection = DIRECTIONS.NONE;

        const startX = getPixelCoord(startTileX);
        const startY = getPixelCoord(startTileY);

        this.sprite = scene.physics.add.sprite(startX, startY, 'soldier_down_mid');
        this.sprite.setDisplaySize(40, 40);
        this.sprite.body.setSize(24, 24, true);
        this.sprite.body.setOffset(8, 8);
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

        // Animation
        let animKey = null;
        const velX = this.currentDirection.x * this.speed;
        const velY = this.currentDirection.y * this.speed;

        if (velY > 0) animKey = 'soldier-walk-down';
        else if (velY < 0) animKey = 'soldier-walk-up';
        else if (velX < 0) animKey = 'soldier-walk-left';
        else if (velX > 0) animKey = 'soldier-walk-right';

        if (!animKey) {
            this.sprite.anims.stop();
        } else if (this.sprite.anims.currentAnim?.key !== animKey) {
            this.sprite.anims.play(animKey);
        }
    }

    getSprite() {
        return this.sprite;
    }
}