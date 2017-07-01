var _ = require('underscore')

var config = require('./../config')

var Box = require('./box')
var Card = require('./card')
var Command = require('./../models/command')
var Types = require('./../models/types')

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
        this.deck = buildCardDeck()
        this['maxPlayers'] = 2
        this.currentTurn = 0
        this.types = new Types()
    }
    isStarted() {
        return this.started
    }
    addRobot(robot) {
        if(this.robots.length < config.maxPlayers) {
            robot.color = initalColors[this.robots.length]
            robot.fill = initalFills[this.robots.length]
            robot.position = initalPositions[this.robots.length]
            this.robots.push(robot)
            this.started = this.robots.length >= config.maxPlayers
            return true
        }
        return false
    }
    removeRobot(id) {
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
    distributeCards(){
        _.each(this.robots, robot => {
            while (robot.cards.length < config.robotMaxCards){
                var cardSelected = this.deck[_.random(this.deck.length-1)];
                robot.cards.push(cardSelected);
                this.deck = _.filter(this.deck, function(card){ return card != cardSelected});
            }
        })
    }
    areRobotsCompiled() {
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

    getReverseDirection(direction) {
      let newDirection = 0;
      switch (direction) {
        case types.MovementType.NORTH:
          newDirection = types.MovementType.SOUTH
          break;
        case types.MovementType.SOUTH:
          newDirection = types.MovementType.NORTH
          break;
        case types.MovementType.EAST:
          newDirection = types.MovementType.WEST
          break;
        case types.MovementType.WEST:
          newDirection = types.MovementType.EAST
          break;
        default:
          break;
      }
      return newDirection;
    }

    turnLeft(direction) {
      let newDirection = 0;
      switch (direction) {
        case types.MovementType.NORTH:
          newDirection = types.MovementType.WEST
          break;
        case types.MovementType.SOUTH:
          newDirection = types.MovementType.EAST
          break;
        case types.MovementType.EAST:
          newDirection = types.MovementType.NORTH
          break;
        case types.MovementType.WEST:
          newDirection = types.MovementType.SOUTH
          break;
        default:
          break;
      }
      return newDirection;
    }

    turnRight(direction) {
      let newDirection = 0;
      switch (direction) {
        case types.MovementType.NORTH:
          newDirection = types.MovementType.EAST
          break;
        case types.MovementType.SOUTH:
          newDirection = types.MovementType.WEST
          break;
        case types.MovementType.EAST:
          newDirection = types.MovementType.SOUTH
          break;
        case types.MovementType.WEST:
          newDirection = types.MovementType.NORTH
          break;
        default:
          break;
      }
      return newDirection;
    }

    resolveTurn() {
      let programs = this.getProgramsSorted()
      let commands = []
      let index = 0

      _.each(programs, program => {
        let robot = this.getRobotById(program.robotId)
        robot.turnLeft()
        switch (program.line.type) {
          case uTurnId:
            robot.direction = this.getReverseDirection(robot.direction)
            commands.push(new Command(program.robotId, program.line.id, types.MovementType.U_TURN))
            break
          case rotateLId:
            robot.direction = this.turnLeft(robot.direction)
            commands.push(new Command(program.robotId, program.line.id, types.MovementType.TURN_LEFT))
            break
          case rotateRId:
            robot.direction = this.turnRight(robot.direction)
            commands.push(new Command(program.robotId, program.line.id, types.MovementType.TURN_RIGHT))
            break
          case backUpId:
            let movement = this.getReverseDirection(robot.direction);
            commands.push(new Command(program.robotId, program.line.id, movement))
            break
          case move1Id:
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            break
          case move2Id:
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            break
          case move3Id:
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            commands.push(new Command(program.robotId, program.line.id, robot.direction))
            break
          default:
            break
        }
      })

      console.info('Commands to be send to the client : ', commands)
      return commands;
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
}

function buildCardDeck(){
      let types = new Types()
      var gameDeck = [];
      for (var i = 0; i < types.CardTypeRange.U_TURN.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.U_TURN, types.CardTypeRange.U_TURN[i]));
      }
      for (var i = 0; i < types.CardTypeRange.ROTATE_LEFT.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.ROTATE_LEFT,types.CardTypeRange.ROTATE_LEFT[i]));
      }
      for (var i = 0; i < types.CardTypeRange.ROTATE_RIGHT.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.ROTATE_RIGHT,types.CardTypeRange.ROTATE_RIGHT[i]));
      }
      for (var i = 0; i < types.CardTypeRange.BACK_UP.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.BACK_UP,types.CardTypeRange.BACK_UP[i]));
      }
      for (var i = 0; i < types.CardTypeRange.MOVE_1.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.MOVE_1,types.CardTypeRange.MOVE_1[i]));
      }
      for (var i = 0; i < types.CardTypeRange.MOVE_2.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.MOVE_2,types.CardTypeRange.MOVE_2[i]));
      }
      for (var i = 0; i < types.CardTypeRange.MOVE_3.length; i++) {
          gameDeck.push(new Card(gameDeck.length,types.CardType.MOVE_3,types.CardTypeRange.MOVE_3[i]));
      }
      return gameDeck;
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
        return new Box(types.BoxType.OBJECTIVE, walls)
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
