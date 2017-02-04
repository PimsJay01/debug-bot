var _ = require('underscore')

var Box = require('./box')

module.exports = class Game {
    constructor(boardName) {
        this.robots = []
        this.board = initBoard(boardName)

        this['maxPlayers'] = 2
    }
    addRobot(robot) {
        if(this.robots.length < this.maxPlayers) {
            this.robots.push(robot)
        }
        return this.robots.length == this.maxPlayers
    }
    removeRobot(id) {
        this.robots = _.filter(this.robots, robot => { return robot.id != id })
    }
    getRobot(id){
        return _.find(this.robots, robot => { return robot.id == id })
    }
    setRobotReady(id){
        let robot = this.getRobot(id)
        if(!_.isUndefined(robot)) {
            robot.ready = true;
        }
    }
    isRobotsReady(){
        if(this.robots.length == this['maxPlayers']) {
            return _.every(this.robots, robot => { return robot.ready })
        }
        return false;
    }
}

function initBoard(boardName) {
    let board = require("../boards/" + boardName)
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
