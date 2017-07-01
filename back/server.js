var http = require('http')
var server = http.createServer()

var _ = require('underscore')
var moment = require('moment');
var io = require('socket.io').listen(server)

var config = require('./config')

// Models
var Robot = require('./models/robot')
var Card = require('./models/card')
var Box = require('./models/box')
var Game = require('./models/game')

var game = new Game()

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

    // TODO Reset game
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

      let robot = new Robot(socket.id, name)
      if(game.addRobot(robot)) {
          if(game.isStarted()) {
              console.info('server:init')
              _.each(game.robots, robot => {
                  io.sockets.sockets[robot.id].emit('server:init', { game, robot })
              })
          }
      }
      else {
          // TODO send a message to the unlucky player and manage it
          console.info('go fuck yourself', socket.id);
      }
  })

  socket.on('client:ready', () => {
      console.info('client:ready')
      console.info('client:id', socket.id)

      game.setRobotReady(socket.id)
      if(game.isRobotsReady()) {
          console.info('everybody is ready')

          game.deadline = moment().add(config.gameTime, 'seconds')
          // TODO Fix setTimeout issue
        //   game.timeoutId = setTimeout(runProgram, 10000)

          game.distributeCards();

          _.each(game.robots, robot => {
              console.info('server:cards', robot.id)
              io.sockets.sockets[robot.id].emit('server:cards', { game, robot })
          })
      }
  })

  socket.on('client:program', (program) => {
      console.info('client:program', _.map(program, line => _.values(line)))
      console.info('client:id', socket.id)

      let robot = game.getRobot(socket.id)
      robot.program = _.intersection(robot.cards, program)
      console.info('client:program(real)', program)
  })

  socket.on('client:compile', () => {
      console.info('client:compile')
      console.info('client:id', socket.id)

      game.getRobot(socket.id).compiled = true
      if(game.areRobotsCompiled()) {
          runProgram()
      }
  })

  runProgram = function() {
      console.info('server:runProgram')

    //   clearTimeout(game.timeoutId)
  }

  // When client disconnect...
  socket.on('disconnect', () => {
      console.info('client:disconnect', socket.id)
      game.removeRobot(socket.id)
  })
})

// setInterval(() => {}, 1000)

server.listen(7777)
console.info('server started')
