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
const MSG_TYPE_SERVER_ERROR = 'server:error';

// Loading stdin read
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

//Hereby, functions used by game to communicate with their players on own chanel

exports.gameUpdatePlayerList = function (game) {
    io.sockets.in(game.id).emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game });
}




// reset the global datastructures, put the server in initial state
function reset(){

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
    socket.on(MSG_TYPE_CLIENT_INFOS, client => {

        addRobot(new Robot(socket.id, client.name, client.avatarId));
        io.sockets.sockets[socket.id].emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());

  })

  socket.on(MSG_TYPE_CLIENT_NEW_GAME, newGame => {
        var robot = getRobot(socket.id);
        var game = new Game(socket.id, newGame.name, newGame.playersAmount);
        //the game has the id of the first robot joining it
        socket.join(game.id);
        game.addRobot(robot);
        removeRobot(robot.id);
        addGame(game);
        io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game, robot });
  })


    socket.on(MSG_TYPE_CLIENT_JOIN_GAME, gameId => {
        var robot = getRobot(socket.id);
        game = getGame(gameId);
        if(game.addRobot(robot)){
            // the robot could be added to the game
            removeRobot(robot.id);
            _.each(game.robots, robot => {
                io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
                io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game, robot })
            })
            if(game.isStarted()) {

                game.deadline = moment().add(config.gameTime, 'seconds')
                game.distributeCards();

                _.each(game.robots, robot => {
                    io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
                })
            }
        } else{
            io.sockets.emit(MSG_TYPE_SERVER_ERROR, "Sorry, you were not able to join the game as it is full");
        }
  })

  socket.on('client:program', (program) => {

      let robot = game.getRobot(socket.id)
      robot.program = program
  })

  socket.on('client:compile', () => {

      if(game.setRobotCompiled(socket.id)) {
          game.currentTurn ++
          runProgram()
      }
  })

  socket.on('client:stepover', (newRobot) => {
      let robot = _.find(game.robots, robot => robot.id == newRobot.id)
      if (isGameOver()) {
        _.each(game.robots, robot => {
            io.sockets.sockets[robot.id].emit('server:gameover', robot.winner)
        })
      } else {
        game.distributeCards();
        _.each(game.robots, robot => {
            robot.compiled = false
            io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
        })
    }
  })

  isGameOver = function() {
    let yes = false
    _.each(game.robots, robot => {
      if (robot.winner) {
        yes = true
      }
    })
    return yes;
  }

  runProgram = function() {

      let commands = game.resolveTurn()

      _.each(game.robots, robot => {
        io.sockets.sockets[robot.id].emit('server:runProgram', commands)
      })

    //   clearTimeout(game.timeoutId)
  }

  // When client disconnect...
  socket.on('disconnect', () => {
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
