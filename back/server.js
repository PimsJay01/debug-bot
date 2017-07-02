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
var Robot = require('./models/robot')

var games = [];
var robots = [];

var cards = []


const MSG_TYPE_CLIENT_INFOS = 'client:infos';
const MSG_TYPE_CLIENT_NEW_GAME = 'client:new_game';
const MSG_TYPE_CLIENT_JOIN_GAME = 'client:join_game';
const MSG_TYPE_SERVER_GAMES = 'server:games';
const MSG_TYPE_SERVER_GAME_PPL_UPD= 'server:game:pplupd';
const MSG_TYPE_SERVER_GAME_CARDS= 'server:game:cards';

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


function addRobot(robot) {
    robots.push(robot);
}
function getRobot(id){
    return _.find(robots, robot => robot.id == id)
}
function removeRobot(id) {
    robots = _.filter(robots, robot => robot.id != id)
}

function gamesNotStarted(){
    return _.filter(games, game => !game.started);
}

function addGame(game) {
    games.push(game);
    //users in lobby needs to be updated that the open games list changed
    io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
}
function getGame(id){
    return _.find(games, game => game.id == id)
}
function removeGame(id) {
    games = _.filter(games, game => game.id != id)
    //users in lobby needs to be updated that the open games list changed
    io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
}


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
    socket.on(MSG_TYPE_CLIENT_INFOS, client => {

        console.log(MSG_TYPE_CLIENT_INFOS, client);
        addRobot(new Robot(socket.id, client.name, client.avatarId));
        io.sockets.sockets[socket.id].emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());

  })

  socket.on(MSG_TYPE_CLIENT_NEW_GAME, newGame => {
        console.log(MSG_TYPE_CLIENT_INFOS, newGame);
        var robot = getRobot(socket.id);
        var game = new Game(socket.id, newGame.name, newGame.playersAmount);
        game.addRobot(robot);
        removeRobot(robot.id);
        addGame(game);
        io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game, robot });
        console.log(game);
  })


    socket.on(MSG_TYPE_CLIENT_JOIN_GAME, gameId => {
        var robot = getRobot(socket.id);
        game = getGame(gameId);
        if(game.addRobot(robot)){
            // the robot could be added to the game
            removeRobot(robot.id);
            if(game.isStarted()) {
                console.log('starting game...');

                game.deadline = moment().add(config.gameTime, 'seconds')
                game.distributeCards();

                _.each(game.robots, robot => {
                    console.info(MSG_TYPE_SERVER_GAME_CARDS, robot.id)
                    //the clients must first be updated that the game is full so that they can prepare for startup
                    io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
                })
            } 
            _.each(game.robots, robot => {
                io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
                io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game, robot })
            })
        } // TODO game full message
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
            console.info(MSG_TYPE_SERVER_GAME_CARDS, robot.id)
            console.info(MSG_TYPE_SERVER_GAME_CARDS, robot.id, " ; ", robot.position, " ; ", robot.direction)
            io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
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
        // removing the client from the lobby...
        removeRobot(socket.id);

        // ... or from the game he is in
        _.each(games, game => {
            if (game.getRobot(socket.id) != null) {
                game.removeRobot(socket.id);
                io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
                if (game.robots.length == 0) {
                    removeGame(game.id);
                } else {
                    if (game.isStarted){
                        _.each(game.robots, robot => {
                            io.sockets.sockets[robot.id].emit('server:game:pplupd', { game, robot })
                        })
                    }
                }
                
            }
        })
  })
})

// setInterval(() => {}, 1000)

server.listen(7777)
console.info('server started')
