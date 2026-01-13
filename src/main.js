import Phaser from 'phaser';

// Configuration du jeu
const config = {
    type: Phaser.AUTO,
    width: 448,
    height: 496,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let pacman;
let cursors;
let dots;
let score = 0;
let scoreText;

function preload() {
    // Créer les graphiques au lieu de charger des images
}

function create() {
    // Créer Pac-Man comme un cercle jaune
    pacman = this.add.circle(224, 248, 12, 0xFFFF00);
    this.physics.add.existing(pacman);
    pacman.body.setCollideWorldBounds(true);

    // Créer les pastilles
    dots = this.physics.add.group();

    for (let y = 50; y < 450; y += 40) {
        for (let x = 50; x < 400; x += 40) {
            const dot = this.add.circle(x, y, 3, 0xFFFFFF);
            this.physics.add.existing(dot);
            dots.add(dot);
        }
    }

    // Collision entre Pac-Man et les pastilles
    this.physics.add.overlap(pacman, dots, collectDot, null, this);

    // Contrôles
    cursors = this.input.keyboard.createCursorKeys();

    // Score
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '20px',
        fill: '#fff'
    });
}

function update() {
    // Mouvement de Pac-Man
    pacman.body.setVelocity(0);

    if (cursors.left.isDown) {
        pacman.body.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        pacman.body.setVelocityX(160);
    }

    if (cursors.up.isDown) {
        pacman.body.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        pacman.body.setVelocityY(160);
    }
}

function collectDot(pacman, dot) {
    dot.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}