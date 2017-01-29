import Phaser from 'phaser'

import io from 'socket.io-client'
let socket = io(`http://localhost:7777`)

export default class extends Phaser.State {

    init () {
        console.info('welcome:init')
    }

    preload () {
        this.stage.backgroundColor = '#FF0000'
    }

    create () {
        this.emitName('Player')
    }

    render () {}

    emitName(name) {
        socket.emit('client:name', name)
        console.info('client:name', name)
    }
}
