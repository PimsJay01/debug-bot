/* Card types
* 0: u-turn       6   1-6
* 1: rotate left  18  7-41 (2)
* 2: rotate right  18  8-42 (2)
* 3: back-up      6   43-48
* 4: move 1       18  49-66
* 5: move 2       12  67-78
* 6: move 3       6   79-84
*/
module.exports = class Card {
    constructor(id, type, priority) {
        this.id = id
        this.type = type
        this.priority = priority
    }
}
