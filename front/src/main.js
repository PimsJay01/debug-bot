import 'pixi'
import 'p2'
import Phaser from 'phaser'

import WelcomeState from './states/Welcome'
import ReadyState from './states/Ready'
import GameState from './states/Game'
import GameFlowState from './states/GameFlow'

import config from './config'

import io from 'socket.io-client'

class Game extends Phaser.Game {

  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null)

    this.state.add('Welcome', WelcomeState, false)
    this.state.add('Ready', ReadyState, false)
    this.state.add('Game', GameState, false)
    this.state.add('GameFlow', GameFlowState, false)

    this.state.start('Welcome')
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

window.socket.on('server:runProgram', (gameFlow) => {
  console.info('server:runProgram')

  window.game.gameflow = gameFlow
  window.game.state.start('GameFlow')

})
