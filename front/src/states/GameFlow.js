import Phaser from 'phaser'
import { res } from '../res'

import Map from '../map'


import _ from 'underscore'

export default class extends Phaser.State {

    init() {
        console.info('gameFlow:init')
    }

    preload() {
        this.map = new Map()
        this.stage.backgroundColor = '#FF0000'
        this.stage.disableVisibilityChange = true

        game.load.audio('laserSound', res.sounds.laser);

        game.load.image('card', res.images.card)

        game.load.image('uTurn', res.images.uTurn)
        game.load.image('rotateL', res.images.rotateL)
        game.load.image('rotateR', res.images.rotateR)
        game.load.image('backUp', res.images.backUp)
        game.load.image('move1', res.images.move1)
        game.load.image('move2', res.images.move2)
        game.load.image('move3', res.images.move3)

        game.load.image('avatar_silhouette', res.images.avatar_silhouette)
        game.load.image('avatar_lavander', res.images.avatar_lavander)
        game.load.image('avatar_fluffy', res.images.avatar_fluffy)
        game.load.image('avatar_skurts', res.images.avatar_skurts)
    }

    create() {
        this.map.create()

        // window.game.add.text(40, 40, 'Resolving game flow...', {
        //     font: "24px Arial",
        //     fill: "#ffffff",
        //     align: "center"
        // })//.anchor.setTo(0.5, 0)
        this.laserSound = game.add.audio('laserSound')
        this.width = 128
        this.height = 192

        this.interface = game.add.group()
        let firstRobot = _.find(game.datas.robots, robot => robot.id == game.flow[0].robotId)

        this.drawInterface(game.robot)

        this.indexFlow = 0;
        this.interval = setInterval(() => {
            this.map.hideLaser()
            if(game.flow.length > this.indexFlow) {
                let command = game.flow[this.indexFlow]
                let robot = _.find(game.datas.robots, robot => robot.id == command.robotId)
                // let robot = _.find(window.game.datas.robots, robot => robot.id == command.robotId)

                switch(command.action) {
                    case 0 :
                        robot.position.y--
                        break;
                    case 1 :
                        robot.position.x++
                        break;
                    case 2 :
                        robot.position.y++
                        break;
                    case 3 :
                        robot.position.x--
                        break;
                    case 4 :
                        robot.direction = (robot.direction + 1) % 4
                        break;
                    case 5 :
                        robot.direction = (robot.direction + 3) % 4
                        break;
                    case 6 :
                        robot.direction = (robot.direction + 2) % 4
                        break;
                    case 8 : // remove life
                        robot.health--
                        break;
                    case 9 : // laser fire
                        this.laserSound.play()
                        this.map.displayLaser(robot)
                        break;
                }
                this.indexFlow++;
                // let nextCommand = game.flow[this.indexFlow]
                // if(nextCommand.action != 8) {
                //     let nextRobot = _.find(game.datas.robots, robot => robot.id == nextCommand.robotId)
                //     console.info(nextRobot.program)
                //     // this.refresh(nextRobot.program)
                // }
            }
            else {
                console.log('interval cleared')
                clearInterval(this.interval)

                this.stepover()
            }
        }, 1000)
    }

    drawInterface(robot) {
        // this.interface.removeChildren()

        game.add.text(0, 0, 'Resolution...', {
            font: '32px Arial',
            fill: '#ffffff',
            boundsAlignH: 'left',
            boundsAlignV: 'middle'
        }, this.interface).setTextBounds(8, 0, 5 * this.width, this.height / 2.0)

        this.coloravatar = game.add.graphics(0, 0)
        this.coloravatar.beginFill(robot.color, 1)
        this.coloravatar.drawRect(11 * this.width, 0, this.height * 1.5, this.height * 1.5)
        this.coloravatar.endFill()
        this.interface.add(this.coloravatar)
        let avatarNames = ['avatar_fluffy', 'avatar_lavander', 'avatar_silhouette', 'avatar_skurts']
        this.avatar = game.add.image(11.15 * this.width, 20, avatarNames[robot.avatarId])
        this.interface.add(this.avatar)

        this.program = []
        this.drawProgram(robot.program)

        var factor = game.width / (this.interface.width + 8)
        this.interface.scale = new Phaser.Point(factor, factor)
        this.interface.bottom = game.height - 8
        this.interface.left = 0
    }

    refresh(program) {
        _.each(this.program, group => {
            group.destroy()
        })
        this.program = []

        this.drawProgram(program)
    }

    drawProgram(program) {
        _.each(program, (line, index) => {
            let group = game.add.group()

            let width = (11 - program.length + index) * this.width
            let image = game.add.image(width, this.height / 2.0, 'card')
            image.index = index
            group.add(image)

            let action = game.add.image(width + 0.5 * this.width, this.height * 0.9, this.getActionName(line.type))
            action.anchor.x = 0.5
            action.width = this.width * 0.8
            action.height = this.width * 0.8
            action.index = index
            group.add(action)

            let text = game.add.text(0, 0, line.priority, {
                font: '64px Arial',
                fill: '#000000',
                boundsAlignH: 'center'
            }, group)
            text.index = index
            text.setTextBounds(width, this.height / 1.75, this.width, this.height)

            this.program.push(group)
            this.interface.add(group)
        }, this)
    }

    getActionName(cardType) {
        let actionName = ''
        switch(cardType) {
            case 0 :
                actionName = 'uTurn'
            break;
            case 1 :
                actionName = 'rotateL'
            break;
            case 2 :
                actionName = 'rotateR'
            break;
            case 3 :
                actionName = 'backUp'
            break;
            case 4 :
                actionName = 'move1'
            break;
            case 5 :
                actionName = 'move2'
            break;
            case 6 :
                actionName = 'move3'
            break;
        }
        return actionName;
    }

    render() {
        this.map.render()
    }

    stepover() {
        let text = 'client:stepover sent by ' + game.robot.id
        window.socket.emit('client:stepover', game.robot)
        console.info(text)
    }
}
