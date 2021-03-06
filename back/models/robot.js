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


var config = require('./../config')
var Types = require('./types')
var _ = require('underscore')

module.exports = class Robot {
    constructor(id, name, avatarId) {
        this.id = id
        this.name = name
        this.color = '0xFFFFFF'
        this.fill = '#FFFFFF'
        this.avatarId = avatarId
        this.position = { x: 0, y: 0 }
        this.initialPosition = {}
        this.direction = 1 // 0 - 3
        this.health = config.maxHealth
        this.cards = []
        this.program = []
        this.compiled = false
        this.types = new Types()
        this.animationEnded = false 
        this.felt = false
        this.winner = false

    }

    moveXSteps(steps) {
      this.move(this.direction, steps)
    }

    move(direction, steps) {
      console.info("move ", steps, " steps")
      _.each(_.range(steps), step => {
        switch(direction) {
          case this.types.MovementType.NORTH:
            console.info(this.id, " : move north")
            this.position.y = this.position.y - 1
            break
          case this.types.MovementType.EAST:
            console.info(this.id, " : move east")
            this.position.x = this.position.x + 1
            break
          case this.types.MovementType.SOUTH:
            console.info(this.id, " : move south")
            this.position.y = this.position.y + 1
            break
          case this.types.MovementType.WEST:
            console.info(this.id, " : move west")
            this.position.x = this.position.x - 1
            break
        }
      })
    }

    getReverseDirection() {
      let newDirection = 0;
      switch (this.direction) {
        case this.types.MovementType.NORTH:
          newDirection = this.types.MovementType.SOUTH
          break;
        case this.types.MovementType.SOUTH:
          newDirection = this.types.MovementType.NORTH
          break;
        case this.types.MovementType.EAST:
          newDirection = this.types.MovementType.WEST
          break;
        case this.types.MovementType.WEST:
          newDirection = this.types.MovementType.EAST
          break;
        default:
          break;
      }
      return newDirection
    }

    backUp() {
      this.move(this.getReverseDirection(), 1)
    }

    uTurn() {
      this.direction = this.getReverseDirection()
    }

    turnLeft() {
      let newDirection = 0;
      switch (this.direction) {
        case this.types.MovementType.NORTH:
          newDirection = this.types.MovementType.WEST
          break;
        case this.types.MovementType.SOUTH:
          newDirection = this.types.MovementType.EAST
          break;
        case this.types.MovementType.EAST:
          newDirection = this.types.MovementType.NORTH
          break;
        case this.types.MovementType.WEST:
          newDirection = this.types.MovementType.SOUTH
          break;
        default:
          break;
      }
      this.direction = newDirection
    }

    turnRight() {
      let newDirection = 0;
      switch (this.direction) {
        case this.types.MovementType.NORTH:
          newDirection = this.types.MovementType.EAST
          break;
        case this.types.MovementType.SOUTH:
          newDirection = this.types.MovementType.WEST
          break;
        case this.types.MovementType.EAST:
          newDirection = this.types.MovementType.SOUTH
          break;
        case this.types.MovementType.WEST:
          newDirection = this.types.MovementType.NORTH
          break;
        default:
          break;
      }
      this.direction = newDirection
    }
}
