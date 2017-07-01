module.exports = class Command {
    constructor(robotId, cardId, action) {
        this.robotId = robotId
        this.cardId = cardId
        this.action = action
    }
}
