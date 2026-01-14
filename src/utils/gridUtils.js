import { GAME_CONFIG } from '../config/GameConfig.js';

export function getTileCoord(pixel) {
    return Math.floor(pixel / GAME_CONFIG.tileSize);
}

export function getPixelCoord(tile) {
    return tile * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;
}

// 🎯 CORRECTION : Tolérance réduite pour un meilleur alignement
export function isAlignedToGrid(pixel, tolerance = 3) {
    const remainder = (pixel - GAME_CONFIG.tileSize / 2) % GAME_CONFIG.tileSize;
    return Math.abs(remainder) < tolerance;
}