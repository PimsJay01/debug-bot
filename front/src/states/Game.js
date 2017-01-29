import Phaser from 'phaser'

import io from 'socket.io-client'
let socket = io(`http://localhost:7777`)

export default class extends Phaser.State {

    init () {
        console.info('game:init')
    }

    preload () {
        this.stage.backgroundColor = '#0000FF'
    }

    create () {}

    render () {}
}
