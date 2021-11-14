import Phaser from 'phaser';
import { cmb_random } from '../utils';

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init() {
        this.butterflies = [];
        this.player1 = null;
        this.player2 = null;
        this.strokes = [];
        this.isDrawing = false;
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
        this.player2 = this.add.image(780, 580, 'player');
        for(let i = 0; i < 15; i++) {
            this.butterflies.push(this.add.image(cmb_random(80, 720), cmb_random(80, 520), 'butterfly'))
        }
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(4, 0x000000);
    }

    update() {
        if(!this.input.activePointer.isDown && this.isDrawing) {
            this.isDrawing = false;
        } else if(this.input.activePointer.isDown) {
            if(!this.isDrawing) {
                this.path = new Phaser.Curves.Path(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
                this.isDrawing = true;
            } else {
                this.path.lineTo(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
            }
            this.path.draw(this.graphics);
        }
    }
}