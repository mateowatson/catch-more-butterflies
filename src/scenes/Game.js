import Phaser from 'phaser';
import { cmb_random, cmb_random_arr_el } from '../utils';

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init() {
        this.butterflies = [];
        this.obstacles = [];
        this.player1 = null;
        this.player2 = null;
        this.path = null;
        this.player1Path = null;
        this.player2Path = null;
        this.player1GraphicsLine = null;
        this.player2GraphicsLine = null;
        this.player1LiveGraphicsLine = null;
        this.player2LiveGraphicsLine = null;
        this.player1PathPoints = null;
        this.player2PathPoints =null;
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
        this.player1IsDone = false;
        this.player2IsDone = false;
        this.resultsText = null;
        this.resetGameText = null;
        this.zIndexText = 6;
        this.zIndexPlayer = 5;
        this.zIndexLine = 4;
        this.zIndexButterfly = 3;
        this.zIndexObstacle = 2;
        this.lineAlfa = .6;
        this.warning = '';
        this.warningText = null;
        this.music = null;
        this.catchSound = null;
        this.endSound = null;
    }

    preload() {
        this.load.image('grasstexture', 'assets/grasstexture.png');
        this.load.image('butterfly-blue', 'assets/blue.png');
        this.load.image('butterfly-white', 'assets/butterfly-white.png');
        this.load.image('butterfly-monarch', 'assets/Monarch-butterfly.png');
        this.load.image('butterfly-orange', 'assets/orange-butterfly.png');
        this.load.image('tongue', 'assets/tongue.png');
        this.load.image('obstacle-coneflower', 'assets/obstacle-coneflower.png');
        this.load.image('obstacle-heliotrope', 'assets/obstacle-heliotrope.png');
        this.load.image('obstacle-lantana', 'assets/obstacle-lantana.png');
        this.load.image('player1', 'assets/player1.png');
        this.load.image('player2', 'assets/player2.png');
        this.load.audio('theme', 'ignored-assets/theme.mp3', { loop: true });
        this.load.audio('catch', 'ignored-assets/catch.ogg');
        this.load.audio('end', 'ignored-assets/end.ogg');
    }

    create() {
        this.field = this.add.tileSprite(400, 300, 800, 600, 'grasstexture');
        this.player1Image = this.add.image(0, -17, 'player1').setRotation(Math.PI/4);
        this.player1Net = this.add.image(0, 0, 'tongue');
        this.player1 = this.add.container(50, 50, [this.player1Image, this.player1Net]);
        this.player1.setDepth(this.zIndexPlayer)
        this.player2Image = this.add.image(0, -17, 'player2').setRotation(Math.PI/4);
        this.player2Net = this.add.image(0, 0, 'tongue');
        this.player2 = this.add.container(750, 550, [this.player2Image, this.player2Net]);
        this.player2.setDepth(this.zIndexPlayer)
        this.player2.setRotation(-Math.PI)
        this.player1Net.setOrigin(0, 1);
        this.player1Net.angle = -50;
        this.player1Net.setPosition(0, 0)
        this.player2Net.setOrigin(0, 1);
        this.player2Net.angle = -50;
        this.player2Net.setPosition(0, 0);
        this.setButterflies();
        this.setObstacles();
        this.setPlayer1GraphicsLine();
        this.setPlayer2GraphicsLine();
        this.setPlayer1LiveGraphicsLine();
        this.setPlayer2LiveGraphicsLine();
        this.setWelcomeText();
        this.setStartButton();
        this.setStageText();
        this.setWarningText();
        this.player1Net.setVisible(false);
        this.player2Net.setVisible(false);
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.keyboard.on('keydown-SPACE', this.handleKeydownSpace, this);
        this.music = this.sound.add('theme');
        this.catchSound = this.sound.add('catch');
        this.endSound = this.sound.add('end');
    }

    update(time, delta) {
        this.stageText.setText('Player 1 Score: '+this.player1Points+' <<< >>> Player 2 Score: '+this.player2Points);
        this.warningText.setText(this.warning);
        if(this.player1IsDone && this.player2IsDone && this.stage === 'ingame') {
            this.stage = 'endgame';
            this.setResultsText();
            this.setResetGameText();
            this.music.pause();
            this.endSound.play();
            setTimeout(() => {
                if(!this.music.isPlaying) {
                    this.music.resume();
                }
            }, 2000)
        }
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
            this.warning = '';
            if(!(this.path.getLength() > 100)) {
                this.warning = 'Your line is not long enough. Try again.'
                this.path = null;
                this.player1GraphicsLine.destroy();
                this.setPlayer1GraphicsLine();
                this.setPlayer1LiveGraphicsLine();
                this.player1Path = null;
                this.stage = 'player1Path';
            } else if(this.intersectsObstacle()) {
                this.warning = 'You can only travel on open grass. Try again.'
                this.path = null;
                this.player1GraphicsLine.destroy();
                this.setPlayer1GraphicsLine();
                this.setPlayer1LiveGraphicsLine();
                this.player1Path = null;
                this.stage = 'player1Path';
            } else if(!this.intersectsPlayer(this.player1)) {
                this.warning = 'Your line has to begin on your frog. Try again.'
                this.path = null;
                this.player1GraphicsLine.destroy();
                this.setPlayer1GraphicsLine();
                this.setPlayer1LiveGraphicsLine();
                this.player1Path = null;
                this.stage = 'player1Path';
            } else {
                this.player1Path = this.path;
                this.stage = 'player1Path>confirm';
            }
        }
        if(this.stage === 'player2Path' && !this.player2Path && this.path && !this.isDrawing) {
            this.warning = '';
            if(!this.intersectsObstacle()) {
                this.player2Path = this.path;
                this.stage = 'player2Path>confirm';
            } else {
                this.warning = 'You can only travel on open grass.'
                this.path = null;
                this.player2GraphicsLine.destroy();
                this.setPlayer2GraphicsLine();
                this.setPlayer2LiveGraphicsLine();
                this.player2Path = null;
                this.stage = 'player2Path';
            }
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
                } else {
                    this.player1IsDone = true;
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
                } else {
                    this.player2IsDone = true;
                }
            }
            // turn man toward next coordinate on the line
            this.setPlayerRotation(this.player1, this.player1PointOnPath, this.player1PathPoints);
            this.setPlayerRotation(this.player2, this.player2PointOnPath, this.player2PathPoints);
            // set angle on net for swing
            if(this.player1NetIsSwinging) {
                this.player1Net.setVisible(true);
                if(this.player1Net.angle < -50 && this.player1Net.angle > -130 ) {
                    this.player1Net.angle = -50;
                    this.player1NetIsSwinging = false;
                } else {
                    this.player1Net.angle += delta * .50;
                }
            } else {
                this.player1Net.setVisible(false);
            }
            if(this.player2NetIsSwinging) {
                this.player2Net.setVisible(true);
                if(this.player2Net.angle < -50 && this.player2Net.angle > -130 ) {
                    this.player2Net.angle = -50;
                    this.player2NetIsSwinging = false;
                } else {
                    this.player2Net.angle += delta * .50;
                }
            } else {
                this.player2Net.setVisible(false);
            }
            // detect net collision
            for(let i = 0; i < this.butterflies.length; i++) {
                //player1
                if(this.butterflies[i] === null) continue;
                if(this.player1NetIsSwinging) {
                    let ray = new Phaser.Geom.Line(this.player1.x, this.player1.y, this.butterflies[i].x, this.butterflies[i].y);
                    let length = Phaser.Geom.Line.Length(ray);
                    let angle = Phaser.Geom.Line.Angle(ray);
                    let netAngle = this.player1Net.rotation + this.player1Net.getParentRotation();
                    if(length < 55 && Math.abs(angle.toFixed(3) - netAngle.toFixed(3)) < 0.300) {
                        this.butterflies[i].destroy();
                        this.butterflies[i] = null;
                        this.player1Points++;
                        this.catchSound.play();
                    }
                }
                //player2
                if(this.butterflies[i] === null) continue;
                if(this.player2NetIsSwinging) {
                    let ray2 = new Phaser.Geom.Line(this.player2.x, this.player2.y, this.butterflies[i].x, this.butterflies[i].y);
                    let length2 = Phaser.Geom.Line.Length(ray2);
                    let angle2 = Phaser.Geom.Line.Angle(ray2);
                    let netAngle2 = this.player2Net.rotation + this.player2Net.getParentRotation();
                    if(length2 < 55 && Math.abs(angle2.toFixed(3) - netAngle2.toFixed(3)) < 0.300) {
                        this.butterflies[i].destroy();
                        this.butterflies[i] = null;
                        this.player2Points++;
                        this.catchSound.play();
                    }
                }
            }
        }
    }

    setPlayer1GraphicsLine() {
        this.player1GraphicsLine = this.add.graphics().setDepth(this.zIndexLine).lineStyle(4, 0xc500c3, .6);
    }

    setPlayer2GraphicsLine() {
        this.player2GraphicsLine = this.add.graphics().setDepth(this.zIndexLine).lineStyle(4, 0xffffff, .6);
    }

    setPlayer1LiveGraphicsLine() {
        this.player1LiveGraphicsLine = this.add.graphics().setDepth(this.zIndexLine).lineStyle(4, 0xc500c3, 1);
    }

    setPlayer2LiveGraphicsLine() {
        this.player2LiveGraphicsLine = this.add.graphics().setDepth(this.zIndexLine).lineStyle(4, 0xffffff, 1);
    }

    setWelcomeText() {
        this.welcomeText = this.add.text(400, 500, 'Welcome to the field of butterflies. Each player will draw a line of the path their frog will take. Then as the frogs move on their path, you must catch butterflies with their tongue. Player 1 must click to catch butterflies with the green frog, and Player 2 must press SPACE to catch butterflies with the brown frog. ARE YOU READY?', {
            fontFamily: '"Comic Neue", sans-serif',
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
        }).setOrigin(.5, 1).setDepth(this.zIndexText);
    }

    setStartButton() {
        this.startButton = this.add.text(400, 580, 'Start!', {
            fontFamily: '"Comic Neue", sans-serif',
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
        .setDepth(this.zIndexText)
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
            if(!this.music.isPlaying) {
                this.music.play();
            }
        }, this);
    }

    setStageText() {
        this.stageText = this.add.text(400, 12, 'welcome', {
            fontFamily: '"Comic Neue", sans-serif',
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
            fontSize: '24px',
            stroke: '#000',
            strokeThickness: 2,
            wordWrap: {
                width: 700
            },
            align: 'center'
        }).setOrigin(.5, 0).setDepth(this.zIndexText);
    }

    setConfirmButton(text, x, y) {
        this.confirmButton = this.add.text(x, y, text, {
            fontFamily: '"Comic Neue", sans-serif',
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
        .setDepth(this.zIndexText)
        .on('pointerover', function() {
            this.setBackgroundColor('#ff6cfe');
        })
        .on('pointerout', function() {
            this.setBackgroundColor('#c500c3');
        })
        .on('pointerup', function() {
            this.path = null;
            if(this.stage === 'player1Path>confirm') {
                this.player1GraphicsLine.setVisible(false);
                this.stage = 'player2Path';
            } else if(this.stage === 'player2Path>confirm') {
                // skipping countdown for now
                this.warning = 'Ready, set, go!';
                this.player1GraphicsLine.setVisible(true);
                setTimeout(() => {
                    this.warning = '';
                    this.stage = 'ingame';
                }, 1000);
                
            }
        }, this);
    }

    setCancelButton(text, x, y) {
        this.cancelButton = this.add.text(x, y, text, {
            fontFamily: '"Comic Neue", sans-serif',
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
        .setDepth(this.zIndexText)
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
                this.setPlayer1LiveGraphicsLine();
                this.player1Path = null;
                this.stage = 'player1Path';
            } else if(this.stage === 'player2Path>confirm') {
                this.player2GraphicsLine.destroy();
                this.setPlayer2GraphicsLine();
                this.setPlayer2LiveGraphicsLine();
                this.player2Path = null;
                this.stage = 'player2Path';
            }
        }, this);
    }

    enableDrawing() {
        if(!this.input.activePointer.isDown && this.isDrawing) {
            this.isDrawing = false;
            if(this.stage === 'player1Path') {
                this.player1LiveGraphicsLine.destroy();
                this.player1LiveGraphicsLine = null;
                this.path.draw(this.player1GraphicsLine);
            } else if(this.stage === 'player2Path') {
                this.player2LiveGraphicsLine.destroy();
                this.player2LiveGraphicsLine = null;
                this.path.draw(this.player2GraphicsLine);
            }
        } else if(this.input.activePointer.isDown) {
            if(!this.isDrawing) {
                this.path = new Phaser.Curves.Path(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
                this.isDrawing = true;
            } else {
                this.path.lineTo(this.input.activePointer.position.x - 2, this.input.activePointer.position.y - 2);
            }
            if(this.stage === 'player1Path') {
                this.path.draw(this.player1LiveGraphicsLine);
            } else if(this.stage === 'player2Path') {
                this.path.draw(this.player2LiveGraphicsLine);
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

    handleKeydownSpace(event) {
        event.preventDefault();
        if(this.stage === 'ingame' && this.player2NetIsSwinging === false) {
            this.player2NetIsSwinging = true;
        }
    }

    collectButterfly(player, butterfly) {
        butterfly.destroy();
    }

    setResultsText() {
        var resultsMessage = ''
        if(this.player1Points > this.player2Points) {
            resultsMessage = 'Player 1 Wins!';
        } else if(this.player2Points > this.player1Points) {
            resultsMessage = 'Player 2 Wins!';
        } else {
            resultsMessage = 'Boo! It\'s a tie.';
        }
        this.resultsText = this.add.text(400, 300, resultsMessage, {
            fontFamily: '"Comic Neue", sans-serif',
            fontStyle: 'bold',
            backgroundColor: '#c500c3',
            padding: {
                x: 50,
                y: 50
            },
            fontSize: '36px',
            stroke: '#000',
            strokeThickness: 4,
            wordWrap: {
                width: 700
            },
            align: 'center'
        })
        .setOrigin(.5, .5).setDepth(this.zIndexText);
    }

    setResetGameText() {
        this.resetGameText = this.add.text(400, 580, 'Start Another Game', {
            fontFamily: '"Comic Neue", sans-serif',
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
        .setDepth(this.zIndexText)
        .on('pointerover', function() {
            this.setBackgroundColor('#ddd');
        })
        .on('pointerout', function() {
            this.setBackgroundColor('#fff');
        })
        .on('pointerup', function() {
            this.resetGame();
            if(!this.music.isPlaying) {
                this.music.resume();
            }
        }, this);
    }

    resetGame() {
        this.player1.setPosition(50, 50);
        this.player2.setPosition(750, 550);
        this.player1Net.setVisible(false);
        this.player2Net.setVisible(false);
        this.player1.rotation = 0;
        this.player2.rotation = -Math.PI;
        this.player1Points = 0;
        this.player2Points = 0;
        this.player1IsDone = false;
        this.player2IsDone = false;
        this.path = null;
        this.player1GraphicsLine.destroy();
        this.setPlayer1GraphicsLine();
        this.player1Path = null;
        this.player2GraphicsLine.destroy();
        this.setPlayer2GraphicsLine();
        this.setPlayer1LiveGraphicsLine();
        this.setPlayer2LiveGraphicsLine();
        this.player2Path = null;
        this.player1PathPoints = null;
        this.player2PathPoints =null;
        for(let i = 0; i < this.butterflies.length; i++) {
            if(this.butterflies[i]) {
                this.butterflies[i].destroy();
            }
        }
        this.butterflies = [];
        this.setButterflies();
        this.resultsText.destroy();
        this.resultsText = null;
        this.resetGameText.destroy();
        this.resetGameText = null;
        this.stage = 'welcome';
        this.setWelcomeText();
        this.setStartButton();
    }

    setButterflies() {
        for(let i = 0; i < 15; i++) {
            this.butterflies.push(this.add.image(cmb_random(80, 720), cmb_random(80, 520), cmb_random_arr_el(['butterfly-blue','butterfly-white','butterfly-monarch','butterfly-orange'])).setRotation(cmb_random(0, 6.28)).setDepth(this.zIndexButterfly));
        }
    }

    setObstacles() {
        for(let i = 0; i < 7; i++) {
            this.obstacles.push(
                this.add.image(
                    cmb_random(80, 720),
                    cmb_random(80, 520),
                    cmb_random_arr_el(['obstacle-coneflower','obstacle-heliotrope','obstacle-lantana'])
                )
                .setDepth(this.zIndexObstacle));
        }
        for(let i = 0; i < 7; i++) {
            let coinflip = cmb_random(1, 2);
            this.obstacles.push(
                this.add.image(
                    this.obstacles[i].x + 30,
                    this.obstacles[i].y,
                    this.obstacles[i].texture.key
                ).setDepth(this.zIndexObstacle)
            );
            this.obstacles.push(
                this.add.image(
                    this.obstacles[i].x + 60,
                    this.obstacles[i].y,
                    this.obstacles[i].texture.key
                ).setDepth(this.zIndexObstacle)
            );
            if(coinflip === 1) {
                this.obstacles.push(
                    this.add.image(
                        this.obstacles[i].x,
                        this.obstacles[i].y + 30,
                        this.obstacles[i].texture.key
                    ).setDepth(this.zIndexObstacle)
                );
                this.obstacles.push(
                    this.add.image(
                        this.obstacles[i].x,
                        this.obstacles[i].y + 60,
                        this.obstacles[i].texture.key
                    ).setDepth(this.zIndexObstacle)
                );
            }
        }
    }

    setWarningText() {
        this.warningText = this.add.text(400, 46, this.warning, {
            fontFamily: '"Comic Neue", sans-serif',
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
        }).setOrigin(.5, 0).setDepth(this.zIndexText);
    }

    intersectsObstacle() {
        let spacedPoints = this.path.getSpacedPoints(this.path.getLength());
        let intersects = false;
        for(let i = 0; i < spacedPoints.length; i++) {
            for(let i2 = 0; i2 < this.obstacles.length; i2++) {
                if(!spacedPoints[i]) {
                    break;
                }
                let bounds = this.obstacles[i2].getBounds();
                if(spacedPoints[i].x >= bounds.x && spacedPoints[i].x <= bounds.x + bounds.width && spacedPoints[i].y >= bounds.y && spacedPoints[i].y <= bounds.y + bounds.height) {
                    intersects = true;
                    break;
                }
            }
            if(intersects) {
                break;
            }
        }
        return intersects;
    }

    intersectsPlayer(player) {
        let intersects = false;
        let startPoint = this.path.getStartPoint();
        let bounds = player.getBounds();
        if(startPoint.x >= bounds.x && startPoint.x <= bounds.x + bounds.width && startPoint.y >= bounds.y && startPoint.y <= bounds.y + bounds.height) {
            intersects = true;
        }
        return intersects;
    }
}