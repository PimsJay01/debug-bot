import 'pixi'
import 'p2'
import Phaser from 'phaser'

import ReadyState from './states/Ready'
import GameState from './states/Game'

import config from './config'

import io from 'socket.io-client'

class Game extends Phaser.Game {

  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'phaser', null)

    this.state.add('Ready', ReadyState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Ready')
  }
}

window.game = new Game()

window.socket = io(`http://localhost:7777`);

window.socket.on('server:init', ({ game, robot }) => {
    console.info('server:init', { game, robot })
    window.game.datas = game
    window.game.robot = robot
    window.game.state.start('Ready')
})

window.socket.on('server:game:newppl', ({ game, robot }) => {
    console.info('server:game:newppl', { game, robot })
    window.game.datas = game
    window.game.robot = robot
    document.getElementById('playerAmount').innerHTML = "Players: " + game.robots.length + "/" + game.maxPlayers;
    //document.getElementById('playerAmount').innerHTML = "Players: ";
    //errasing ppl list (usefull in case a player left)
    document.getElementById("inGamePlayerList").innerHTML = "";

    for (var i = 0; i < game.robots.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = game.robots[i].name;
        document.getElementById("inGamePlayerList").appendChild(li);
    }
})

window.socket.on('server:cards', ({ game, robot }) => {
    console.info('server:cards', { game, robot })
    window.game.datas = game
    window.game.robot = robot
    window.game.state.start('Game')
})

window.socket.on('server:gameover', () => {
    console.info('server:gameover')

    window.game.state.start('Welcome')
})

window.emitName = function() {
    var pseudo = document.getElementById('pseudo').value;
    if (pseudo.length == 0){
        pseudo = "an idiot that did not provide a pseudo";
    }
    window.socket.emit('client:name', pseudo);
    document.getElementById('welcome').style.display = "none";
    document.getElementById('game').style.display = "flex";
}
