import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { GAME_CONFIG } from './config/GameConfig.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false  // 🔍 MODE DEBUG ACTIVÉ pour voir les hitbox
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);