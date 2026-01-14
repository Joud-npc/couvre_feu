import { GAME_CONFIG, DIRECTIONS } from '../config/GameConfig.js';
import { getTileCoord, getPixelCoord, isAlignedToGrid } from '../utils/gridUtils.js';
import { isWalkable } from '../map/level1.js';

export class Ernest {
    static preload(scene) {
        scene.load.image('ernest_down_left', 'assets/images/images_ernest/images_ernest/spr_ernest_down_left.png');
        scene.load.image('ernest_down_mid', 'assets/images/images_ernest/spr_ernest_down_mid.png');
        scene.load.image('ernest_down_right', 'assets/images/images_ernest/spr_ernest_down_right.png');

        scene.load.image('ernest_up_left', 'assets/images/images_ernest/spr_ernest_up_left.png');
        scene.load.image('ernest_up_mid', 'assets/images/images_ernest/spr_ernest_up_mid.png');
        scene.load.image('ernest_up_right', 'assets/images/images_ernest/spr_ernest_up_right.png');

        scene.load.image('ernest_left_1', 'assets/images/images_ernest/spr_ernest_left.png');
        scene.load.image('ernest_left_2', 'assets/images/images_ernest/spr_ernest_left_2.png');

        scene.load.image('ernest_right_1', 'assets/images/images_ernest/spr_ernest_right.png');
        scene.load.image('ernest_right_2', 'assets/images/images_ernest/spr_ernest_right_2.png');
    }


    static createAnimations(scene) {
        if (scene.anims.exists('walk-down')) return;

        scene.anims.create({
            key: 'walk-down',
            frames: [
                { key: 'ernest_down_left' },
                { key: 'ernest_down_mid' },
                { key: 'ernest_down_right' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'walk-up',
            frames: [
                { key: 'ernest_up_left' },
                { key: 'ernest_up_mid' },
                { key: 'ernest_up_right' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'walk-left',
            frames: [
                { key: 'ernest_left_1' },
                { key: 'ernest_left_2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'walk-right',
            frames: [
                { key: 'ernest_right_1' },
                { key: 'ernest_right_2' }
            ],
            frameRate: 8,
            repeat: -1
        });
    }

    constructor(scene, tileX, tileY) {
        this.scene = scene;

        const x = getPixelCoord(tileX);
        const y = getPixelCoord(tileY);

        this.sprite = scene.physics.add.sprite(x, y, 'ernest_down_mid');
        this.sprite.setDisplaySize(40, 40);
        this.sprite.body.setSize(24, 24, true);
        this.sprite.body.setOffset(8, 8);
        this.sprite.setCollideWorldBounds(true);
    }

    update(cursors) {
        // 🎯 ULTRA SIMPLE : Lecture directe des touches
        let velX = 0;
        let velY = 0;

        if (cursors.left.isDown) {
            velX = -GAME_CONFIG.moveSpeed;
            velY = 0;
        } else if (cursors.right.isDown) {
            velX = GAME_CONFIG.moveSpeed;
            velY = 0;
        } else if (cursors.up.isDown) {
            velX = 0;
            velY = -GAME_CONFIG.moveSpeed;
        } else if (cursors.down.isDown) {
            velX = 0;
            velY = GAME_CONFIG.moveSpeed;
        }

        // Appliquer immédiatement
        this.sprite.setVelocity(velX, velY);

        // Animation
        let animKey = null;

        if (velY > 0) animKey = 'walk-down';
        else if (velY < 0) animKey = 'walk-up';
        else if (velX < 0) animKey = 'walk-left';
        else if (velX > 0) animKey = 'walk-right';

        if (!animKey) {
            this.sprite.anims.stop();
        } else if (this.sprite.anims.currentAnim?.key !== animKey) {
            this.sprite.anims.play(animKey);
        }
    }

    getTilePosition() {
        return {
            x: getTileCoord(this.sprite.x),
            y: getTileCoord(this.sprite.y)
        };
    }
}