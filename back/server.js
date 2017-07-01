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
const readline = require('readline');

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

  socket.on('client:infos', infos => {

      let robot = new Robot(socket.id, infos.name, infos.avatarId)


      if(game.addRobot(robot)) {
          if(game.isStarted()) {
            console.log('starting game...');

            game.deadline = moment().add(config.gameTime, 'seconds')
            game.distributeCards();

            _.each(game.robots, robot => {
                console.info('server:cards', robot.id)
                io.sockets.sockets[robot.id].emit('server:cards', { game, robot })
            })
          } else {
              _.each(game.robots, robot => {
                  io.sockets.sockets[robot.id].emit('server:game:pplupd', { game, robot })
              })
          }
      }
      else {
          // TODO send a message to the unlucky player and manage it
          console.info('go fuck yourself', socket.id);
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
          game.currentTurn ++
          console.info('currentTurn : ', game.currentTurn)
          runProgram()
      }
  })

  socket.on('client:stepover', (newRobot) => {
      console.info('cient:stepover')
      let robot = _.find(game.robots, robot => robot.id == newRobot.id)
      if (isGameOver()) {
        let youwon = true
        _.each(game.robots, robot => {
            io.sockets.sockets[robot.id].emit('server:gameover', youwon)
        })
      } else {
        game.distributeCards();
        _.each(game.robots, robot => {
            robot.program = []
            robot.compiled = false
            console.info('server:cards', robot.id)
            console.info("server:cards: ", robot.id, " ; ", robot.position, " ; ", robot.direction)
            io.sockets.sockets[robot.id].emit('server:cards', { game, robot })
        })
    }
  })

  isGameOver = function() {
    return game.currentTurn >= 10;
  }

  runProgram = function() {
      console.info('server:runProgram', game.getProgramsSorted())

      let commands = game.resolveTurn()

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
        _.each(game.robots, robot => {
            io.sockets.sockets[robot.id].emit('server:game:pplupd', { game, robot })
        })
  })
})

// setInterval(() => {}, 1000)

server.listen(7777)
console.info('server started')
