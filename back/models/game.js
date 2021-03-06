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


var _ = require('underscore')

var config = require('./../config')

var Box = require('./box')
var Deck = require('./deck')
var Command = require('./../models/command')
var Types = require('./../models/types')
var Robot = require('./../models/robot')

const initalPositions = [
    {x: 0, y: 3},
    {x: 0, y: 5},
    {x: 0, y: 1},
    {x: 0, y: 7}
]

const initalColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFFFF]
const initalFills = ['#ff0000', '#00ff00', '#0000ff', '#ffffff']

module.exports = class Game {
    constructor() {
        this.robots = []
        this.board = initBoard()
        this.started = false
        this.deck = new Deck()
        this.currentTurn = 0
        this.types = new Types()
        this['maxPlayers'] = config.maxPlayers;
    }
    isStarted() {
        return this.started
    }
    addRobot(robot) {
        if(this.robots.length < config.maxPlayers) {
            robot.color = initalColors[this.robots.length]
            robot.fill = initalFills[this.robots.length]
            robot.position = Object.assign({},initalPositions[this.robots.length])
            robot.initialPosition = Object.assign({},initalPositions[this.robots.length])
            this.robots.push(robot)
            this.started = this.robots.length >= config.maxPlayers
            return true
        }
        return false
    }
    removeRobot(id) {
        let robot = this.getRobot(id)
        if(robot != null) {
            this.deck.addCards(robot.cards)
        }
        this.robots = _.filter(this.robots, robot => robot.id != id)
    }
    getRobot(id){
        return _.find(this.robots, robot => robot.id == id)
    }
    setRobotReady(id){
        let robot = this.getRobot(id)
        if(!_.isUndefined(robot)) {
            robot.ready = true;
        }
    }
    isRobotsReady(){
        if(this.robots.length == config.maxPlayers) {
            return _.every(this.robots, robot => robot.ready)
        }
        return false;
    }

    filterCards(robot) {
        let diff = []
        _.each(robot.cards, card => {
            let isNotInProgram = true
            _.each(robot.program, program => {
                if (card.id == program.id) {
                  isNotInProgram = false
                }
            })
            if (isNotInProgram) {
                diff.push(card)
            }
        })
        return diff
    }

    distributeCards(){
        _.each(this.robots, robot => {
            robot.cards = this.filterCards(robot)
            robot.cards = this.deck.completeCards(robot.cards)
            this.deck.addCards(robot.program)
            robot.program = []
        })
        console.info("DISTRIBUTE CARD, size of the deck after distribution : ", this.deck.cards.length);
    }


    setRobotAnimationEnded(robotId) {
        let robot = this.getRobot(robotId)
        robot.animationEnded = true
        return _.every(this.robots, r => r.animationEnded)
    }

    setRobotCompiled(robotId) {
        let robot = this.getRobot(robotId)
        robot.compiled = true
        return _.every(this.robots, robot => robot.compiled)
    }

    // Sorted programs by priorities for each tour
    getProgramsSorted() {
      let sortedPrograms = []
      _.each(_.range(5), index => {
        let temp = []
        _.each(this.robots, robot => {
          temp.push({
            'robotId' : robot.id,
            'line' : robot.program[index]
          })
        })
        console.info('DEBUG : ', temp)
        sortedPrograms.push(_.sortBy(temp, step => {
          return -step.line.priority
        }))
      })
      return _.flatten(sortedPrograms)
    }

    resolveTurn() {
      let programs = this.getProgramsSorted()
      let commands = []
      let index = 0
      let nbStep = 0
      console.info("RESOLVE TURN : ", this.currentTurn);
      _.each(programs, program => {
        let robot = this.getRobotById(program.robotId)
        if (!robot.felt && robot.health > 0) {
          switch (program.line.type) {
            case this.types.CardType.U_TURN:
              robot.uTurn()
              commands.push(new Command(program.robotId, program.line.id, this.types.MovementType.U_TURN))
              break
            case this.types.CardType.ROTATE_LEFT:
              robot.turnLeft()
              commands.push(new Command(program.robotId, program.line.id, this.types.MovementType.TURN_LEFT))
              break
            case this.types.CardType.ROTATE_RIGHT:
              robot.turnRight()
              commands.push(new Command(program.robotId, program.line.id, this.types.MovementType.TURN_RIGHT))
              break
            case this.types.CardType.BACK_UP:
              if (this.tryBackup(robot) > 0) {
                robot.backUp()
                commands.push(new Command(program.robotId, program.line.id, robot.getReverseDirection()))
              }
              break
            case this.types.CardType.MOVE_1:
              nbStep = this.tryMove(robot, 1)
              console.info("de combien t'avance ", nbStep)
              robot.moveXSteps(nbStep)
              _.each(_.range(nbStep), index => {
                  console.info(index, "/", nbStep)
                  commands.push(new Command(program.robotId, program.line.id, robot.direction))
              })
              break
            case this.types.CardType.MOVE_2:
              nbStep = this.tryMove(robot, 2)
              console.info("de combien t'avance ", nbStep)
              robot.moveXSteps(nbStep)
              _.each(_.range(nbStep), index => {
                  console.info(index, "/", nbStep)
                  commands.push(new Command(program.robotId, program.line.id, robot.direction))
              })
              break
            case this.types.CardType.MOVE_3:
              nbStep = this.tryMove(robot, 3)
              console.info("de combien t'avance ", nbStep)
              robot.moveXSteps(nbStep)
              _.each(_.range(nbStep), index => {
                  console.info(index, "/", nbStep)
                  commands.push(new Command(program.robotId, program.line.id, robot.direction))
              })
              break
            default:
              break
          }



          let travel = this.travelator(robot.position)
          robot.move(travel, 1)
          if (travel != this.types.MovementType.STAY) {
            commands.push(new Command(program.robotId, program.line.id, travel))
          }

          let newCommands = this.fireLaser(robot,program.line.id)
          _.each(newCommands, command => {
            commands.push(command)
          })


        } /*else {
          robot.position = Object.assign({}, robot.initialPosition)
          robot.direction = this.types.MovementType.EAST
        }*/

      })
      _.each(this.robots, robot => {
        console.log(robot.id, robot.felt ? "je suis tombé" : "je suis toujours là")
        if (robot.felt || robot.health == 0) {
          robot.health = config.maxHealth
          robot.felt = false
          robot.position = Object.assign({}, robot.initialPosition)
          robot.direction = this.types.MovementType.EAST
        }
        if (this.hasWon(robot.position)) {
          robot.winner = true
        }
      })
      return commands;
    }

    fireLaser(myRobot, idProg){
      console.log("start fire laser for robot ", myRobot.id)
      let commands = []
      if(!myRobot.felt && myRobot.health > 0){
        switch(myRobot.direction){
        case  this.types.MovementType.NORTH:
          _.each(this.robots, robot => {
            if((robot.position.y < myRobot.position.y) && (robot.position.x == myRobot.position.x) && this.isInTheMap(robot.position)){
              if(robot.health > 0){
                robot.health--;
                commands.push(new Command(myRobot.id, idProg, this.types.MovementType.FIRELASER))
                commands.push(new Command(robot.id, idProg, this.types.MovementType.REMOVELIFE))
                console.log("robot ", myRobot.id, " shoots one laser in the NORTH direction to robot ", robot.id)
              }
            }
          })
          break;
        case  this.types.MovementType.SOUTH:
          _.each(this.robots, robot => {
            if((robot.position.y > myRobot.position.y) && (robot.position.x == myRobot.position.x) && this.isInTheMap(robot.position)){
              if(robot.health > 0){
                robot.health--;
                commands.push(new Command(myRobot.id, idProg, this.types.MovementType.FIRELASER))
                commands.push(new Command(robot.id, idProg, this.types.MovementType.REMOVELIFE))
                console.log("robot ", myRobot.id, " shoots one laser in the SOUTH direction to robot ", robot.id)
              }
            }
          })
          break;
        case  this.types.MovementType.EAST:
          _.each(this.robots, robot => {
            if((robot.position.x > myRobot.position.x) && (robot.position.y == myRobot.position.y) && this.isInTheMap(robot.position)){
              if(robot.health > 0){
                robot.health--;
                commands.push(new Command(myRobot.id, idProg, this.types.MovementType.FIRELASER))
                commands.push(new Command(robot.id, idProg, this.types.MovementType.REMOVELIFE))
                console.log("robot ", myRobot.id, " shoots one laser in the EAST direction to robot ", robot.id)
              }
            }
          })
          break;
        case  this.types.MovementType.WEST:
          _.each(this.robots, robot => {
            if((robot.position.x < myRobot.position.x) && (robot.position.y == myRobot.position.y) && this.isInTheMap(robot.position)){
              if(robot.health > 0){
                robot.health--;
                commands.push(new Command(myRobot.id, idProg, this.types.MovementType.FIRELASER))
                commands.push(new Command(robot.id, idProg, this.types.MovementType.REMOVELIFE))
                console.log("robot ", myRobot.id, " shoots one laser in the WEST direction to robot ", robot.id)
              }
            }
          })
          break;
        default:
          break
        }
    }
    return commands
    }

    travelator(pos) {
      if(this.isInTheMap(pos)){
        let res = this.board[pos.x][pos.y].type - 5
        if (res < 0 || res > 4) {
          res = this.types.MovementType.STAY
        }
        return res
      }
      return this.types.MovementType.STAY
    }

    isInTheMap(pos) {
      let height = this.board[0].length
      let width = this.board.length
      console.info("board size : ", width, "x", height, " ; testing pos : ", pos)
      if (pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height) {
        return true
      }
      return false
    }

    hasFallen(pos) {
      if(!this.isInTheMap(pos)){
        return true;
      }
      return (this.board[pos.x][pos.y].type == this.types.BoxType.HOLE)
    }

    boxFree(pos) {
      let isFree = true
      /*
      if (!this.isInTheMap(pos)) {
        return false
      }
      */
      _.each(this.robots, robot => {
          if (pos.x == robot.position.x && pos.y == robot.position.y) {
            isFree = false
          }
      })

      return isFree
    }

    isWallOnTheRoad(direction, pos) {
        if (pos.x < this.board.length && pos.x >= 0 && pos.y >= 0 && pos.y < this.board[0].length) {
          return this.board[pos.x][pos.y].walls[direction]
        }
        return false
    }

    tryBackup(robot) {
      let r = new Robot()
      r.position = Object.assign({}, robot.position)
      r.id = robot.id
      r.felt = robot.felt
      r.direction = robot.getReverseDirection()
      return this.tryMove(r, 1)
    }

    tryMove(robot, max) {
        var pos = Object.assign({}, robot.position)
        var nbStep = 0
        var nbStepFall = 100000
        var newPos = {}
        let trueRobot = this.getRobotById(robot.id) // FUCKIN BACK UP
        _.each(_.range(max), step => {
        //trueRobot.felt = !_.every(_.range(2), step => {
          switch(robot.direction) {
            case this.types.MovementType.NORTH:
              newPos = Object.assign({}, {x:pos.x, y:pos.y-1})
              break
            case this.types.MovementType.EAST:
              newPos = Object.assign({}, {x:pos.x+1, y:pos.y})
              break
            case this.types.MovementType.SOUTH:
              newPos = Object.assign({}, {x:pos.x, y:pos.y+1})
              break
            case this.types.MovementType.WEST:
              newPos = Object.assign({}, {x:pos.x-1, y:pos.y})
              break
          }
          if (this.boxFree(newPos) &&
              !this.isWallOnTheRoad(robot.direction, pos) &&
              !this.isWallOnTheRoad(robot.getReverseDirection(), newPos)) {
            nbStep ++
            pos = Object.assign({}, newPos)
          }
          if (this.hasFallen(pos)) {
            console.info("pos ", pos, " is outside of the map")
            if(!trueRobot.felt) {
                trueRobot.felt = true
                nbStepFall = nbStep
            }
          }
        })
        return Math.min(nbStep, nbStepFall)
    }

    getRobotById(robotId) {
      let res
      _.each(this.robots, robot => {
        if (robot.id == robotId) {
          res = robot
        }
      })
      return res
    }

    hasWon(pos) {
      if(this.isInTheMap(pos)){
        if (this.board[pos.x][pos.y].type == this.types.BoxType.TARGET) {
          return true
        }
      }
      return false
    }
}

