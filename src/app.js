import Phaser from 'phaser';
import Game from './scenes/Game';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game]
};

new Phaser.Game(config);