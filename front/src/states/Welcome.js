import Phaser from 'phaser'

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
        window.socket.emit('client:name', name)
        console.info('client:name', name)
    }
}
