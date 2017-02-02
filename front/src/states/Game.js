import Phaser from 'phaser'

export default class extends Phaser.State {

    init () {
        console.info('game:init')
    }

    preload () {
        this.stage.backgroundColor = '#0000FF'
    }

    create () {
        for(let i = 0; i<game.robot.cards.length; i++) {
            var text = game.robot.cards[i].type + ' ' + game.robot.cards[i].priority
            game.add.text(40, 40 + (i * 40), text, {
                font: "32px Arial",
                fill: "#ffffff",
                align: "center"
            })
        }
    }

    render () {}
}