function initBoard() {
    let board = require("../boards/" + config.boardId)
    let height = _.size(board.data) / 3
    let width = _.size(board.data[0])
    let temp = []
    for (let x = 0; x < width; x++) {
        temp[x] = []
        for (let y = 0; y < height; y++) {
            temp[x][y] = getBox(board.data[(y*3)][x], board.data[(y*3)+1][x], board.data[(y*3)+2][x])
        }
    }
    console.info('board', temp)
    return temp;
}

function getBox(line1, line2, line3) {
    let types = new Types()
    let walls = getBoxWalls(line1, line2, line3)
    if(line2.includes("||")) {
        if(line1.includes("||")) {
            // travelator from north to south
            if(line3.includes(" vv "))
                return new Box(types.BoxType.TRAVELATOR_N_S, walls)
            // // travelator from north to east
            // if(line2.includes(">"))
            //     return new Box(3, 90, walls)
            // // travelator from north to west
            // if(line2.includes("<"))
            //     return new Box(2, 270, walls)
        }
        if(line3.includes("||")) {
            // travelator from south to north°
            if(line1.includes(" ^^ "))
                return new Box(types.BoxType.TRAVELATOR_S_N, walls)
            // // travelator from south to east
            // if(line2.includes(">"))
            //     return new Box(2, 90, walls)
            // // travelator from south to west
            // if(line2.includes("<"))
            //     return new Box(3, 270, walls)
        }
        // if(line2.includes("|| =") || line2.includes("||==")) {
        //     // travelator from east to south
        //     if(line1.includes(" ^^ "))
        //         return new Box(2, 0, walls)
        //     // travelator from east to south
        //     if(line3.includes(" vv "))
        //         return new Box(3, 180, walls)
        // }
        // if(line2.includes("= ||") || line2.includes("==||")) {
        //     // travelator from east to south
        //     if(line1.includes(" ^^ "))
        //         return new Box(3, 0, walls)
        //     // travelator from east to south
        //     if(line3.includes(" vv "))
        //         return new Box(2, 180, walls)
        // }
    }
    if(line2.includes("====")) {
        // travelator from west to east
        if(line2.includes("==== >") || line2.includes("=====>"))
            return new Box(types.BoxType.TRAVELATOR_W_E, walls)
        // travelator from east to west
        if(line2.includes("< ====") || line2.includes("<====="))
            return new Box(types.BoxType.TRAVELATOR_E_W, walls)
    }
    // hole
    if((line1 == "xxxxxx") && (line2 == "x    x") && (line3 == "xxxxxx"))
        return new Box(types.BoxType.HOLE, walls)
    // objective
    if(line2.includes("00"))
        return new Box(types.BoxType.TARGET, walls)
    // start 1
    if(line2.includes("01"))
        return new Box(types.BoxType.START_1, walls)
    // start 2
    if(line2.includes("02"))
        return new Box(types.BoxType.START_2, walls)
    // start 3
    if(line2.includes("03"))
        return new Box(types.BoxType.START_3, walls)
    // start 4
    if(line2.includes("04"))
        return new Box(types.BoxType.START_4, walls)

    return new Box(types.BoxType.DEFAULT, walls)
}

function getBoxWalls(line1, line2, line3) {
    let walls = [false, false, false, false];
    // north walls
    if(line1.includes("----"))
        walls[0] = true
    // east walls
    if((line1.charAt(5) == "|") && (line2.charAt(5) == "|") && (line3.charAt(5) == "|"))
        walls[1] = true
    // south walls
    if(line3.includes("----"))
        walls[2] = true
    // west walls
    if((line1.charAt(0) == "|") && (line2.charAt(0) == "|") && (line3.charAt(0) == "|"))
        walls[3] = true
    return walls;
}
