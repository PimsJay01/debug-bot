import Phaser from 'phaser'

// import input from '@orange-games/phaser-input'

export default class extends Phaser.State {

    init() {
        console.info('gameFlow:init')
    }

    preload() {
        this.stage.backgroundColor = '#FF0000'
    }

    create() {
        game.add.text(40, 40, 'Resolving game flow...', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)

        // TODO Create input for player's name
        this.gameover()
    }

    render() {}

    gameover() {
        window.socket.emit('client:gameover')
        console.info('client:gameover')
    }
}
