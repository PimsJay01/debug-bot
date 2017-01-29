import 'pixi'
import 'p2'
import Phaser from 'phaser'

import WelcomeState from './states/Welcome'
import ReadyState from './states/Ready'
import GameState from './states/Game'

import config from './config'

import io from 'socket.io-client'
let socket = io(`http://localhost:7777`)

class Game extends Phaser.Game {

  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null)

    this.state.add('Welcome', WelcomeState, false)
    this.state.add('Ready', ReadyState, false)
    this.state.add('Game', GameState, false)

    socket.on('server:caca', (id) => {
        console.info('server:id', id)

        if(id != void 0) {
            this.id = id
        }
    })

    socket.on('server:init', (game) => {
        console.info('server:init', game)
        this.datas = game
        this.state.start('Ready')
    })

    socket.on('server:cards', ({ game, cards }) => {
        console.info('server:cards', { game, cards })
        this.datas = game;
        this.cards = cards;
        this.state.start('Game')
    })

    socket.on('server:gameover', () => {
        console.info('server:gameover')

        this.state.start('Welcome')
    })

    this.state.start('Welcome')
  }
}

window.game = new Game()
