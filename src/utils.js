'use strict'

const { CARDS, DECK } = require('./constants.js')

const cardType = card => {
  if (card >= 0 && card <= 1) return CARDS.PURPLE_2
  else if (card >= 2 && card <= 3) return CARDS.RED_2
  else if (card >= 4 && card <= 5) return CARDS.YELLOW_2
  else if (card >= 6 && card <= 8) return CARDS.BLUE_3
  else if (card >= 9 && card <= 11) return CARDS.ORANGE_3
  else if (card >= 12 && card <= 15) return CARDS.GREEN_4
  else if (card >= 16 && card <= 20) return CARDS.PINK_5
  else throw new Error('ERROR: invalid card number')
}

const shuffle = arr => {
  let a = arr.slice() // Is this the best way to return a _new_ shuffled array? Though perhaps the call to new Set() is copying the data too so this isn't needed?
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

const getNewDeck = () => new Set(shuffle(DECK))

module.exports = {
  cardType,
  shuffle,
  getNewDeck
}
