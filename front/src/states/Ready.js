import Phaser from 'phaser'
import { res } from '../res'

export default class extends Phaser.State {

    init() {
        console.info('ready:init')
    }

    preload() {
        this.stage.backgroundColor = '#00FF00'

        game.load.image('readyBtn', res.images.readyBtn);
    }

    create() {
        var playButton = game.add.button(game.width/2, game.height/2, 'readyBtn', this.emitReady, this);
        playButton.anchor.setTo(0.5);
        playButton.scale.setTo(0.55,0.55);

        game.add.text(40, 40, 'Are you ready ?', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)
    }

    render() {}

    emitReady(btn) {
        window.socket.emit('client:ready', game.id)
        console.info('client:ready')
        btn.visible = false
    }
}
