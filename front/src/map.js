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
import { res } from './res'

import _ from 'underscore'

const Type = {
    DEFAULT : 0,
    START_1 : 1,
    START_2 : 2,
    START_3 : 3,
    START_4 : 4,
    TRAVELATOR_S_N : 5,
    TRAVELATOR_W_E : 6,
    TRAVELATOR_N_S : 7,
    TRAVELATOR_E_W : 8,
    HOLE : 9,
    TARGET : 10
}

export default class {

    constructor () {
        game.load.image('background', res.images.background)

        game.load.image('default', res.tiles.default)
        game.load.image('start1', res.tiles.start1)
        game.load.image('start2', res.tiles.start2)
        game.load.image('start3', res.tiles.start3)
        game.load.image('start4', res.tiles.start4)
        game.load.image('travelatorWE', res.tiles.travelatorWE)
        game.load.image('travelatorNS', res.tiles.travelatorNS)
        game.load.image('travelatorEW', res.tiles.travelatorEW)
        game.load.image('travelatorSN', res.tiles.travelatorSN)
        game.load.image('target', res.tiles.target)

        game.load.image('wallN', res.tiles.wallN)
        game.load.image('wallE', res.tiles.wallE)
        game.load.image('wallS', res.tiles.wallS)
        game.load.image('wallW', res.tiles.wallW)

        game.load.image('robot1n', res.tiles.robot1n)
        game.load.image('robot1e', res.tiles.robot1e)
        game.load.image('robot1s', res.tiles.robot1s)
        game.load.image('robot1w', res.tiles.robot1w)
    }

    create() {
        this.width = 172
        this.height = 128

        let background = game.add.image(0, 0, 'background')

        //background.x = 0
        //background.y = 0
        background.height = game.height
        background.widht = game.width

        this.map = game.add.group()

        for(let x=game.datas.board.length-1; x>=0; x--) {
            for(let y=0; y<game.datas.board[x].length; y++) {
                let position = {
                    x : this.getPositionXOnMap(x, y),
                    y : this.getPositionYOnMap(x, y)
                }
                let boxType = 'default';
                switch (game.datas.board[x][y].type) {
                    case Type.START_1:
                        boxType = 'start1'
                        break;
                    case Type.START_2:
                        boxType = 'start2'
                        break;
                    case Type.START_3:
                        boxType = 'start3'
                        break;
                    case Type.START_4:
                        boxType = 'start4'
                        break;
                    case Type.TRAVELATOR_S_N:
                        boxType = 'travelatorSN'
                        break;
                    case Type.TRAVELATOR_W_E:
                        boxType = 'travelatorWE'
                        break;
                    case Type.TRAVELATOR_N_S:
                        boxType = 'travelatorNS'
                        break;
                    case Type.TRAVELATOR_E_W:
                        boxType = 'travelatorEW'
                        break;
                    case Type.HOLE:
                        boxType = 'hole'
                        break;
                    case Type.TARGET:
                        boxType = 'target'
                        break;
                    default:
                        boxType = 'default'
                }
                if(boxType != 'hole') {
                    let test = game.add.image(position.x, position.y, boxType)

                    this.map.add(test)
                }
            }
        }

        for(let x=game.datas.board.length-1; x>=0; x--) {
            for(let y=0; y<game.datas.board[x].length; y++) {
                let position = {
                    x : this.getPositionXOnMap(x, y),
                    y : this.getPositionYOnMap(x + 1.5, y)
                }

                if(game.datas.board[x][y].walls[0]) {
                    let test = game.add.image(position.x, position.y, 'wallN')
                    this.map.add(test)
                }
                if(game.datas.board[x][y].walls[1]) {
                    let test = game.add.image(position.x, position.y, 'wallE')
                    this.map.add(test)
                }
                if(game.datas.board[x][y].walls[2]) {
                    let test = game.add.image(position.x, position.y, 'wallS')
                    this.map.add(test)
                }
                if(game.datas.board[x][y].walls[3]) {
                    let test = game.add.image(position.x, position.y, 'wallW')
                    this.map.add(test)
                }
            }
        }

        this.robots = [];
        this.lifes = [];
        _.each(game.datas.robots, robot => {
            let robotImages = []
            _.each(['n', 'e', 's', 'w'], direction => {
                let image = game.add.image(0, 0, 'robot1' + direction)
                image.visible = false

                this.map.add(image)
                robotImages.push(image)
            })

            let graphics = game.add.graphics(this.width, this.width / 16);
            this.map.add(graphics)
            this.lifes[robot.id] = graphics

            this.robots[robot.id] = robotImages
        })

        this.laser = game.add.graphics(0, 0);
        this.map.add(this.laser)

        var factor = game.width / this.map.width
        this.map.scale = new Phaser.Point(factor, factor)
        this.map.top = 0
        this.map.left = 0
    }

