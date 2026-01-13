import { GAME_CONFIG, GHOST_NAMES, GHOST_START_POSITIONS } from '../config/GameConfig.js';
import { Pacman } from '../entities/Pacman.js';
import { Ghost } from '../entities/Ghost.js';
import { createMaze } from '../map/level1.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        Pacman.preload(this);
        Ghost.preload(this);
    }

    create() {
        this.gameOver = false;

        // Fond noir
        this.cameras.main.setBackgroundColor('#000000');

        // Création du labyrinthe
        const { walls } = createMaze(this);
        this.walls = walls;

        // Création de Pac-Man
        this.pacman = new Pacman(this, 1, 1);

        // Collision Pac-Man avec les murs
        this.physics.add.collider(this.pacman.sprite, this.walls);

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
                this.pacman.sprite,
                ghost.getSprite(),
                () => this.handleGameOver(),
                null,
                this
            );
        });
    }

    update(time, delta) {
        if (this.gameOver) return;

        this.pacman.update(this.cursors);

        const pacmanTile = this.pacman.getTilePosition();
        this.ghosts.forEach(ghost => {
            ghost.update(delta, pacmanTile.x, pacmanTile.y);
        });
    }

    handleGameOver() {
        if (this.gameOver) return;

        this.gameOver = true;
        this.physics.pause();
        this.pacman.sprite.setTint(0xff0000);

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