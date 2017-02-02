import Phaser from 'phaser'
import { res } from '../res'

export default class extends Phaser.State {

    init () {
        console.info('ready:init')
    }

    preload () {
        this.stage.backgroundColor = '#00FF00'

        this.game.load.image('readyBtn', res.images.readyBtn);
    }

    create () {
        var playButton = this.game.add.button(this.game.width/2, this.game.height/2, 'readyBtn', this.emitReady, this);
        playButton.anchor.setTo(0.5);
        playButton.scale.setTo(0.55,0.55);

        game.add.text(40, 40, 'Are you ready ?', {
            font: "32px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)
    }

    render () {}

    emitReady() {
        window.socket.emit('client:ready', this.game.id)
        console.info('client:ready')
    }
}
