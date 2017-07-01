import Phaser from 'phaser'

import Map from '../map'

import _ from 'underscore'

export default class extends Phaser.State {

    init() {
        console.info('gameFlow:init')
    }

    preload() {
        this.stage.backgroundColor = '#FF0000'
        this.map = new Map()
    }

    create() {
        this.map.create()

        game.add.text(40, 40, 'Resolving game flow...', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)

        this.indexFlow = 0;
        this.stepover()
    }

    render() {
        this.map.render()
    }

    stepover() {
        window.socket.emit('client:stepover')
        console.info('client:stepover')
    }
}
