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
        this.path = null;
        this.player1Path = null;
        this.player2Path = null;
        this.player1GraphicsLine = null;
        this.player2GraphicsLine = null;
        // welcome, player1Path>confirm, player2Path>confirm
        // countdown, ingame, endgame, results
        this.stage = 'welcome';
        this.stageText = null;
        this.isDrawing = false;
        this.welcomeText = null;
        this.startButton = null;
        this.confirmButton = null;
        this.cancelButton = null;
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
        this.setPlayer1GraphicsLine();
        this.setPlayer2GraphicsLine();
        this.setWelcomeText();
        this.setStartButton();
        this.setStageText();
    }

    update() {
        this.stageText.setText(this.stage);
        if(this.stage === 'player1Path' || this.stage === 'player2Path' || this.stage === 'countdown') {
            if(this.confirmButton) {
                this.confirmButton.destroy();
                this.confirmButton = null;
            }
            if(this.cancelButton) {
                this.cancelButton.destroy();
                this.cancelButton = null;
            }
            this.enableDrawing();
        }
        if(this.stage === 'player1Path' && !this.player1Path && this.path && !this.isDrawing) {
            this.player1Path = this.path;
            this.stage = 'player1Path>confirm';
        }
        if(this.stage === 'player2Path' && !this.player2Path && this.path && !this.isDrawing) {
            this.player2Path = this.path;
            this.stage = 'player2Path>confirm';
        }
        if(this.stage === 'player1Path>confirm' && !this.confirmButton) {
            this.setConfirmButton('Confirm!', 200, 580);
        }
        if(this.stage === 'player1Path>confirm' && !this.cancelButton) {
            this.setCancelButton('Cancel', 600, 580);
        }
        if(this.stage === 'player1Path>confirm' && this.confirmButton && this.isConfirmed) {
            //this.stage = 'player2Path';
        }
        if(this.stage === 'player2Path>confirm' && !this.confirmButton) {
            this.setConfirmButton('Confirm!', 200, 580);
        }
        if(this.stage === 'player2Path>confirm' && !this.cancelButton) {
            this.setCancelButton('Cancel', 600, 580);
        }
    }

    setPlayer1GraphicsLine() {
        this.player1GraphicsLine = this.add.graphics();
        this.player1GraphicsLine.lineStyle(4, 0x000000);
    }

    setPlayer2GraphicsLine() {
        this.player2GraphicsLine = this.add.graphics();
        this.player2GraphicsLine.lineStyle(4, 0x000000);
    }

    setWelcomeText() {
        this.welcomeText = this.add.text(400, 500, 'Welcome to the field of butterflies. Each player will draw a line of the path they will take. Ready?', {
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            //backgroundColor: '#134900',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                blur: 2,
                stroke: true,
                color: '#000'
            },
            padding: {
                x: 12,
                y: 12
            },
            fixedWidth: 700,
            fontSize: '16px',
            stroke: '#000',
            strokeThickness: 2,
            wordWrap: {
                width: 700
            },
            align: 'center'
        }).setOrigin(.5, 1);
    }

    setStartButton() {
        this.startButton = this.add.text(400, 580, 'Start!', {
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            backgroundColor: '#c500c3',
            padding: {
                x: 12,
                y: 12
            },
            fontSize: '20px',
            stroke: '#000',
            strokeThickness: 4,
            wordWrap: {
                width: 700
            },
            align: 'center'
        })
        .setOrigin(.5, 1)
        .setInteractive()
        .on('pointerover', function() {
            this.setBackgroundColor('#ff6cfe');
        })
        .on('pointerout', function() {
            this.setBackgroundColor('#c500c3');
        })
        .on('pointerup', function() {
            this.startButton.destroy();
            this.welcomeText.destroy();
            this.stage = 'player1Path';
        }, this);
    }

    setStageText() {
        this.stageText = this.add.text(0, 0, 'welcome', {
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            //backgroundColor: '#134900',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                blur: 2,
                stroke: true,
                color: '#000'
            },
            padding: {
                x: 12,
                y: 12
            },
            fontSize: '16px',
            stroke: '#000',
            strokeThickness: 2,
            wordWrap: {
                width: 700
            },
            align: 'center'
        });
    }

    setConfirmButton(text, x, y) {
        this.confirmButton = this.add.text(x, y, text, {
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            backgroundColor: '#c500c3',
            padding: {
                x: 12,
                y: 12
            },
            fontSize: '20px',
            stroke: '#000',
            strokeThickness: 4,
            wordWrap: {
                width: 700
            },
            align: 'center'
        })
        .setOrigin(.5, 1)
        .setInteractive()
        .on('pointerover', function() {
            this.setBackgroundColor('#ff6cfe');
        })
        .on('pointerout', function() {
            this.setBackgroundColor('#c500c3');
        })
        .on('pointerup', function() {
            this.path = null;
            if(this.stage === 'player1Path>confirm') {
                this.stage = 'player2Path';
            } else if(this.stage === 'player2Path>confirm') {
                this.stage = 'countdown';
            }
        }, this);
    }

    setCancelButton(text, x, y) {
        this.cancelButton = this.add.text(x, y, text, {
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            backgroundColor: '#fff',
            padding: {
                x: 12,
                y: 12
            },
            fontSize: '20px',
            stroke: '#000',
            strokeThickness: 4,
            wordWrap: {
                width: 700
            },
            align: 'center'
        })
        .setOrigin(.5, 1)
        .setInteractive()
        .on('pointerover', function() {
            this.setBackgroundColor('#ddd');
        })
        .on('pointerout', function() {
            this.setBackgroundColor('#fff');
        })
        .on('pointerup', function() {
            this.path = null;
            if(this.stage === 'player1Path>confirm') {
                this.player1GraphicsLine.destroy();
                this.setPlayer1GraphicsLine();
                this.player1Path = null;
                this.stage = 'player1Path';
            } else if(this.stage === 'player2Path>confirm') {
                this.player2GraphicsLine.destroy();
                this.setPlayer2GraphicsLine();
                this.player2Path = null;
                this.stage = 'player2Path';
            }
        }, this);
    }

    enableDrawing() {
        // enable drawing
        if(!this.input.activePointer.isDown && this.isDrawing) {
            this.isDrawing = false;
        } else if(this.input.activePointer.isDown) {
            if(!this.isDrawing) {
                this.path = new Phaser.Curves.Path(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
                this.isDrawing = true;
            } else {
                this.path.lineTo(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
            }
            if(this.stage === 'player1Path') {
                this.path.draw(this.player1GraphicsLine);
            } else if(this.stage === 'player2Path') {
                this.path.draw(this.player2GraphicsLine);
            }
            
        }
    }
}