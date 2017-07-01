import Phaser from 'phaser'
import { res } from '../res'

import Map from '../map'

import _ from 'underscore'
import moment from 'moment'

export default class extends Phaser.State {

    init() {
        console.info('game:init')
    }

    preload() {
        this.map = new Map()
        this.stage.backgroundColor = '#0F0F0F'
        this.stage.disableVisibilityChange = true

        game.load.image('card', res.images.card)

        game.load.image('uTurn', res.images.uTurn)
        game.load.image('rotateL', res.images.rotateL)
        game.load.image('rotateR', res.images.rotateR)
        game.load.image('backUp', res.images.backUp)
        game.load.image('move1', res.images.move1)
        game.load.image('move2', res.images.move2)
        game.load.image('move3', res.images.move3)
    }

    create() {
        this.map.create()

        this.width = 128
        this.height = 192

        this.interface = game.add.group()

        game.add.text(0, 0, 'Instructions', {
            font: '32px Arial',
            fill: '#ffffff',
            boundsAlignH: 'left',
            boundsAlignV: 'middle'
        }, this.interface).setTextBounds(8, 0, 5 * this.width, this.height / 2.0)

        this.programLabel = game.add.text(0, 0, 'Program (0/5)', {
            font: '32px Arial',
            fill: '#ffffff',
            boundsAlignH: 'right',
            boundsAlignV: 'middle'
        }, this.interface)
        this.programLabel.setTextBounds(6 * this.width, 0, 5 * this.width - 8, this.height / 2.0)

        this.avatar = game.add.graphics(0, 0)
        this.avatar.beginFill(game.robot.color, 1)
        this.avatar.drawRect(11 * this.width, 0, this.height * 1.5, this.height * 1.5)
        this.avatar.endFill()
        this.interface.add(this.avatar)

        this.btnRun = game.add.text(0, 0, 'Run', {
            font: '128px Arial',
            fill: '#ffffff',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
        }, this.interface)
        this.btnRun.setTextBounds(11 * this.width, 0, 2 * this.width, this.height * 1.5)
        this.btnRun.visible = false
        this.btnRun.inputEnabled = true
        this.btnRun.events.onInputUp.add(this.btnRunClick, this)

        this.cards = []
        this.drawCards()

        this.program = []
        this.drawProgram()

        var factor = game.width / (this.interface.width + 8)
        this.interface.scale = new Phaser.Point(factor, factor)
        this.interface.bottom = game.height - 8
        this.interface.left = 0

        this.gameFlow = []
    }

    refresh() {
        _.each(this.cards, group => {
            group.destroy()
        })
        this.cards = []

        _.each(this.program, group => {
            group.destroy()
        })
        this.program = []

        this.drawCards()
        this.drawProgram()
    }

    drawCards() {
        _.each(game.robot.cards, (card, index) => {
            let group = game.add.group()
            group.inputEnableChildren = true
            group.onChildInputUp.add(this.cardClick, this)

            let image = game.add.image(index * this.width, this.height / 2.0, 'card')
            image.index = index
            group.add(image)

            let action = game.add.image((index + 0.5) * this.width, this.height * 0.9, this.getActionName(card.type))
            action.anchor.x = 0.5
            action.width = this.width * 0.8
            action.height = this.width * 0.8
            action.index = index
            group.add(action)

            let text = game.add.text(0, 0, card.priority, {
                font: '64px Arial',
                fill: '#000000',
                boundsAlignH: 'center'
            }, group)
            text.index = index
            text.setTextBounds(index * this.width, this.height / 1.75, this.width, this.height)

            this.cards.push(group)
            this.interface.add(group)
        }, this)
    }

    cardClick(child) {
        if(game.robot.program.length < 5) {
            let card = game.robot.cards[child.index]
            game.robot.cards.splice(child.index, 1);
            game.robot.program.push(card)

            if(game.robot.program.length == 5) {
              this.btnRun.visible = true
            }

            this.emitProgram()
        }
    }

    drawProgram() {
        this.programLabel.setText('Program ('+game.robot.program.length+'/5)')
        _.each(game.robot.program, (line, index) => {
            let group = game.add.group()
            group.inputEnableChildren = true
            group.onChildInputUp.add(this.lineClick, this)

            let width = (11 - game.robot.program.length + index) * this.width
            let image = game.add.image(width, this.height / 2.0, 'card')
            image.index = index
            group.add(image)

            let action = game.add.image(width + 0.5 * this.width, this.height * 0.9, this.getActionName(line.type))
            action.anchor.x = 0.5
            action.width = this.width * 0.8
            action.height = this.width * 0.8
            action.index = index
            group.add(action)

            let text = game.add.text(0, 0, line.priority, {
                font: '64px Arial',
                fill: '#000000',
                boundsAlignH: 'center'
            }, group)
            text.index = index
            text.setTextBounds(width, this.height / 1.75, this.width, this.height)

            this.program.push(group)
            this.interface.add(group)
        }, this)
    }

    lineClick(child) {
        let line = game.robot.program[child.index]
        game.robot.program.splice(child.index, 1);
        game.robot.cards.push(line)

        if(game.robot.program.length < 5) {
          this.btnRun.visible = false
        }

        this.emitProgram()
    }

    getActionName(cardType) {
        let actionName = ''
        switch(cardType) {
            case 0 :
                actionName = 'uTurn'
            break;
            case 1 :
                actionName = 'rotateL'
            break;
            case 2 :
                actionName = 'rotateR'
            break;
            case 3 :
                actionName = 'backUp'
            break;
            case 4 :
                actionName = 'move1'
            break;
            case 5 :
                actionName = 'move2'
            break;
            case 6 :
                actionName = 'move3'
            break;
        }
        return actionName;
    }

    refreshTexts() {
        _.each(game.robot.cards, (card, index) => {
            this.cards[index].setText(this.getCardTypeName(card))
        }, this)
        _.each(game.robot.program, (card, index) => {
            this.program[index].setText(this.getCardTypeName(card))
        }, this)
    }

    render() {
        this.map.render()
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

    btnRunClick() {
        this.btnRun.inputEnabled = false

        window.socket.emit('client:compile')
        console.info('client:compile')

        _.each(this.cards, card => {
            card.getAt(0).tint = 0x7F7F7F
            card.getAt(1).tint = 0x7F7F7F
            card.getAt(0).inputEnabled = false
            card.getAt(1).inputEnabled = false
            card.getAt(2).inputEnabled = false
        })
        _.each(this.program, line => {
            line.getAt(0).tint = 0x7F7F7F
            line.getAt(1).tint = 0x7F7F7F
            line.getAt(0).inputEnabled = false
            line.getAt(1).inputEnabled = false
            line.getAt(2).inputEnabled = false
        })

        this.btnRun.visible = false
    }

    emitProgram() {
        window.socket.emit('client:program', game.robot.program)
        console.info('client:program')

        // this.clearTexts()
        this.refresh()
    }
}
