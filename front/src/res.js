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
        musicGame : [sounds+'musicGame2.mp3', sounds+'musicGame2.ogg']
    }
}
