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

        var factor = game.width / this.map.width
        this.map.scale = new Phaser.Point(factor, factor)
        this.map.top = 0
        this.map.left = 0

        this.animationDone = true;
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
}
