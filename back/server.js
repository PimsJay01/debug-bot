var http = require('http')
var server = http.createServer()

var _ = require('underscore')
var moment = require('moment');
var io = require('socket.io').listen(server);
io.origins('*:*');

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
const MSG_TYPE_SERVER_GAME_PLAY= 'server:game:play';
const MSG_TYPE_SERVER_GAME_END= 'server:game:end';
const MSG_TYPE_SERVER_ERROR = 'server:error';
const MSG_TYPE_CLIENT_GAME_DECK_CHG = 'client:game:program';
const MSG_TYPE_CLIENT_GAME_DECK_RDY = 'client:game:compile';
const MSG_TYPE_CLIENT_GAME_END_TURN = 'client:game:stepover';



// Loading stdin read
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

//Hereby, functions used by game to communicate with their players on own chanel

exports.gameUpdatePlayerList = gameUpdatePlayerList;
function gameUpdatePlayerList (game) {
    io.sockets.in(game.id).emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game });
    if (game.started) {
        gameUpdatePlayerDeck(game);
    }
}


exports.addRobotToGameRoom = addRobotToGameRoom;
function addRobotToGameRoom (robot, game) {
    io.sockets.sockets[robot.id].join(game.id, function () {
        console.log(" now in rooms ", io.sockets.sockets[robot.id].rooms);
        //io.sockets.in(game.id).emit(MSG_TYPE_SERVER_GAME_PPL_UPD, { game });
        gameUpdatePlayerList(game);
    });
}

exports.gameUpdatePlayerDeck = gameUpdatePlayerDeck;
function gameUpdatePlayerDeck (game) {
    _.each(game.robots, robot => {
        io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
    })
}

exports.gameSendCommands = gameSendCommands;
function gameSendCommands (game, commands) {
    io.sockets.in(game.id).emit(MSG_TYPE_SERVER_GAME_PLAY, commands)
}




// reset the global datastructures, put the server in initial state
function reset(){

    // TODO Reset game
}

// list of commands recognised by the server
var serverCommands = { reset }


function addRobotInLobby(robot) {
    io.sockets.sockets[robot.id].join('lobby', function () {
        io.sockets.in('lobby').emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
    });
    robots.push(robot);
}
function getRobotFromLobby(id){
    return _.find(robots, robot => robot.id == id)
}
function removeRobotFromLobby(id) {
    robots = _.filter(robots, robot => robot.id != id);
    io.sockets.in('lobby').emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
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
    if(command in serverCommands){
        serverCommands[command]()
    } else {
        console.log(`Unknown command : `+ command)
    }
})

io.sockets.on('connection', socket => {
    socket.on(MSG_TYPE_CLIENT_INFOS, client => {
        addRobotInLobby(new Robot(socket.id, client.name, client.avatarId));
  })

  socket.on(MSG_TYPE_CLIENT_NEW_GAME, newGame => {
        var robot = getRobotFromLobby(socket.id);
        var game = new Game('game/'+socket.id+Date.now(), newGame.name, newGame.playersAmount);
        //the game has the id of the first robot joining it
        game.addRobot(robot);
        removeRobotFromLobby(robot.id);
        addGame(game);
  })


    socket.on(MSG_TYPE_CLIENT_JOIN_GAME, gameId => {
        var robot = getRobotFromLobby(socket.id);
        game = getGame(gameId);
        if(game.addRobot(robot)){
            // the robot could be added to the game
            // Hence, removing it fom lobby
            removeRobotFromLobby(robot.id);

        } else{
            io.sockets.emit(MSG_TYPE_SERVER_ERROR, "Sorry, you were not able to join the game as it is full");
        }
  })

  socket.on(MSG_TYPE_CLIENT_GAME_DECK_CHG, (program) => {
    var game;
    _.each(socket.rooms, room => {
        if (typeof getGame(room) != 'undefined'){
            game = getGame(room);
        }
    })
    game.getRobot(socket.id).program = program
  })

  socket.on(MSG_TYPE_CLIENT_GAME_DECK_RDY, () => {
      var game;
        _.each(socket.rooms, room => {
            if (typeof getGame(room) != 'undefined'){
                game = getGame(room);
            }
        })
      game.setRobotReady(socket.id);
  })

  socket.on(MSG_TYPE_CLIENT_GAME_END_TURN, (newRobot) => {
      console.info('stepover received from client from : ' + newRobot.id);
      var game;
        _.each(socket.rooms, room => {
            if (typeof getGame(room) != 'undefined'){
                game = getGame(room);
            }
        })

      //let robot = _.find(game.robots, robot => robot.id == newRobot.id)

      if (isGameOver(game)) {
        _.each(game.robots, robot => {
            io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_END, robot.winner)
        })
      } else {
        if (game.setRobotAnimationEnded(newRobot.id)) {
          game.distributeCards();
          _.each(game.robots, robot => {
              robot.ready = false
              robot.animationEnded = false
             io.sockets.sockets[robot.id].emit(MSG_TYPE_SERVER_GAME_CARDS, { game, robot })
          })
        }
    }
  })

  isGameOver = function(game) {
    let yes = false
    _.each(game.robots, robot => {
        console.info(robot.program)
      if (robot.winner) {
        yes = true
      }
    })
    return yes;
  }



  // When client disconnect...
  socket.on('disconnect', () => {
        // removing the client from the lobby...
        removeRobotFromLobby(socket.id);

        // ... or from the game he is in
        _.each(games, game => {
            if (game.getRobot(socket.id) != null) {
                game.removeRobot(socket.id);
                io.sockets.emit(MSG_TYPE_SERVER_GAMES, gamesNotStarted());
                if (game.robots.length == 0) {
                    removeGame(game.id);
                }
            }
        })
  })
})

// setInterval(() => {}, 1000)

server.listen(7778)
