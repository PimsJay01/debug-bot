var _ = require('underscore')

var config = require('./../config')

var Card = require('./card')
var Types = require('./../models/types')

module.exports = class Deck {
    constructor() {
        this.cards = this.buildDeck()
    }

    buildDeck() {
        let types = new Types()
        var cards = [];

        _.each(types.CardTypeRange.U_TURN, index => cards.push(new Card(cards.length, types.CardType.U_TURN, index)))
        _.each(types.CardTypeRange.ROTATE_LEFT, index => cards.push(new Card(cards.length, types.CardType.ROTATE_LEFT, index)))
        _.each(types.CardTypeRange.ROTATE_RIGHT, index => cards.push(new Card(cards.length, types.CardType.ROTATE_RIGHT, index)))
        _.each(types.CardTypeRange.BACK_UP, index => cards.push(new Card(cards.length, types.CardType.BACK_UP, index)))
        _.each(types.CardTypeRange.MOVE_1, index => cards.push(new Card(cards.length, types.CardType.MOVE_1, index)))
        _.each(types.CardTypeRange.MOVE_2, index => cards.push(new Card(cards.length, types.CardType.MOVE_2, index)))
        _.each(types.CardTypeRange.MOVE_3, index => cards.push(new Card(cards.length, types.CardType.MOVE_3, index)))

        return _.shuffle(cards);
    }

    completeCards(cards) {
        let cardsCount = config.robotMaxCards - cards.length;
        cards.push(_.first(this.cards, cardsCount))
        this.cards = _.last(this.cards, this.cards.length - cardsCount)
        return _.flatten(cards)
    }

    addCards(cards) {
        this.cards.push(cards)
        this.cards = _.flatten(_.shuffle(this.cards))
    }
}
