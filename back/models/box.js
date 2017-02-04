/* Box types
* 0: default
* 1: travelator from south to north
* 2: travelator from east to north
* 3: travelator from west to north
* 4: hole
* ...
* 9: objective
*/
module.exports = class Box {
    constructor(type, angle, walls) {
        this.type = type
        this.angle = angle
        this.walls = walls
    }
}
