import Phaser from 'phaser'

import _ from 'underscore'

export default class extends Phaser.State {

    init() {
        console.info('game:init')
    }

    preload() {
        this.stage.backgroundColor = '#0000FF'
    }

    create() {
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

        this.refreshTexts()
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
        return game.add.text(10, 10 + (index * 40), "", {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })
    }
    createInstructionText(index) {
        return game.add.text(10 + game.width/2, 10 + (index * 40), "", {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })
    }

    render() {
        // text[idx].setText('Counter ' + idx + ' = ' + counters[idx]);
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
        if((text.text != "") && (game.robot.program.length < 5)) {
            let card = game.robot.cards[text.index]
            game.robot.cards.splice(text.index, 1);
            game.robot.program.push(card)
            this.emitProgram()
        }
    }

    programClick(text) {
        if(text.text != "") {
            let card = game.robot.program[text.index]
            game.robot.program.splice(text.index, 1);
            game.robot.cards.push(card)
            this.emitProgram()
        }
    }

    emitProgram() {
        window.socket.emit('client:program', game.robot.program)
        console.info('client:program')

        this.clearTexts()
        this.refreshTexts()
    }
}
