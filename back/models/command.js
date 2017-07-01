module.exports = class Command {
    constructor(robotId, card, action) {
        this.robotId = robotId
        this.card = card
        this.action = action
    }
}
