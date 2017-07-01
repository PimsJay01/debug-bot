/* Box types
* 0: default
* 1: travelator from south to north
* 2: travelator from west to east
* 3: travelator from north to south
* 3: travelator from east to west
* 4: hole
* ...
* 9: objective
*/
module.exports = class Box {
    constructor(type, walls) {
        this.type = type
        this.walls = walls
    }
}
