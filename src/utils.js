'use strict'

const { GEISHA, PLAYER } = require('./constants.js')

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

const getShuffledDeck = () => {
  let a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return new Set(a)
}

const isValidCard = card => Number.isInteger(card) && card >= 1 && card <= 21
const isValidCardSet = cardSet => {
  cardSet.forEach(card => {
    if (!isValidCard(card)) return false
  })
  return true
}

const getOtherPlayer = player => player === PLAYER.FIRST ? PLAYER.SECOND : PLAYER.FIRST

const playerToString = player => {
  switch (player) {
    case PLAYER.FIRST:
      return 'first'
    case PLAYER.SECOND:
      return 'second'
    default:
      return 'invalid'
  }
}

const isSubset = (set1, set2) => {
  set1.forEach(elem => {
    if (!set2.has(elem)) return false
  })
  return true
}

module.exports = {
  cardType,
  getShuffledDeck,
  isValidCard,
  isValidCardSet,
  getOtherPlayer,
  playerToString,
  isSubset
}
