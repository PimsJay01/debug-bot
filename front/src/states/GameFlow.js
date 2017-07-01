import Phaser from 'phaser'

import Map from '../map'

import _ from 'underscore'

export default class extends Phaser.State {

    init() {
        console.info('gameFlow:init')
    }

    preload() {
        this.stage.backgroundColor = '#FF0000'
        this.map = new Map()
    }

    create() {
        this.map.create()

        game.add.text(40, 40, 'Resolving game flow...', {
            font: "24px Arial",
            fill: "#ffffff",
            align: "center"
        })//.anchor.setTo(0.5, 0)

        this.indexFlow = 0;
        this.interval = setInterval(() => {
            if(game.flow.length > this.indexFlow) {
                let command = game.flow[this.indexFlow]
                console.info('command', command)
                let robot = _.find(game.datas.robots, robot => robot.id == command.robotId)
                console.info('robot', robot)
                switch(command.action) {
                    case 0 :
                        robot.position.y--;
                        break;
                    case 1 :
                        robot.position.x++;
                        break;
                    case 2 :
                        robot.position.y++;
                        break;
                    case 3 :
                        robot.position.x--;
                        break;
                    case 4 :
                        robot.direction = (robot.direction + 1) % 4;
                        break;
                    case 5 :
                        robot.direction = (robot.direction + 3) % 4;
                        break;
                    case 6 :
                        robot.direction = (robot.direction + 2) % 4;
                        break;
                }
                this.indexFlow++;
            }
            else {
                console.log('interval cleared')
                clearInterval(this.interval)

                this.stepover()
            }
        }, 1000)
    }

    render() {
        // if(this.map.isAnimationDone()) {
        //     if(game.flow.length > indexFlow) {
        //         this.map.focus(game.flow[this.indexFlow].robotId, () => {
        //             game.robot.position.x++
        //         })
        //         this.indexFlow++;
        //         this.map.render()
        //     }
        //     else {
        //         this.stepover()
        //     }
        // }
        // else {
            this.map.render()
        // }
    }

    stepover() {
        window.socket.emit('client:stepover')
        console.info('client:stepover')
    }
}
