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
    OBJECTIVE : 10
}

export default class {

    constructor () {
        game.load.image('default', res.tiles.default)
        game.load.image('start1', res.tiles.start1)
        game.load.image('start2', res.tiles.start2)
        game.load.image('start3', res.tiles.start3)
        game.load.image('start4', res.tiles.start4)

        game.load.image('robot1n', res.tiles.robot1n)
        game.load.image('robot1e', res.tiles.robot1e)
        game.load.image('robot1s', res.tiles.robot1s)
        game.load.image('robot1w', res.tiles.robot1w)
    }

    create() {
        this.width = 172
        this.height = 128

        this.map = game.add.group();

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
                    case Type.HOLE:
                        boxType = 'hole'
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

        this.robots = [];
        _.each(_.range(4), () => {
            let robot = []
            _.each(['n', 'e', 's', 'w'], direction => {
                let image = game.add.image(0, 0, 'robot1' + direction)
                image.visible = false

                this.map.add(image)
                robot.push(image)
            })

            this.robots.push(robot)
        })

        var factor = game.width / this.map.width
        this.map.scale = new Phaser.Point(factor, factor)
        this.map.top = (game.height - this.map.height) / 2.0
        this.map.left = 0

        this.animationDone = true;
    }

    getPositionXOnMap(x, y) {
        return (this.width / 2.0 * y) + (this.width / 2.0 * x) + (2 * y) + x;
    }

    getPositionYOnMap(x, y) {
        return (this.height / 3.0 * y) - (this.height / 3.0 * x) + 1;
    }

    isAnimationDone() {
        return this.animationDone;
    }

    focus(robotId) {
        this.animationDone = false;
    }

    render() {
        this.timer
        _.each(game.datas.robots, (robot, indexRobot) => {
            _.each(['n', 'e', 's', 'w'], (direction, indexImage) => {
                this.robots[indexRobot][indexImage].visible = false
            })
            this.robots[indexRobot][robot.direction].visible = true
            this.robots[indexRobot][robot.direction].tint = robot.color
            this.robots[indexRobot][robot.direction].x = this.getPositionXOnMap(robot.position.x, robot.position.y)
            this.robots[indexRobot][robot.direction].y = this.getPositionYOnMap(robot.position.x + 1, robot.position.y)
        })
    }
}
