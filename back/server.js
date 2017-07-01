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
var Command = require('./models/command')

var game = new Game()

var cards = []

const Type = {
  U_TURN : 0,
  ROTATE_LEFT : 1,
  ROTATE_RIGHT : 2,
  BACK_UP : 3,
  MOVE : 4,
  DEAD : 5
}

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
      robot.program = program
      console.info('client:program(real)', robot.program)
  })

  socket.on('client:compile', () => {
      console.info('client:compile')
      console.info('client:id', socket.id)

      game.getRobot(socket.id).compiled = true
      if(game.areRobotsCompiled()) {
          runProgram()
      }
  })

  socket.on('client:gameover', () => {
    console.info('client:gameover')

    let robots = []
    _.each(game.robots, robot => {
      robots.push(new Robot(robot.id, robot.name))
    })

    game = new Game()

    _.each(robots, robot => {
      game.addRobot(robot)
    })

    if(game.isStarted()) {
        console.info('server:init')
        _.each(robots, robot => {
            io.sockets.sockets[robot.id].emit('server:init', { game, robot })
        })
    } else {
      console.info('unfortunately, we lost a player...')
    }

  })

  runProgram = function() {
      console.info('server:runProgram', game.getProgramsSorted())

      let programs = game.getProgramsSorted()
      let commands = []
      let index = 0
      _.each(programs, program => {
        switch (program.line.type) {
          case 5:
            commands.push(new Command(program.robotId, program.line.id, Type.MOVE))
            commands.push(new Command(program.robotId, program.line.id, Type.MOVE))
            break;
          case 6:
            commands.push(new Command(program.robotId, program.line.id, Type.MOVE))
            commands.push(new Command(program.robotId, program.line.id, Type.MOVE))
            commands.push(new Command(program.robotId, program.line.id, Type.MOVE))
          default:
            commands.push(new Command(program.robotId, program.line.id, program.line.type))

        }
      })

      console.info('server:runProgram', commands)
      _.each(game.robots, robot => {
        io.sockets.sockets[robot.id].emit('server:runProgram', commands)
      })

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
