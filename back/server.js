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
    constructor(type, priority) {
        this.type = type
        this.priority = priority
    }
}

class Box {
    constructor(type, walls) {
        this.type = type
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
        if(game.robots.length < this.maxPlayers) {
            this.robots.push(robot)
        }
        return game.robots.length == this.maxPlayers
    }
    removeRobot(id) {
        this.robots = _.filter(this.robots, (robot) => { return robot.id != id })
    }
    getRobot(id){
        return _.find(this.robots, (robot) => { return robot.id == id })
    }
    setRobotReady(id){
        let robot = this.getRobot(id)
        if(robot != void 0) {
            robot.ready = true;
        }
        console.info('setRobotReady', this.robots);
    }
    isRobotsReady(){
        if(this.robots.length == this['maxPlayers']) {
            return _.every(this.robots, (robot) => { return robot.ready })
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

// TODO parse file to get board 9x18
function initBoard() {
    var board = []
    for (let x = 0; x < 18; x++) {
        board[x] = []
        for (let y = 0; y < 9; y++) {
            board[x][y] = new Box(0, [false, false, false, false])
        }
    }
    return board;
}
var game = new Game(initBoard())

/* TODO parse file to get cards
 * u-turn       6   1-6
 * rotate left  18  7-41 (2)
 * rotate left  18  8-42 (2)
 * back-up      6   43-48
 * move 1       18  49-66
 * move 2       12  67-78
 * move 3       6   79-84
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
rl.on('line', (input) => {
    var command = input.trim()
    console.log(`Command : `+ command)
    if(command in serverCommands){
        serverCommands[command]()
    } else {
        console.log(`Unknown command : `+ command)
    }
})

io.sockets.on('connection', (socket) => {
  console.info('client:connect', socket.id)

  socket.on('client:name', (name) => {
      console.info('client:name', name)
      console.info('client:id', socket.id)

      if(game.addRobot(new Robot(socket.id, name, initalPositions[game.robots.length], maxHealth))) {
          console.info('server:init')
          socket.broadcast.emit('server:init', game)
      }
  })

  socket.on('client:ready', () => {
      console.info('client:ready')
      console.info('client:id', socket.id)

      game.setRobotReady(socket.id)
      if(game.isRobotsReady()){
          console.info('everybody is ready')

          // TODO send cards to each client in game.robots
      }
  })

  // When client disconnect...
  socket.on('disconnect', () => {
      console.info('client:disconnect', socket.id)
      game.removeRobot(socket.id)
  })
})

setInterval(function(){
}, 1000);

server.listen(7777)
console.info('server started')
