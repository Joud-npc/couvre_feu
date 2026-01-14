import { GAME_CONFIG, GHOST_NAMES, GHOST_START_POSITIONS } from '../config/GameConfig.js';
import { Ernest } from '../entities/Ernest.js';
import { Ghost } from '../entities/Ghost.js';
import { createMaze, isWalkable } from '../map/level1.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        Ernest.preload(this);
        Ghost.preload(this);
    }

    create() {
        this.gameOver = false;

        // Fond noir
        this.cameras.main.setBackgroundColor('#000000');

        // Création du labyrinthe
        const { walls } = createMaze(this);
        this.walls = walls;

        console.log('Nombre de murs créés:', this.walls.getChildren().length);
        console.log('Premier mur:', this.walls.getChildren()[0]);

        // DEBUG - Tester isWalkable
        console.log('isWalkable(7, 6):', isWalkable(7, 6)); // Devrait être true
        console.log('isWalkable(0, 0):', isWalkable(0, 0)); // Devrait être false (mur)
        console.log('isWalkable(1, 1):', isWalkable(1, 1)); // Devrait être true
        console.log('isWalkable(8, 6):', isWalkable(8, 6)); // Devrait être true
        console.log('isWalkable(7, 7):', isWalkable(7, 7)); // Devrait être true
        console.log('isWalkable(7, 5):', isWalkable(7, 5)); // Devrait être true
        console.log('isWalkable(6, 6):', isWalkable(6, 6)); // Devrait être true


        // Création de Pac-Man
        this.ernest = new Ernest(this, 7, 1);

        // Collision Pac-Man avec les murs
        this.physics.add.collider(this.ernest.sprite, this.walls);

        // Création des fantômes
        this.ghosts = [];
        GHOST_START_POSITIONS.forEach((pos, index) => {
            const ghost = new Ghost(
                this,
                pos.x,
                pos.y,
                index,
                GHOST_NAMES[index]
            );
            this.ghosts.push(ghost);

            // Collision fantôme avec les murs
            this.physics.add.collider(ghost.getSprite(), this.walls);
        });

        // Collisions Pac-Man / fantômes
        this.setupCollisions();

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        }).setScrollFactor(0);
    }

    setupCollisions() {
        this.ghosts.forEach(ghost => {
            this.physics.add.overlap(
                this.ernest.sprite,
                ghost.getSprite(),
                () => this.handleGameOver(),
                null,
                this
            );
        });
    }

    update(time, delta) {
        if (this.gameOver) return;

        this.ernest.update(this.cursors);

        const ernestTile = this.ernest.getTilePosition();
        this.ghosts.forEach(ghost => {
            ghost.update(delta, ernestTile.x, ernestTile.y);
        });
    }

    handleGameOver() {
        if (this.gameOver) return;

        this.gameOver = true;
        this.physics.pause();
        this.ernest.sprite.setTint(0xff0000);

        this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2 - 30,
            'GAME OVER!',
            { fontSize: '64px', fill: '#ff0000' }
        ).setOrigin(0.5);

        this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2 + 40,
            'Cliquez pour rejouer',
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
}