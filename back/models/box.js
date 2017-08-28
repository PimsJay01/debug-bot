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
