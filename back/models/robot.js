module.exports = class Robot {
    constructor(id, name, position, health) {
        this.id = id
        this.name = name
        this.position = position
        this.health = health
        this.cards = []
        this.program = []
        this.ready = false
    }
}