    getPositionXOnMap(x, y) {
        return (this.width / 2.0 * y) + (this.width / 2.0 * x) + (2 * y) + x;
    }

    getPositionYOnMap(x, y) {
        return (this.height / 3.0 * y) - (this.height / 3.0 * x) + 1;
    }

    render() {
        // TODO sort robot before display them
        _.each(game.datas.robots, robot => {
            _.each(['n', 'e', 's', 'w'], (direction, indexImage) => {
                this.robots[robot.id][indexImage].visible = false
            })
            let temp = this.robots[robot.id][robot.direction]
            temp.visible = true
            temp.tint = robot.color
            temp.x = this.getPositionXOnMap(robot.position.x, robot.position.y)
            temp.y = this.getPositionYOnMap(robot.position.x + 1, robot.position.y)
            this.displayLife(robot, temp.x, temp.y)
        })

        if(_.random(0, 2) == 0) {
            this.laser.visible = false
        }
        else {
            this.laser.visible = true
        }
    }

    displayLife(robot, x, y) {
        let graphics = this.lifes[robot.id]
        graphics.clear()
        graphics.beginFill(0xFF0000, 1)
        let size = (graphics.x / 5.0) - 8;
        _.each(_.range(robot.health), index => {
            graphics.drawRect(x - this.width + (index * (size + 8)), y - (this.height / 4.0), size, graphics.y)
        })
        graphics.endFill()
    }

    displayLaser(robot) {
        let start = {
            x : this.getPositionXOnMap(robot.position.x, robot.position.y) + this.width / 2.0,
            y : this.getPositionYOnMap(robot.position.x + 1, robot.position.y) + this.height / 2.0
        }
        this.laser.lineStyle(8, robot.color, 1)
        this.laser.moveTo(start.x, start.y)

        // console.info(game.datas.board)
        let max = {
            x : game.datas.board.length,
            y : game.datas.board[0].length
        }

        let dest = { x : 0, y : 0}
        switch(robot.direction) {
            case 0 :
                dest = {
                    x : this.getPositionXOnMap(robot.position.x, -(robot.position.x + 1)) + this.width / 2.0,
                    y : this.getPositionYOnMap(robot.position.x + 1, -(robot.position.x + 1)) + this.height / 2.0
                }
            break
            case 1 :
                dest = {
                    x : this.getPositionXOnMap(max.x + max.y, robot.position.y) + this.width / 2.0,
                    y : this.getPositionYOnMap(max.x + max.y + 1, robot.position.y) + this.height / 2.0
                }
            break
            case 2 :
                dest = {
                    x : this.getPositionXOnMap(robot.position.x, max.x + max.y) + this.width / 2.0,
                    y : this.getPositionYOnMap(robot.position.x + 1, max.x + max.y) + this.height / 2.0
                }
            break
            case 3 :
                dest = {
                    x : this.getPositionXOnMap(-(robot.position.y + 1), robot.position.y) + this.width / 2.0,
                    y : this.getPositionYOnMap(-(robot.position.y + 1) + 1, robot.position.y) + this.height / 2.0
                }
            break
        }
        this.laser.lineTo(dest.x, dest.y)
    }

    hideLaser() {
        this.laser.clear()
    }
}
