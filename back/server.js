var http = require('http')
var _ = require('underscore')

var server = http.createServer()

// Chargement de socket.io
var io = require('socket.io').listen(server)

// TODO Move classes in another files and import them here

class Robot {
    constructor(id, name, position, health) {
        this.id = id
        this.name = name
        this.position = position
        this.health = health
        this.cards = []
        this.program = []
        this.ready = false
    }
}

class Card {
    constructor(id, type, priority) {
        this.id = id
        this.type = type
        this.priority = priority
    }
}

/* Box types
* 0: default
* 1: travelator from south to north
* 2: travelator from east to north
* 3: travelator from west to north
* 4: hole
* ...
* 9: objective
*/
class Box {
    constructor(type, angle, walls) {
        this.type = type
        this.angle = angle
        this.walls = walls
    }
}

class Game {
    constructor(board) {
        this.robots = []
        this.board = board

        this['maxPlayers'] = 2
    }
    addRobot(robot) {
        if(this.robots.length < this.maxPlayers) {
            this.robots.push(robot)
        }
        return game.robots.length == this.maxPlayers
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

const maxHealth = 5
const initalPositions = [
    {x: 0, y: 1},
    {x: 0, y: 3},
    {x: 0, y: 5},
    {x: 0, y: 7}
]

function initBoard() {
    let board = require("./boards/board01")
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

var game = new Game(initBoard())
console.log(game.board)

/* TODO parse file to get cards
* 0: u-turn       6   1-6
* 1: rotate left  18  7-41 (2)
* 2: rotate right  18  8-42 (2)
* 3: back-up      6   43-48
* 4: move 1       18  49-66
* 5: move 2       12  67-78
* 6: move 3       6   79-84
*/
var cards = []

// Loading stdin read
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// reset the global datastructures, put the server in initial state
function reset(){
    console.log('Server reset')
}

// list of commands recognised by the server
var serverCommands = { reset }

// read and manage commands from stdin
rl.on('line', input => {
    var command = input.trim()
    console.log(`Command : `+ command)
    if(command in serverCommands){
        serverCommands[command]()
    } else {
        console.log(`Unknown command : `+ command)
    }
})

io.sockets.on('connection', socket => {
  console.info('client:connect', socket.id)

  socket.on('client:name', name => {
      console.info('client:name', name)
      console.info('client:id', socket.id)

      let robot = new Robot(socket.id, name, initalPositions[game.robots.length], maxHealth)
      if(game.addRobot(robot)) {
          console.info('server:init')
          io.sockets.emit('server:init', { game, robot })
      }
  })

  socket.on('client:ready', () => {
      console.info('client:ready')
      console.info('client:id', socket.id)

      game.setRobotReady(socket.id)
      if(game.isRobotsReady()) {
          console.info('everybody is ready')

          _.each(game.robots, robot => {
              // TODO get 9 cards randomly from deck game.cards[]
              robot.cards = _.times(9, n => {
                  return new Card(0, _.random(0, 6), _.random(1, 84))
              })
              console.info('server:cards', robot.id)
              io.sockets.sockets[robot.id].emit('server:cards', { game, robot })
          })
      }
  })

  socket.on('client:program', (program) => {
      console.info('client:program', program)
      console.info('client:id', socket.id)

      // TODO Update & check game.getRobot(...).cards & .program
  })


  // When client disconnect...
  socket.on('disconnect', () => {
      console.info('client:disconnect', socket.id)
      game.removeRobot(socket.id)
  })
})

// setInterval(() => {}, 1000)

server.listen(7777)
console.info('server started')
