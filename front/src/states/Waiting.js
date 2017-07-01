import Phaser from 'phaser'
import { res } from '../res'

import Map from '../map'

export default class extends Phaser.State {

    init() {
        console.info('ready:init')
    }

    preload() {
        this.stage.backgroundColor = '#000000'
        this.map = new Map()

        game.load.image('readyBtn', res.images.readyBtn);
    }

    create() {
        this.map.create()


    }

    render() {}

    emitReady(btn) {
        window.socket.emit('client:ready', game.id)
        console.info('client:ready')
        btn.visible = false
    }
}
