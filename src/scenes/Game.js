import Phaser from 'phaser';
import { cmb_random } from '../utils';
export { cmb_random } from '../utils';

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        this.butterflies = [];
    }

    preload() {
        this.load.image('field', '/assets/field.png');
        this.load.image('butterfly', '/assets/butterfly.png');
        this.load.image('net', '/assets/net.png');
        this.load.image('obstacle', '/assets/obstacle.png');
        this.load.image('player', '/assets/player.png');
    }

    create() {
        this.field = this.add.image(400, 300, 'field');
        this.player1 = this.add.image(20, 20, 'player');
        this.player2 = this.add.image(750, 550, 'player');
        console.log(this.player1, this.player2);
        console.log(cmb_random(0, 800));
        for(let i = 0; i < 25; i++) {
            this.butterflies.push(this.add.image(cmb_random(60, 740), cmb_random(60, 540), 'butterfly'))
        }
    }
}