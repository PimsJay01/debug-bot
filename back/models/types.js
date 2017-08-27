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


var _ = require('underscore')

module.exports = class Types {
    constructor() {
        this.MovementType = {
          NORTH : 0,
          EAST : 1,
          SOUTH : 2,
          WEST : 3,
          TURN_RIGHT : 4,
          TURN_LEFT : 5,
          U_TURN : 6,
          STAY : 7,
          REMOVELIFE : 8,
          FIRELASER : 9
        }

        this.BoxType = {
          DEFAULT : 0,
          START_1 : 1,
          START_2 : 2,
          START_3 : 3,
          START_4 : 4,
          TRAVELATOR_S_N : 5,
          TRAVELATOR_W_E : 6,
          TRAVELATOR_N_S : 7,
          TRAVELATOR_E_W : 8,
          HOLE : 9,
          TARGET : 10
        }

        this.CardType = {
          U_TURN : 0,
          ROTATE_LEFT: 1,
          ROTATE_RIGHT : 2,
          BACK_UP : 3,
          MOVE_1 : 4,
          MOVE_2 : 5,
          MOVE_3 : 6
        }

        this.CardTypeRange = {
          U_TURN : _.range(1,6),
          ROTATE_LEFT : _.range(7,42,2),
          ROTATE_RIGHT : _.range(8,43,2),
          BACK_UP : _.range(43,49),
          MOVE_1 : _.range(49,67),
          MOVE_2 : _.range(67,79),
          MOVE_3 : _.range(79,85)
        }
    }
}
