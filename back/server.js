/*
Copyright 2017 Arnaud Beguin, Amelie Fiocca, Loic Poisot, Jeremy Gobet and Pierre Kunzli

This file is part of Debug Bot.

Debug Bot is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Foobar is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Debug Bot.  If not, see <http://www.gnu.org/licenses/>.
*/


var http = require('http')
var server = http.createServer()

var _ = require('underscore')
var moment = require('moment');
var io = require('socket.io').listen(server)

var config = require('./config')

// Models
var Robot = require('./models/robot')
var Box = require('./models/box')
var Game = require('./models/game')

var game = new Game()

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
          console.info("robot added at ", robot.position, " ; ", robot.initialPosition)
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

      if(game.setRobotCompiled(socket.id)) {
          game.currentTurn ++
          console.info('currentTurn : ', game.currentTurn)
          runProgram()
      }
  })

  socket.on('client:stepover', (newRobot) => {
      console.info('cient:stepover -> ', newRobot.id)
      if (isGameOver()) {
        console.info('server:gameover detected')
        _.each(game.robots, robot => {
            io.sockets.sockets[robot.id].emit('server:gameover', robot.winner)
        })
      } else {
        console.info('game goes on')
        if (game.setRobotAnimationEnded(newRobot.id)) {
          console.info('all robot ended there animation')
          game.distributeCards();
          _.each(game.robots, robot => {
              robot.compiled = false
              robot.animationEnded = false
              console.info('server:cards', robot.id)
              console.info("server:cards: ", robot.id, " ; ", robot.position, " ; ", robot.direction)
              io.sockets.sockets[robot.id].emit('server:cards', { game, robot })
          })
        }
    }
  })

  isGameOver = function() {
    let yes = false
    _.each(game.robots, robot => {
        console.info(robot.program)
      if (robot.winner) {
        yes = true
      }
    })
    return yes;
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
