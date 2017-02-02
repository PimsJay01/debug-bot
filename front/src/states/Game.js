// import Phaser from 'phaser'

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
