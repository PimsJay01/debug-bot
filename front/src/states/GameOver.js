import Phaser from 'phaser'

// import input from '@orange-games/phaser-input'

export default class extends Phaser.State {

    init() {
        console.info('gameover:init')
    }

    preload() {
        this.stage.backgroundColor = '#000000'
    }

    create() {
        console.info("you won : ", window.game.youwon)
        let text = window.game.youwon ? "You win" : "You loose"
        game.add.text(40, 40, text, {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)
    }

    render() {}
}
