var config = require('./../config')
var Types = require('./types')
var _ = require('underscore')

module.exports = class Robot {
    constructor(id, name, health) {
        this.id = id
        this.name = name
        this.color = '0xFFFFFF'
        this.fill = '#FFFFFF'
        this.position = { x: 0, y: 0 }
        this.direction = 1
        this.health = config.maxHealth
        this.cards = []
        this.program = []
        this.compiled = false
        this.types = new Types()
        this.animation = 0
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
