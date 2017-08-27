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


var sprites = 'sprites/';
var images = '../assets/images/';
var tiles = '../assets/tiles/';
var sounds = '../assets/sounds/'

export const res = {
    images : {
        readyBtn : images + 'mushroom2.png',
        background : images + 'space1.jpg',
        card : images + 'card.png',
        uTurn : images + 'uTurn.jpg',
        rotateL : images + 'rotateL.jpg',
        rotateR : images + 'rotateR.jpg',
        backUp : images + 'backUp.jpg',
        move1 : images + 'move1.jpg',
        move2 : images + 'move2.jpg',
        move3 : images + 'move3.jpg',
        avatar_fluffy : images + 'avatar_fluffy.png', //
        avatar_lavander : images + 'avatar_lavander.png', //
        avatar_silhouette : images + 'avatar_silhouette.png', //
        avatar_skurts : images + 'avatar_skurts.png' //
    },
    tiles : {
        default : tiles + '001.png',
        target : tiles + '002.png',
        travelatorWE : tiles + '005.png',
        travelatorNS : tiles + '006.png',
        travelatorEW : tiles + '007.png',
        travelatorSN : tiles + '008.png',
        start1 : tiles + '011.png',
        start2 : tiles + '012.png',
        start3 : tiles + '013.png',
        start4 : tiles + '014.png',
        wallN : tiles + 'wall_north.png',
        wallE : tiles + 'wall_east.png',
        wallS : tiles + 'wall_south.png',
        wallW : tiles + 'wall_west.png',
        robot1n : tiles + 'robot_1_north.png',
        robot1e : tiles + 'robot_1_east.png',
        robot1s : tiles + 'robot_1_south.png',
        robot1w : tiles + 'robot_1_west.png'
    },
    sounds : {
        musicGame : [sounds+'musicGame2.mp3', sounds+'musicGame2.ogg'],
        laser : [sounds+'laser3.mp3', sounds+'laser3.ogg'],
        win : [sounds+'win.mp3', sounds+'win.ogg'],
        card : [sounds+'cardChoice.mp3', sounds+'cardChoice.ogg']
    }
}
