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


import 'pixi'
import 'p2'
import Phaser from 'phaser'

import WaitingState from './states/Waiting'
import GameState from './states/Game'
import GameFlowState from './states/GameFlow'
import GameOver from './states/GameOver'
import config from './config'

import io from 'socket.io-client'

class Game extends Phaser.Game {

  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'phaser', null)

    this.state.add('Waiting', WaitingState, false)
    this.state.add('Game', GameState, false)
    this.state.add('GameFlow', GameFlowState, false)
    this.state.add('GameOver', GameOver, false)
  }
}

var avatarList = [
    {
        selected : false,
        src : "./assets/images/avatar_fluffy.png",
        name : "Fluf" //modif
    },
    {
        selected : false,
        src : "./assets/images/avatar_lavander.png",
        name : "Lavy" //modif
    },
    {
        selected : false,
        src : "./assets/images/avatar_silhouette.png",
        name : "Sil" //modif
    },
    {
        selected : false,
        src : "./assets/images/avatar_skurts.png",
        name : "Skurt" //modif
    }
]

window.loadHTMLUI = function(){
    for (var i = 0; i < avatarList.length; i++) {
        var li = document.createElement('li');
        var img = document.createElement('img');
        var avatarName = document.createElement('div');
        avatarName.innerHTML = avatarList[i].name
        avatarName.style = "text-align: center";
        img.id = i;
        img.src = avatarList[i].src;
        img.style = "height: 60px; width:60px; border-radius: 50%; margin:5px;";
        img.onclick = window.robotSelected;
        li.appendChild(avatarName);
        li.appendChild(img);
        document.getElementById("avatarList").appendChild(li);
    }
    var randomSelect = Math.floor(Math.random() * avatarList.length);

    avatarList[randomSelect].selected = true;
    document.getElementById(randomSelect).className = "selected";
}

window.robotSelected = function(event){
    var id = event.target.id;
    for (var i = 0; i < avatarList.length; i++) {
        if (avatarList[i].selected == true) {
            avatarList[i].selected = false;
            document.getElementById(i).className = "";
        }
        avatarList[id].selected = true;
        document.getElementById(id).className = "selected";
    }
}

window.game = new Game()

window.socket = io(`http://localhost:7777`);


window.socket.on('server:game:pplupd', ({ game, robot }) => {
    console.info('server:game:pplupd', { game, robot })
    window.game.datas = game
    window.game.robot = robot
    document.getElementById('playerAmount').innerHTML = "Players: " + game.robots.length + "/" + game.maxPlayers;
    //errasing ppl list (usefull in case a player left)
    document.getElementById("inGamePlayerList").innerHTML = "";

    for (var i = 0; i < game.robots.length; i++) {
        var img = document.createElement('img');
        img.src = avatarList[game.robots[i].avatarId].src;

        img.style = "height: 40px; width:40px; border-radius: 50%; margin:5px;";
        var li = document.createElement('li');
        var playerName = document.createElement('div');
        playerName.innerHTML = game.robots[i].name;
        playerName.style.marginRight = '10px';
        playerName.style.marginLeft = '5px';
        li.style.marginTop = '5px';
        li.style.border = '2px solid ' + game.robots[i].fill;
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.borderRadius = '30px';
        li.style.backgroundColor = 'rgba(' + parseInt(game.robots[i].fill.substring(1,3), 16) + ',' + parseInt(game.robots[i].fill.substring(3,5), 16) +',' + parseInt(game.robots[i].fill.substring(5,7), 16) + ', 0.6)';
        document.getElementById("inGamePlayerList").appendChild(li);
        li.appendChild(img);
        li.appendChild(playerName);
    }
    window.game.state.start('Waiting')
})

window.socket.on('server:cards', ({ game, robot }) => {
    console.info('server:cards', { game, robot })
    window.game.datas = game
    window.game.robot = robot
    window.game.state.start('Game')
    document.getElementById('hoverPlayerList').style.display = "none";
})

window.socket.on('server:gameover', (youwon) => {
    console.info('server:gameover')
    window.game.youwon = youwon
    window.game.state.start('GameOver')
})

window.socket.on('server:runProgram', (flow) => {
  console.info('server:runProgram', { flow })

  window.game.flow = flow
  window.game.state.start('GameFlow')

})

window.emitName = function() {
    var pseudo = document.getElementById('pseudo').value;
    if (pseudo.length == 0){
        pseudo = "an idiot that did not provide a pseudo";
    }
    var avatarSelected;
    for (var i = 0; i < avatarList.length; i++) {
        if (avatarList[i].selected == true) {
            avatarSelected = i;
        }
    }
    window.socket.emit('client:infos', {name:pseudo,avatarId:avatarSelected});
    document.getElementById('welcome').style.display = "none";
    document.getElementById('game').style.display = "flex";
}
