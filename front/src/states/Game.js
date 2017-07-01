import Phaser from 'phaser'
import { res } from '../res'

import _ from 'underscore'
import moment from 'moment'

export default class extends Phaser.State {

    init() {
        console.info('game:init')
    }

    preload() {
        this.stage.backgroundColor = '#0000FF'

        game.load.image('default', res.tiles.default)
        // game.plugins.add(new Phaser.Plugin.Isometric(game))
    }

    create() {

        this.createMap()
        // this.counter = this.createText(10, 10)
        // this.counter.text = this.getCounter()

        this.cards = []
        _.each(_.range(9), index => {
            let text = this.createCardText(index)
            text.index = index
            text.inputEnabled = true
            text.events.onInputUp.add(this.cardClick, this)

            this.cards.push(text)
        }, this)

        this.program = []
        _.each(_.range(5), index => {
            let text = this.createInstructionText(index)
            text.index = index
            text.inputEnabled = true
            text.events.onInputUp.add(this.programClick, this)

            this.program.push(text)
        }, this)

        this.btnReady = this.createBtnReady(10, 340)
        this.btnReady.inputEnabled = false
        this.btnReady.events.onInputUp.add(this.btnReadyClick, this)

        this.refreshTexts()
    }

    createMap() {
        let left = 0;
        let top = game.height / 2.0;

        let width = game.width / game.datas.board.length;
        let height = width * 2 / 3.0

        for(let x=game.datas.board.length-1; x>=0; x--) {
            for(let y=0; y<game.datas.board[x].length; y++) {
                let position = {
                    x : left + (width / 2.0 * y) + (width / 2.0 * x),
                    y : top + (height / 3.0 * y) - (height / 3.0 * x)
                }
                let boxType = 'default';
                switch (game.datas.board[x][y].type) {
                    case 4:
                        boxType = 'hole'
                        break;
                    default:
                        boxType = 'default'
                }
                if(boxType != 'hole') {
                    let test = game.add.image(position.x, position.y, 'default')
                    // test.anchor.setTo(0, 0.5);
                    // test.scale.setTo(0.2,0.2);
                    test.width = width
                    test.height = height
                }
            }
        }
    }

    clearTexts() {
        _.each(_.range(9), index => {
            this.cards[index].text = ""
        }, this)
        _.each(_.range(5), index => {
            this.program[index].text = ""
        }, this)
    }

    refreshTexts() {
        _.each(game.robot.cards, (card, index) => {
            this.cards[index].setText(this.getCardTypeName(card))
        }, this)
        _.each(game.robot.program, (card, index) => {
            this.program[index].setText(this.getCardTypeName(card))
        }, this)
    }

    createCardText(index) {
        return this.createText(10, 40 + (index * 30))
    }

    createInstructionText(index) {
        return this.createText(10 + (game.width / 2), 40 + (index * 30))
    }

    createText(posX, posY) {
        return game.add.text(posX, posY, "", {
            font: "20px Arial",
            fill: "#ffffff",
            align: "center"
        })
    }

    createBtnReady(posX, posY) {
        return game.add.text(posX, posY, "", {
            font: "20px Arial",
            fill: "#ffffff",
            align: "center"
        })
    }

    render() {
        // this.counter.text = this.getCounter()
    }

    getCounter() {
        if(!this.isTime()) {
            return "0:00"
        }
        let diff = this.getTimeDiff()
        return [diff.minutes(), diff.seconds()].join(':')
    }

    getTimeDiff() {
        return moment.duration(-moment().diff(game.datas.deadline))
    }

    isTime() {
        return this.getTimeDiff().asMinutes() > 0
    }

    getCardTypeName(card) {
        let text = card.priority + " "
        switch (card.type) {
            case 0: text += "U-Turn"
                break
            case 1: text += "Rotate left"
                break
            case 2: text += "Rotate right"
                break
            case 3: text += "Back-up"
                break
            case 4: text += "Move 1"
                break
            case 5: text += "Move 2"
                break
            case 6: text += "Move 3"
                break
            default: text += "(Unknow)"
        }
        return text
    }

    cardClick(text) {
        if((text.text != "") && (game.robot.program.length < 5) && this.isTime()) {
            let card = game.robot.cards[text.index]
            game.robot.cards.splice(text.index, 1);
            game.robot.program.push(card)
            // test if button ready must be enable
            if( game.robot.program.length == 5 ) {
              this.btnReady.inputEnabled = true
              this.btnReady.text = "Ready !"
            }
            else {
              this.btnReady.inputEnabled = false
              this.btnReady.text = ""
            }

            this.emitProgram()
        }
    }

    programClick(text) {
        if((text.text != "") && this.isTime()) {
            let card = game.robot.program[text.index]
            game.robot.program.splice(text.index, 1);
            game.robot.cards.push(card)
            this.emitProgram()
            // test if button ready must be enable
            if(game.robot.program.length < 5){
              this.btnReady.inputEnabled = false
              this.btnReady.text = ""
            }
        }
    }

    btnReadyClick() {
        window.socket.emit('client:compile')
        console.info('client:compile')

        _.each(this.cards, card => {
            card.inputEnabled = false
        })
        _.each(this.program, ligne => {
            ligne.inputEnabled = false
        })
    }

    emitProgram() {
        window.socket.emit('client:program', game.robot.program)
        console.info('client:program')

        this.clearTexts()
        this.refreshTexts()
    }
}
