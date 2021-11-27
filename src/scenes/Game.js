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
        this.player1NetIsSwinging = false;
        this.player2NetIsSwinging = false;
        this.player1Points = 0;
        this.player2Points = 0;
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
        this.player1Image = this.add.image(0, 0, 'player');
        this.player1Net = this.add.image(0, 0, 'net');
        this.player1 = this.add.container(20, 20, [this.player1Image, this.player1Net]);
        this.player2Image = this.add.image(0, 0, 'player');
        this.player2Net = this.add.image(0, 0, 'net');
        this.player2 = this.add.container(780, 580, [this.player2Image, this.player2Net]);
        this.player1Net.setOrigin(0, 1);
        this.player1Net.angle = -50;
        this.player1Net.setPosition(0, 0)
        this.player2Net.setOrigin(0, 1);
        this.player2Net.angle = -50;
        this.player2Net.setPosition(0, 0);
        for(let i = 0; i < 15; i++) {
            this.butterflies.push(this.add.image(cmb_random(80, 720), cmb_random(80, 520), 'butterfly'))
        }
        //this.butterfliesGroup = this.physics.add.group(this.butterflies);
        this.setPlayer1GraphicsLine();
        this.setPlayer2GraphicsLine();
        this.setWelcomeText();
        this.setStartButton();
        this.setStageText();
        // this.physics.add.overlap(this.player1Net, this.butterflies, this.collectButterfly, null, this);
        // this.physics.add.overlap(this.player2Net, this.butterflies, this.collectButterfly, null, this);
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.keyboard.on('keydown-SPACE', this.handleKeydownSpace, this);
    }

    update(time, delta) {
        this.stageText.setText('Player 1: '+this.player1Points+' - Player 2: '+this.player2Points);
        if(this.stage === 'player1Path' || this.stage === 'player2Path') {
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
        if(this.stage === 'player2Path>confirm' && !this.confirmButton) {
            this.setConfirmButton('Confirm!', 200, 580);
        }
        if(this.stage === 'player2Path>confirm' && !this.cancelButton) {
            this.setCancelButton('Cancel', 600, 580);
        }
        if(this.stage === 'ingame') {
            if(this.confirmButton) {
                this.confirmButton.destroy();
                this.confirmButton = null;
            }
            if(this.cancelButton) {
                this.cancelButton.destroy();
                this.cancelButton = null;
            }
            if(!this.player1PathPoints) {
                this.player1PathPoints = this.player1Path.getSpacedPoints(this.player1Path.getLength());
                this.player1PointOnPath = 0;
                this.player1.setPosition(this.player1PathPoints[0].x, this.player1PathPoints[0].y);
            } else {
                this.player1PointOnPath = this.player1PointOnPath + (delta * .1);
                if(this.player1PointOnPath < this.player1Path.getLength()) {
                    this.player1.setPosition(this.player1PathPoints[Math.floor(this.player1PointOnPath)].x, this.player1PathPoints[Math.floor(this.player1PointOnPath)].y);
                }
            }
            if(!this.player2PathPoints) {
                this.player2PathPoints = this.player2Path.getSpacedPoints(this.player2Path.getLength());
                this.player2PointOnPath = 0;
                this.player2.setPosition(this.player2PathPoints[0].x, this.player2PathPoints[0].y);
            } else {
                this.player2PointOnPath = this.player2PointOnPath + (delta * .1);
                if(this.player2PointOnPath < this.player2Path.getLength()) {
                    this.player2.setPosition(this.player2PathPoints[Math.floor(this.player2PointOnPath)].x, this.player2PathPoints[Math.floor(this.player2PointOnPath)].y);
                }
            }
            // turn man toward next coordinate on the line
            this.setPlayerRotation(this.player1, this.player1PointOnPath, this.player1PathPoints);
            this.setPlayerRotation(this.player2, this.player2PointOnPath, this.player2PathPoints);
            // set angle on net for swing
            if(this.player1NetIsSwinging) {
                if(this.player1Net.angle < -50 && this.player1Net.angle > -130 ) {
                    this.player1Net.angle = -50;
                    this.player1NetIsSwinging = false;
                } else {
                    this.player1Net.angle += delta * .50;
                }
            }
            if(this.player2NetIsSwinging) {
                if(this.player2Net.angle < -50 && this.player2Net.angle > -230 ) {
                    this.player2Net.angle = -50;
                    this.player2NetIsSwinging = false;
                } else {
                    this.player2Net.angle += delta * .50;
                }
            }
            // detect net collision
            for(let i = 0; i < this.butterflies.length; i++) {
                //player1
                if(this.butterflies[i] === null) continue;
                let ray = new Phaser.Geom.Line(this.player1.x, this.player1.y, this.butterflies[i].x, this.butterflies[i].y);
                let length = Phaser.Geom.Line.Length(ray);
                let angle = Phaser.Geom.Line.Angle(ray);
                let netAngle = this.player1Net.rotation + this.player1Net.getParentRotation();
                if(length < 55 && Math.abs(angle.toFixed(3) - netAngle.toFixed(3)) < 0.51) {
                    this.butterflies[i].destroy();
                    this.butterflies[i] = null;
                    this.player1Points++;
                }
                //player2
                if(this.butterflies[i] === null) continue;
                let ray2 = new Phaser.Geom.Line(this.player2.x, this.player2.y, this.butterflies[i].x, this.butterflies[i].y);
                let length2 = Phaser.Geom.Line.Length(ray2);
                let angle2 = Phaser.Geom.Line.Angle(ray2);
                let netAngle2 = this.player2Net.rotation + this.player2Net.getParentRotation();
                if(length2 < 55 && Math.abs(angle2.toFixed(3) - netAngle2.toFixed(3)) < 0.51) {
                    this.butterflies[i].destroy();
                    this.butterflies[i] = null;
                    this.player2Points++;
                }
            }
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
                // skipping countdown for now
                setTimeout(() => {this.stage = 'ingame';}, 500);
                
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

    setPlayerRotation(player, playerPointOnPath, pathPoints) {
        var x1 = player.x;
        var y1 = player.y;
        var pNextPoint = pathPoints[Math.floor(playerPointOnPath + 1)];
        if(pNextPoint) {
            var x2 = pNextPoint.x;
            var y2 = pNextPoint.y;
            var slope = (y2 - y1)/(x2 - x1);
            var pAngle = null;
            if(x1 === x2) {
                slope = 0;
            }
            if(x1 === x2 && y1 < y2) {
                pAngle = Math.PI;
            } else if(x1 === x2 && y1 > y2) {
                pAngle = 0;
            } else if(y1 === y2 && x1 < x2) {
                pAngle = Math.PI - Math.PI/2;
            } else if(y1 === y2 && x1 > x2) {
                pAngle = 2*Math.PI - Math.PI/2;
            } else if(x1 < x2 && y1 < y2) {
                pAngle = Math.atan(slope) + Math.PI/2;
            } else if(x1 < x2 && y1 > y2) {
                pAngle = Math.atan(slope) + Math.PI - Math.PI/2;
            } else if(x1 > x2 && y1 > y2) {
                pAngle = Math.atan(slope) + 3*Math.PI/2;
            } else if(x1 > x2 && y1 < y2) {
                pAngle = Math.atan(slope) + 2*Math.PI - Math.PI/2;
            }
            player.rotation = pAngle - Math.PI;
        }
    }

    handlePointerDown() {
        if(this.stage === 'ingame' && this.player1NetIsSwinging === false) {
            this.player1NetIsSwinging = true;
        }
    }

    handleKeydownSpace() {
        if(this.stage === 'ingame' && this.player2NetIsSwinging === false) {
            this.player2NetIsSwinging = true;
        }
    }

    collectButterfly(player, butterfly) {
        butterfly.destroy();
    }
}