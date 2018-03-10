'use strict'

const { OrderedSet } = require('immutable')

const { GEISHA, PLAYERS } = require('./constants.js')

const cardType = card => {
  if (card >= 0 && card <= 1) return GEISHA.PURPLE_2
  else if (card >= 2 && card <= 3) return GEISHA.RED_2
  else if (card >= 4 && card <= 5) return GEISHA.YELLOW_2
  else if (card >= 6 && card <= 8) return GEISHA.BLUE_3
  else if (card >= 9 && card <= 11) return GEISHA.ORANGE_3
  else if (card >= 12 && card <= 15) return GEISHA.GREEN_4
  else if (card >= 16 && card <= 20) return GEISHA.PINK_5
  else throw new Error('ERROR: invalid card number')
}

// The deck is modeled like this so that it can be represented as a set of unique elements.
// We're also taking advantage of the fact that the set is ordered though, which is kind of
// weird. Alternatives should be considered.
const getShuffledDeck = () => {
  let deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  var j, x, i
  for (i = deck.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = deck[i]
    deck[i] = deck[j]
    deck[j] = x
  }
  let immutableDeck = OrderedSet()
  deck.forEach(card => { immutableDeck = immutableDeck.add(card) })
  return immutableDeck
}

// NOTE: this could be re-implemented to have no OrderedSet, rather than an empty one, when no cards are passed to the constructor
class CardSet {
  constructor (cards) {
    this.cards = cards || OrderedSet()
  }

  get size () {
    return this.cards.size
  }

  slice (begin, end) {
    return this.cards.slice(begin, end)
  }

  toOrderedSet () {
    return this.cards
  }

  censor () {
    // TODO: how to represent unknown better
    return this.cards.map(() => '-1')
  }

  take (n) {
    return this.cards.take(n)
  }

  first () {
    return this.cards.first()
  }
}

const getOtherPlayer = player => player === PLAYERS.P1 ? PLAYERS.P2 : PLAYERS.P1

module.exports = {
  cardType,
  getShuffledDeck,
  CardSet,
  getOtherPlayer
}
