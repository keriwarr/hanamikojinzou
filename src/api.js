'use strict'

const { createStore } = require('redux')

const {
  PLAYER,
  MOVE,
  GEISHA
} = require('./constants.js')
const {
  handSelector,
  gameOverSelector,
  currentPlayerSelector,
  winnerSelector,
  availableMovesSelector,
  totalHandSelector,
  handSizeSelector,
  favourSelector,
  roundSelector,
  turnSelector,
  playerCharmSelectorCreator,
  movesSelector
} = require('./selectors.js')
const { hanamikojiReducer } = require('./reducer.js')
const { getOtherPlayer } = require('./utils.js')

const setToArray = set => Array.from(set)
const convertOwnMoves = moves => {
  const copy = moves.slice() // TODO: is this necessary/optimal?

  if (copy[MOVE.SECRET].self) {
    copy[MOVE.SECRET] = { self: setToArray(moves[MOVE.SECRET].self) }
  }

  if (copy[MOVE.TRADEOFF].self) {
    copy[MOVE.TRADEOFF] = { self: setToArray(moves[MOVE.TRADEOFF].self) }
  }

  if (copy[MOVE.GIFT].self) {
    copy[MOVE.GIFT] = {
      self: setToArray(moves[MOVE.GIFT].self),
      other: setToArray(moves[MOVE.GIFT].other)
    }
  }

  if (copy[MOVE.COMPETITION].self) {
    copy[MOVE.COMPETITION] = {
      self: setToArray(moves[MOVE.COMPETITION].self),
      other: setToArray(moves[MOVE.COMPETITION].other)
    }
  }

  return copy
}
const censorOpponentMoves = moves => {
  const copy = moves.slice()

  if (copy[MOVE.SECRET].self) {
    copy[MOVE.SECRET] = { self: [GEISHA.UNKNOWN] }
  }

  if (copy[MOVE.TRADEOFF].self) {
    copy[MOVE.TRADEOFF] = { self: [GEISHA.UNKNOWN, GEISHA.UNKNOWN] }
  }

  if (copy[MOVE.GIFT].self) {
    copy[MOVE.GIFT] = {
      self: setToArray(moves[MOVE.GIFT].self),
      other: setToArray(moves[MOVE.GIFT].other)
    }
  }

  if (copy[MOVE.COMPETITION].self) {
    copy[MOVE.COMPETITION] = {
      self: setToArray(moves[MOVE.COMPETITION].self),
      other: setToArray(moves[MOVE.COMPETITION].other)
    }
  }

  return copy
}

const simulation = (player1, player2) => {
  const store = createStore(hanamikojiReducer)

  store.dispatch({ type: 'INITIALIZE' })

  const api = playerID => ({
    getHand: () => setToArray(handSelector(store.getState())(playerID)),
    getTotalHand: () => setToArray(totalHandSelector(store.getState())(playerID)),
    getAvailableMoves: () => setToArray(availableMovesSelector(store.getState())(playerID)),
    getFavour: () => favourSelector(store.getState()),
    getRound: () => roundSelector(store.getState()),
    getTurn: () => turnSelector(store.getState()),
    getCharm: () => playerCharmSelectorCreator(playerID)(store.getState()),
    getMoves: () => convertOwnMoves(movesSelector(store.getState())[playerID]),
    getOpponentHandSize: () => handSizeSelector(store.getState())(getOtherPlayer(playerID)),
    getOpponentAvaiableMoves: () => setToArray(availableMovesSelector(store.getState())(getOtherPlayer(playerID))),
    getOpponentCharm: () => playerCharmSelectorCreator(getOtherPlayer(playerID))(store.getState()),
    getOpponentMoves: () => censorOpponentMoves(movesSelector(store.getState())[getOtherPlayer(playerID)])
  })

  const p1 = player1(api(PLAYER.FIRST))
  const p2 = player2(api(PLAYER.SECOND))

  if (!p1.getMove || !p1.getMove3Response || !p1.getMove4Response) {
    throw new Error('ERROR: p1 is missing method declarations')
  }
  if (!p2.getMove || !p2.getMove3Response || !p2.getMove4Response) {
    throw new Error('ERROR: p2 is missing method declarations')
  }

  const players = {
    [PLAYER.FIRST]: p1,
    [PLAYER.SECOND]: p2
  }

  while (!gameOverSelector(store.getState())) {
    const currentPlayer = currentPlayerSelector(store.getState())
    const otherPlayer = getOtherPlayer(currentPlayer)
    const currentPlayerGEISHA = players[currentPlayer].getMove()
    // TODO: validate currentPlayerGEISHA
    // TODO: How much validation to
    const otherPlayerGEISHA = (() => {
      if (currentPlayerGEISHA.length === 3) return [players[otherPlayer].getMove3Response(currentPlayerGEISHA)]
      if (currentPlayerGEISHA.length === 4) {
        return players[otherPlayer].getMove4Response([
          [currentPlayerGEISHA[0], currentPlayerGEISHA[1]],
          [currentPlayerGEISHA[2], currentPlayerGEISHA[3]]
        ])
      }
      return []
    })()

    store.dispatch({
      type: 'TURN',
      payload: {
        currentPlayerGEISHA: new Set(currentPlayerGEISHA),
        otherPlayerGEISHA: new Set(otherPlayerGEISHA)
      }
    })
  }

  return winnerSelector(store.getState())
}

exports.simulation = simulation
