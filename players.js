const {
  MOVE_1,
  MOVE_2,
  MOVE_3,
  MOVE_4
} = require('./hanami.js')

const basicPlayer = api => ({
  getMove: () => {
    const hand = api.getHand()
    const totalHand = api.getTotalHand()
    const availableMoves = api.getAvailableMoves()
    const favour = api.getFavour()
    const round = api.getRound()
    const turn = api.getTurn()
    const charm = api.getCharm()
    const moves = api.getMoves()
    const opponentHandSize = api.getOpponentHandSize()
    const opponentAvailableMoves = api.getOpponentAvaiableMoves()
    const opponentCharm = api.getOpponentCharm()
    const oppenentMoves = api.getOpponentMoves()

    // console.log('round:', round)
    // console.log('turn:', turn)
    // console.log('hand:', hand)
    // console.log('total hand:', totalHand)
    // console.log('available moves:', availableMoves)
    // console.log('favour:', favour)
    // console.log('charm:', charm)
    // console.log('moves:', moves)
    // console.log('opponent hand size:', opponentHandSize)
    // console.log('opponent available moves:', opponentAvailableMoves)
    // console.log('opponent charm:', opponentCharm)
    // console.log('opponent moves:', oppenentMoves)
    // console.log('----------------')

    if (availableMoves.includes(MOVE_1)) {
      return [hand[0]]
    }

    if (availableMoves.includes(MOVE_2)) {
      return [hand[0], hand[1]]
    }

    if (availableMoves.includes(MOVE_3)) {
      return [hand[0], hand[1], hand[2]]
    }

    if (availableMoves.includes(MOVE_4)) {
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

exports.basicPlayer = basicPlayer
