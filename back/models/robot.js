var config = require('./../config')

module.exports = class Robot {
    constructor(id, name, avatarId) {
        this.id = id
        this.name = name
        this.color = '0xFFFFFF'
        this.fill = '#FFFFFF'
        this.avatarId = avatarId
        this.position = { x: 0, y: 0 }
        this.direction = 1
        this.health = config.maxHealth
        this.cards = []
        this.program = []
        this.compiled = false
        this.animation = 0
    }
}
