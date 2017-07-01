import Phaser from 'phaser'
import { res } from './res'

import _ from 'underscore'

export default class {

    constructor () {
        game.load.image('card', res.images.card)
    }

    create() {
        this.width = 128
        this.height = 192

        this.interface = game.add.group()

        
    }

    render() {

    }
}
