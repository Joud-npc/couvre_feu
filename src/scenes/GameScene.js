import { GAME_CONFIG, GHOST_NAMES } from '../config/GameConfig.js';
import { Ernest } from '../entities/Ernest.js';
import { Ghost } from '../entities/Ghost.js';
import { createMaze, generateNewLevel, findValidSpawnPosition } from '../map/level1.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        Ernest.preload(this);
        Ghost.preload(this);

        // Charger les sons
        this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
        this.load.audio('gameOverSound', 'assets/sounds/game_over.mp3');
    }

    create() {
        this.gameOver = false;
        this.currentLevel = 1; // 🎮 Compteur de niveau

        // ✅ Créer les animations pour Ernest ET Ghost
        Ernest.createAnimations(this);
        Ghost.createAnimations(this);

        // 🎵 Créer et jouer la musique de fond
        this.bgMusic = this.sound.add('bgMusic', {
            volume: 0.5,
            loop: true
        });
        this.bgMusic.play();

        this.cameras.main.setBackgroundColor('#000000');

        this.setupLevel();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreText = this.add.text(16, 16, 'Niveau: 1', {
            fontSize: '24px',
            fill: '#fff'
        }).setScrollFactor(0);
    }

    setupLevel() {
        // Nettoyer l'ancien niveau si il existe
        if (this.walls) {
            this.walls.clear(true, true);
        }
        if (this.portals) {
            this.portals.clear(true, true);
        }
        if (this.ghosts) {
            this.ghosts.forEach(ghost => ghost.getSprite().destroy());
            this.ghosts = [];
        }
        if (this.ernest && this.ernest.sprite) {
            this.ernest.sprite.destroy();
        }

        generateNewLevel();
        const { walls, portals } = createMaze(this);
        this.walls = walls;
        this.portals = portals;

        // 🎯 CORRECTION : Rendre les murs immovables AVANT de créer les entités
        this.walls.children.entries.forEach(wall => {
            wall.body.immovable = true;
        });

        const ernestPos = findValidSpawnPosition(-1, -1, 0);
        this.ernest = new Ernest(this, ernestPos.x, ernestPos.y);

        // Collider Ernest/Murs
        this.physics.add.collider(this.ernest.sprite, this.walls);

        // 🚪 Overlap Ernest/Portails
        this.physics.add.overlap(
            this.ernest.sprite,
            this.portals,
            this.handlePortalCollision,
            null,
            this
        );

        this.cameras.main.startFollow(this.ernest.sprite);
        this.cameras.main.setZoom(1);

        // Création des fantômes avec difficulté progressive
        this.ghosts = [];
        const ghostSpeed = 0.75 + (this.currentLevel - 1) * 0.05; // Plus rapides à chaque niveau

        for (let i = 0; i < GHOST_NAMES.length; i++) {
            const ghostPos = findValidSpawnPosition(ernestPos.x, ernestPos.y, 5);
            const ghost = new Ghost(this, ghostPos.x, ghostPos.y, i, GHOST_NAMES[i]);

            // Augmenter la vitesse en fonction du niveau
            ghost.speed = GAME_CONFIG.moveSpeed * ghostSpeed;

            this.ghosts.push(ghost);

            // Collider pour les fantômes
            this.physics.add.collider(ghost.getSprite(), this.walls);
        }

        this.setupCollisions();
    }

    handlePortalCollision(ernestSprite, portal) {
        if (this.isTransitioning) return; // Éviter les téléportations multiples

        this.isTransitioning = true;

        // 🎉 Effet visuel de transition
        this.cameras.main.flash(500, 255, 215, 0); // Flash doré

        // 🎮 Passer au niveau suivant
        this.currentLevel++;
        this.scoreText.setText(`Niveau: ${this.currentLevel}`);

        // Petit délai avant de recharger le niveau
        this.time.delayedCall(300, () => {
            this.setupLevel();
            this.isTransitioning = false;
        });
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

        // 🎵 Arrêter la musique et jouer le son de game over
        this.bgMusic.stop();
        this.sound.play('gameOverSound', { volume: 0.7 });

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
            this.currentLevel = 1; // Reset niveau
            this.scene.restart();
        });
    }
}