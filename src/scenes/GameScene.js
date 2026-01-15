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

        // 🆕 Charger les sprites des obstacles
        this.load.image('car', 'assets/images/environements/spr_obj_car.png');
        this.load.image('wall', 'assets/images/environements/spr_obj_wall.png');

        // Charger les sons
        this.load.audio('bgMusic', 'assets/sounds/background_music.mp3');
        this.load.audio('gameOverSound', 'assets/sounds/game_over.mp3');
    }

    create() {
        this.gameOver = false;
        this.currentLevel = 1; // 🎮 Compteur de niveau
        this.totalScore = 0; // 💯 Score total
        this.levelPoints = 0; // Points du niveau actuel
        this.levelStartTime = 0; // Timer du niveau

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

        // 🎯 Textes d'interface
        this.scoreText = this.add.text(16, 16, 'Niveau: 1 | Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        }).setScrollFactor(0).setDepth(1000);

        this.timerText = this.add.text(16, 50, 'Points: 100 | Temps: 30s', {
            fontSize: '20px',
            fill: '#FFD700'
        }).setScrollFactor(0).setDepth(1000);
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

        // 💯 Initialiser les points du niveau
        this.levelPoints = 100;
        this.levelStartTime = this.time.now;

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

        const ghostCount = Math.min(GHOST_NAMES.length, Math.floor((this.currentLevel - 1) / 5) + 4);

        for (let i = 0; i < ghostCount; i++) {
            const ghostPos = findValidSpawnPosition(ernestPos.x, ernestPos.y, 5);
            const ghostName = GHOST_NAMES[i % GHOST_NAMES.length]; // Répète les noms si besoin
            const ghost = new Ghost(this, ghostPos.x, ghostPos.y, i, ghostName);

            ghost.speed = GAME_CONFIG.moveSpeed * ghostSpeed;
            ghost.reset();

            this.ghosts.push(ghost);

            this.physics.add.collider(ghost.getSprite(), this.walls);
        }

        this.setupCollisions();
    }

    handlePortalCollision(ernestSprite, portal) {
        if (this.isTransitioning) return; // Éviter les téléportations multiples

        this.isTransitioning = true;

        // 💯 Ajouter les points restants au score total
        const pointsEarned = Math.max(0, this.levelPoints);
        this.totalScore += pointsEarned;

        // 🎉 Effet visuel de transition
        this.cameras.main.flash(500, 255, 215, 0); // Flash doré

        // Afficher les points gagnés
        const bonusText = this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2,
            `+${pointsEarned} points!`,
            { fontSize: '48px', fill: '#FFD700' }
        ).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: bonusText,
            y: GAME_CONFIG.height / 2 - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => bonusText.destroy()
        });

        // 🎮 Passer au niveau suivant
        this.currentLevel++;
        this.scoreText.setText(`Niveau: ${this.currentLevel} | Score: ${this.totalScore}`);

        // Petit délai avant de recharger le niveau
        this.time.delayedCall(600, () => {
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

        // 💯 Calculer les points restants basés sur le temps
        const elapsedSeconds = (this.time.now - this.levelStartTime) / 1000;
        const remainingTime = Math.max(0, 30 - elapsedSeconds);

        // Points diminuent linéairement de 100 à 0 en 30 secondes
        this.levelPoints = Math.max(0, Math.floor(100 * (remainingTime / 30)));

        // Mettre à jour l'affichage
        this.timerText.setText(`Points: ${this.levelPoints} | Temps: ${Math.ceil(remainingTime)}s`);

        // Changer la couleur selon l'urgence
        if (remainingTime < 10) {
            this.timerText.setColor('#FF0000'); // Rouge
        } else if (remainingTime < 20) {
            this.timerText.setColor('#FFA500'); // Orange
        } else {
            this.timerText.setColor('#FFD700'); // Or
        }
    }

    handleGameOver() {
        console.log('🚨 handleGameOver appelée !'); // Debug
        console.log('gameOver avant:', this.gameOver);
        if (this.gameOver) return;

        this.gameOver = true;
        this.physics.pause();

        // 🎵 Arrêter la musique et jouer le son de game over
        this.bgMusic.stop();
        this.sound.play('gameOverSound', { volume: 0.7 });

        this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2 - 60,
            'GAME OVER!',
            { fontSize: '64px', fill: '#ff0000' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2,
            `Score final: ${this.totalScore}`,
            { fontSize: '32px', fill: '#FFD700' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2 + 50,
            'Cliquez pour rejouer',
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.input.once('pointerdown', () => {
            console.log('🖱️ CLIC DÉTECTÉ !');

            // Arrêter tous les sons
            this.sound.stopAll();

            // Nettoyer manuellement TOUT
            this.children.removeAll(true); // Détruit tous les objets visuels
            this.physics.world.colliders.destroy(); // Détruit tous les colliders

            // Reset les variables
            this.gameOver = false;
            this.currentLevel = 1;
            this.totalScore = 0;
            this.isTransitioning = false;
            this.ghosts = [];
            this.walls = null;
            this.portals = null;
            this.ernest = null;

            // Reprendre la physique
            this.physics.resume();

            // Recréer tout comme au début
            this.create();
        });
    }
}