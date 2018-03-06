const {
  MOVES
} = require('./hanami.js')

const basicPlayer = api => ({
  getMove: () => {
    const hand = api.getHand()
    // const totalHand = api.getTotalHand()
    const availableMoves = api.getAvailableMoves()
    // const favour = api.getFavour()
    // const round = api.getRound()
    // const turn = api.getTurn()
    // const charm = api.getCharm()
    // const moves = api.getMoves()
    // const opponentHandSize = api.getOpponentHandSize()
    // const opponentAvailableMoves = api.getOpponentAvaiableMoves()
    // const opponentCharm = api.getOpponentCharm()
    // const oppenentMoves = api.getOpponentMoves()

    if (availableMoves.includes(MOVES['1'])) {
      return [hand[0]]
    }

    if (availableMoves.includes(MOVES['2'])) {
      return [hand[0], hand[1]]
    }

    if (availableMoves.includes(MOVES['3'])) {
      return [hand[0], hand[1], hand[2]]
    }

    if (availableMoves.includes(MOVES['4'])) {
      return [hand[0], hand[1], hand[2], hand[3]]
    }
  },
  getMove3Response: cards => {
    return cards[0]
  },
  getMove4Response: pairs => {
    return pairs[0]
  }
})

const hoard5sPlayer = api => ({
  getMove: () => {
    const hand = api.getHand()
    // const totalHand = api.getTotalHand()
    const availableMoves = api.getAvailableMoves()
    // const favour = api.getFavour()
    // const round = api.getRound()
    // const turn = api.getTurn()
    // const charm = api.getCharm()
    // const moves = api.getMoves()
    // const opponentHandSize = api.getOpponentHandSize()
    // const opponentAvailableMoves = api.getOpponentAvaiableMoves()
    // const opponentCharm = api.getOpponentCharm()
    // const oppenentMoves = api.getOpponentMoves()

    if (availableMoves.includes(MOVES['1'])) {
      return [Math.max.apply(null, hand)]
    }

    if (availableMoves.includes(MOVES['2'])) {
      let lowest = hand[0]
      let scndlowest = hand[1]
      hand.slice(1).forEach(card => {
        if (card < lowest) {
          scndlowest = lowest
          lowest = card
        } else if (card < scndlowest) {
          scndlowest = card
        }
      })
      return [lowest, scndlowest]
    }

    if (availableMoves.includes(MOVES['3'])) {
      return [hand[0], hand[1], hand[2]]
    }

    if (availableMoves.includes(MOVES['4'])) {
      return [hand[0], hand[1], hand[2], hand[3]]
    }
  },
  getMove3Response: cards => {
    return Math.max.apply(null, cards)
  },
  getMove4Response: pairs => {
    return pairs[0]
  }
})

exports.basicPlayer = basicPlayer
exports.hoard5sPlayer = hoard5sPlayer
