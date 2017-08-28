/*
Copyright 2017 Arnaud Beguin, Amelie Fiocca, Loic Poisot, Jeremy Gobet and Pierre Kunzli

This file is part of Debug Bot.

Debug Bot is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Foobar is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Debug Bot.  If not, see <http://www.gnu.org/licenses/>.
*/


import Phaser from 'phaser'
import { res } from '../res'

import Map from '../map'

export default class extends Phaser.State {

    init() {
        console.info('ready:init')
    }

    preload() {
        this.stage.backgroundColor = '#000000'
        this.stage.disableVisibilityChange = true
        this.map = new Map()

        game.load.image('readyBtn', res.images.readyBtn);
    }

    create() {
        this.map.create()


    }

    render() {}

    emitReady(btn) {
        window.socket.emit('client:ready', game.id)
        console.info('client:ready')
        btn.visible = false
    }
}
