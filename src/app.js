import Phaser from 'phaser';
import Game from './scenes/Game';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game],
    physics: {
        default: 'arcade',
        // matter: {
        //     enableSleeping: true,
        //     gravity: {
        //         y: 0
        //     },
        //     setBounds: true,
        //     debug: {
        //         showBody: true,
        //         showStaticBody: true
        //     }
        // }
    }
};

new Phaser.Game(config);