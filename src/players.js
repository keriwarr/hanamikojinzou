'use strict'

const { MOVES: { M1, M2, M3, M4 } } = require('./constants.js')

const basicPlayer = api => ({
  getMove: () => {
    const hand = api.getHand()
    const availableMoves = api.getAvailableMoves()
    // const totalHand = api.getTotalHand()
    // const favour = api.getFavour()
    // const round = api.getRound()
    // const turn = api.getTurn()
    // const charm = api.getCharm()
    // const moves = api.getMoves()
    // const opponentHandSize = api.getOpponentHandSize()
    // const opponentAvailableMoves = api.getOpponentAvaiableMoves()
    // const opponentCharm = api.getOpponentCharm()
    // const oppenentMoves = api.getOpponentMoves()

    if (availableMoves.has(M1)) {
      return hand.take(1)
    }

    if (availableMoves.has(M2)) {
      return hand.take(2)
    }

    if (availableMoves.has(M3)) {
      return hand.take(3)
    }

    if (availableMoves.has(M4)) {
      return hand.take(4)
    }

    // TODO: how to be absolutely sure we never get here?
  },
  getMove3Response: cards => {
    return cards.first()
  },
  getMove4Response: pairs => {
    return pairs[0]
  }
})

// const hoard5sPlayer = api => ({
//   getMove: () => {
//     const hand = api.getHand()
//     // const totalHand = api.getTotalHand()
//     const availableMoves = api.getAvailableMoves()
//     // const favour = api.getFavour()
//     // const round = api.getRound()
//     // const turn = api.getTurn()
//     // const charm = api.getCharm()
//     // const moves = api.getMoves()
//     // const opponentHandSize = api.getOpponentHandSize()
//     // const opponentAvailableMoves = api.getOpponentAvaiableMoves()
//     // const opponentCharm = api.getOpponentCharm()
//     // const oppenentMoves = api.getOpponentMoves()

//     if (availableMoves.includes(MOVES['1'])) {
//       return [Math.max.apply(null, hand)]
//     }

//     if (availableMoves.includes(MOVES['2'])) {
//       let lowest = hand[0]
//       let scndlowest = hand[1]
//       hand.slice(1).forEach(card => {
//         if (card < lowest) {
//           scndlowest = lowest
//           lowest = card
//         } else if (card < scndlowest) {
//           scndlowest = card
//         }
//       })
//       return [lowest, scndlowest]
//     }

//     if (availableMoves.includes(MOVES['3'])) {
//       return [hand[0], hand[1], hand[2]]
//     }

//     if (availableMoves.includes(MOVES['4'])) {
//       return [hand[0], hand[1], hand[2], hand[3]]
//     }
//   },
//   getMove3Response: cards => {
//     return Math.max.apply(null, cards)
//   },
//   getMove4Response: pairs => {
//     return pairs[0]
//   }
// })

module.exports = {
  basicPlayer
  // hoard5sPlayer
}
