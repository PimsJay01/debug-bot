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
    {x: 0, y: 1},
    {x: 0, y: 3},
    {x: 0, y: 5},
    {x: 0, y: 7}
]

module.exports = class Game {
    constructor() {
        this.robots = [];
        this.board = initBoard();
        this.started = false;
        this.deck = buildCardDeck();
        this['maxPlayers'] = 2;
    }
    isStarted() {
        return this.started
    }
    addRobot(robot) {
        if(this.robots.length < this.maxPlayers) {
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
                var cardSelected = this.deck[_.random(this.deck.length)];
                robot.cards.push(cardSelected);
                this.deck = _.filter(this.deck, function(card){ return card != cardSelected});
            }
        });
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
    return temp;
}

function getBox(line1, line2, line3) {
    let walls = getBoxWalls(line1, line2, line3)
    if(line2.includes("||")) {
        if(line1.includes("||")) {
            // travelator from north to south
            if(line3.includes(" vv "))
                return new Box(1, 180, walls)
            // travelator from north to east
            if(line2.includes(">"))
                return new Box(3, 90, walls)
            // travelator from north to west
            if(line2.includes("<"))
                return new Box(2, 270, walls)
        }
        if(line3.includes("||")) {
            // travelator from south to north°
            if(line1.includes(" ^^ "))
                return new Box(1, 0, walls)
            // travelator from south to east
            if(line2.includes(">"))
                return new Box(2, 90, walls)
            // travelator from south to west
            if(line2.includes("<"))
                return new Box(3, 270, walls)
        }
        if(line2.includes("|| =") || line2.includes("||==")) {
            // travelator from east to south
            if(line1.includes(" ^^ "))
                return new Box(2, 0, walls)
            // travelator from east to south
            if(line3.includes(" vv "))
                return new Box(3, 180, walls)
        }
        if(line2.includes("= ||") || line2.includes("==||")) {
            // travelator from east to south
            if(line1.includes(" ^^ "))
                return new Box(3, 0, walls)
            // travelator from east to south
            if(line3.includes(" vv "))
                return new Box(2, 180, walls)
        }
    }
    if(line2.includes("====")) {
        // travelator from west to east
        if(line2.includes("==== >") || line2.includes("=====>"))
            return new Box(1, 90, walls)
        // travelator from east to west
        if(line2.includes("< ====") || line2.includes("<====="))
            return new Box(1, 270, walls)
    }
    // hole
    if((line1 == "xxxxxx") && (line2 == "x    x") && (line3 == "xxxxxx"))
        return new Box(4, 0, walls)
    // objective
    if(line2.includes("00"))
        return new Box(9, 0, walls)

    return new Box(0, 0, walls)
}

function getBoxWalls(line1, line2, line3) {
    let walls = [false, false, false, false];
    // north walls
    if(line1.includes("----"))
        walls[0] = true
    // north walls
    if((line1.charAt(5) == "|") && (line2.charAt(5) == "|") && (line3.charAt(5) == "|"))
        walls[1] = true
    // south walls
    if(line3.includes("----"))
        walls[2] = true
    // north walls
    if((line1.charAt(0) == "|") && (line2.charAt(0) == "|") && (line3.charAt(0) == "|"))
        walls[3] = true
    return walls;
}
