import Phaser from 'phaser'

// import input from '@orange-games/phaser-input'

export default class extends Phaser.State {

    init() {
        console.info('welcome:init')
    }

    preload() {
        this.stage.backgroundColor = '#FF0000'
    }

    create() {
        game.add.text(40, 40, 'Awaiting on others players...', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)

        // TODO Create input for player's name
        this.emitName('Player')
    }

    render() {}

    emitName(name) {
        window.socket.emit('client:name', name)
        console.info('client:name', name)
    }
}
