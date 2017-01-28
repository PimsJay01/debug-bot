var http = require('http')
var _ = require('underscore')

var server = http.createServer()

// Chargement de socket.io
var io = require('socket.io').listen(server)

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
var serverCommands = {'reset' : reset}

// read and manage commands from stdin
rl.on('line', (input) => {
  var command = input.trim();
  console.log(`Command : `+ command);
  if(command in serverCommands){
    serverCommands[command]();
  } else {
    console.log(`Unknown command : `+ command);
  }
})

class Robot {
    constructor(name, position, health, id) {
        this.name = name
        this.position = position
        this.health = health
        this.cards = []
        this.program = []
        this.id = id
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
        this.robots.push(robot)
        return game.robots.length == this.maxPlayers
    }
    getRobot(id){
        for (var robot in this.robots) {
            if (robot.id = id) {
                return robot
            }
        }
    }
    isReady(){
        if(this.robots.length == this['maxPlayers']) {
            return true;
            // return _.every(this.robots, (robot) => {return robot.ready} )
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

var board = []
for (let x = 0; x < 18; x++) {
    board[x] = []
    for (let y = 0; y < 9; y++) {
        board[x][y] = new Box(0, [false, false, false, false])
    }
}

var game = new Game(board)
var cards = []

io.sockets.on('connection', (socket) => {

  console.info('new connection id ' + socket.id)

  socket.on('client:name', (name) => {
      console.info('client:name', name)

      if(game.addRobot(new Robot(name, initalPositions[game.robots.length], maxHealth))) {
          console.info('server:init')
          socket.broadcast.emit('server:init', game)
      }
  })

  socket.on('client:ready', () => {
      console.info('client:ready')

      if(game.isReady()){
          console.info('everybody is ready')
      }
  })

  // Send id client and game preferences
  socket.emit('session', socket.id)
  socket.emit('init', game)

  // When client disconnect...
  socket.on('disconnect', function() {})
})

setInterval(function(){
}, 1000);

server.listen(7777)
console.info('server started')
