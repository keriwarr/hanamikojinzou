const {
  MOVE_1,
  MOVE_2,
  MOVE_3,
  MOVE_4
} = require('./hanami.js')

const basicPlayer = api => ({
  getMove: () => {
    const availableMoves = api.getAvailableMoves()
    const hand = api.getHand()
    const handArray = Array.from(hand.values())

    if (availableMoves.has(MOVE_1)) {
      return new Set([handArray[0]])
    }

    if (availableMoves.has(MOVE_2)) {
      return new Set([handArray[0], handArray[1]])
    }

    if (availableMoves.has(MOVE_3)) {
      return new Set([handArray[0], handArray[1], handArray[2]])
    }

    if (availableMoves.has(MOVE_4)) {
      return new Set([handArray[0], handArray[1], handArray[2], handArray[3]])
    }

    return new Set()
  },
  getMove3Response: cards => {
    const cardsArray = Array.from(cards.values())
    return new Set([cardsArray[0]])
  },
  getMove4Response: cards => {
    const cardsArray = Array.from(cards.values())
    return new Set([cardsArray[0], cardsArray[1]])

  }
})

exports.basicPlayer = basicPlayer
