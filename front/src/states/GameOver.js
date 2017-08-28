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

// import input from '@orange-games/phaser-input'

export default class extends Phaser.State {

    init() {
        console.info('gameover:init')
    }

    preload() {
        this.stage.backgroundColor = '#000000'
        this.stage.disableVisibilityChange = true
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
