var http = require('http')
var server = http.createServer()

var _ = require('underscore')
var moment = require('moment');
var io = require('socket.io').listen(server)

// Models
var Robot = require('./models/robot')
var Card = require('./models/card')
var Box = require('./models/box')
var Game = require('./models/game')

const maxHealth = 5
const initalPositions = [
    {x: 0, y: 1},
    {x: 0, y: 3},
    {x: 0, y: 5},
    {x: 0, y: 7}
]

var game = new Game('board01')
console.log(game.board)

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

          game.deadline = moment().add(120, 'seconds')
          // TODO Start counter

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
