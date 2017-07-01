var _ = require('underscore')

var config = require('./../config')

var Box = require('./box')
var Card = require('./card')


//U-turn card
const uTurnId = 0;
const uTurnRange = _.range(1,6);

//rotate left card
const rotateLId = 1;
const rotateLRange = _.range(7,42,2);

// rotate right card
const rotateRId = 2;
const rotateRRange = _.range(8,43,2);

//back up card
const backUpId = 3;
const backUpRange = _.range(43,49);

//move 1
const move1Id = 4;
const move1Range = _.range(49,67);

//move 2
const move2Id = 5;
const move2Range = _.range(67,79);

//move 3
const move3Id = 6;
const move3Range = _.range(79,85);


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
        this.robots = [];
        this.board = initBoard();
        this.started = false;
        this.deck = buildCardDeck();
        this['maxPlayers'] = 2;
        this.currentTurn = 0;
    }
    isStarted() {
        return this.started
    }
    addRobot(robot) {
        if(this.robots.length < this.maxPlayers) {
            robot.color = initalColors[this.robots.length]
            robot.fill = initalFills[this.robots.length]
            robot.position = initalPositions[this.robots.length]
            this.robots.push(robot)
            this.started = this.robots.length >= this.maxPlayers
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
        if(this.robots.length == this['maxPlayers']) {
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
}

function buildCardDeck(){
        var gameDeck = [];
        for (var i = 0; i < uTurnRange.length; i++) {
            gameDeck.push(new Card(gameDeck.length,uTurnId,uTurnRange[i]));
        }
        for (var i = 0; i < rotateLRange.length; i++) {
            gameDeck.push(new Card(gameDeck.length,rotateLId,rotateLRange[i]));
        }
        for (var i = 0; i < rotateRRange.length; i++) {
            gameDeck.push(new Card(gameDeck.length,rotateRId,rotateRRange[i]));
        }
        for (var i = 0; i < backUpRange.length; i++) {
            gameDeck.push(new Card(gameDeck.length,backUpId,backUpRange[i]));
        }
        for (var i = 0; i < move1Range.length; i++) {
            gameDeck.push(new Card(gameDeck.length,move1Id,move1Range[i]));
        }
        for (var i = 0; i < move2Range.length; i++) {
            gameDeck.push(new Card(gameDeck.length,move2Id,move2Range[i]));
        }
        for (var i = 0; i < move3Range.length; i++) {
            gameDeck.push(new Card(gameDeck.length,move3Id,move3Range[i]));
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

function getBox(line1, line2, line3) {
    let walls = getBoxWalls(line1, line2, line3)
    if(line2.includes("||")) {
        if(line1.includes("||")) {
            // travelator from north to south
            if(line3.includes(" vv "))
                return new Box(Type.TRAVELATOR_N_S, walls)
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
                return new Box(Type.TRAVELATOR_S_N, walls)
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
            return new Box(Type.TRAVELATOR_W_E, walls)
        // travelator from east to west
        if(line2.includes("< ====") || line2.includes("<====="))
            return new Box(Type.TRAVELATOR_E_W, walls)
    }
    // hole
    if((line1 == "xxxxxx") && (line2 == "x    x") && (line3 == "xxxxxx"))
        return new Box(Type.HOLE, walls)
    // objective
    if(line2.includes("00"))
        return new Box(Type.OBJECTIVE, walls)
    // start 1
    if(line2.includes("01"))
        return new Box(Type.START_1, walls)
    // start 2
    if(line2.includes("02"))
        return new Box(Type.START_2, walls)
    // start 3
    if(line2.includes("03"))
        return new Box(Type.START_3, walls)
    // start 4
    if(line2.includes("04"))
        return new Box(Type.START_4, walls)

    return new Box(Type.DEFAULT, walls)
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
