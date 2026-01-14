import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { GAME_CONFIG } from './config/GameConfig.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true // Mets true pour voir les collisions
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);