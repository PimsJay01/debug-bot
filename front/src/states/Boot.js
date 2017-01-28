import Phaser from 'phaser'
import WebFont from 'webfontloader'

import io from 'socket.io-client'
let socket = io(`http://localhost:7777`)

export default class extends Phaser.State {

    init () {
        this.stage.backgroundColor = '#EDEEC9'
        // this.fontsReady = false
        this.fontsLoaded = this.fontsLoaded.bind(this)
    }

    preload () {
        // WebFont.load({
        //   google: {
        //     families: ['Bangers']
        //   },
        //   active: this.fontsLoaded
        // })

        let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
        text.anchor.setTo(0.5, 0.5)

        this.load.image('loaderBg', './assets/images/loader-bg.png')
        this.load.image('loaderBar', './assets/images/loader-bar.png')

        socket.emit('client:name', 'Fuck you')
    }

    render () {}

    fontsLoaded () {
        this.fontsReady = true
    }
}
