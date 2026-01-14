import { GAME_CONFIG, DIRECTIONS } from '../config/GameConfig.js';
import { getTileCoord, getPixelCoord, isAlignedToGrid } from '../utils/gridUtils.js';
import { isWalkable } from '../map/level1.js';

export class Ernest {
    static preload(scene) {
        // Charger l'image de Ernest
        scene.load.image('ernest', 'assets/images/spr_ernest_right.png');
    }

    constructor(scene, tileX, tileY) {
        this.scene = scene;
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;

        const x = getPixelCoord(tileX);
        const y = getPixelCoord(tileY);

        // Créer un sprite au lieu d'un cercle
        this.sprite = scene.physics.add.sprite(x, y, 'ernest');

        // Ajuster la taille du sprite
        this.sprite.setDisplaySize(GAME_CONFIG.ernest.size * 2, GAME_CONFIG.ernest.size * 2);

        // Ajuster la hitbox pour les collisions
        this.sprite.setSize(GAME_CONFIG.ernest.size * 2, GAME_CONFIG.ernest.size * 2);

        this.sprite.setCollideWorldBounds(true);
    }

    update(cursors) {
        // Enregistrer la prochaine direction demandée
        if (cursors.left.isDown) {
            this.nextDirX = -1;
            this.nextDirY = 0;
        } else if (cursors.right.isDown) {
            this.nextDirX = 1;
            this.nextDirY = 0;
        } else if (cursors.up.isDown) {
            this.nextDirX = 0;
            this.nextDirY = -1;
        } else if (cursors.down.isDown) {
            this.nextDirX = 0;
            this.nextDirY = 1;
        }

        const currentTileX = getTileCoord(this.sprite.x);
        const currentTileY = getTileCoord(this.sprite.y);
        const alignedX = isAlignedToGrid(this.sprite.x);
        const alignedY = isAlignedToGrid(this.sprite.y);

        // Si aligné à la grille, on peut changer de direction
        if (alignedX && alignedY) {
            // Essayer de prendre la nouvelle direction demandée
            const nextX = currentTileX + this.nextDirX;
            const nextY = currentTileY + this.nextDirY;

            if ((this.nextDirX !== 0 || this.nextDirY !== 0) && isWalkable(nextX, nextY)) {
                this.dirX = this.nextDirX;
                this.dirY = this.nextDirY;
            }
            // Sinon vérifier si on peut continuer dans la direction actuelle
            else {
                const continueX = currentTileX + this.dirX;
                const continueY = currentTileY + this.dirY;

                if (!isWalkable(continueX, continueY)) {
                    this.dirX = 0;
                    this.dirY = 0;
                }
            }
        }

        // Appliquer le mouvement
        this.sprite.body.setVelocity(
            this.dirX * GAME_CONFIG.moveSpeed,
            this.dirY * GAME_CONFIG.moveSpeed
        );
    }

    getTilePosition() {
        return {
            x: getTileCoord(this.sprite.x),
            y: getTileCoord(this.sprite.y)
        };
    }
}