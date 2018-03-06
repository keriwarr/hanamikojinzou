'use strict'

const { createStore } = require('redux')

const {
  PLAYERS,
  MOVES,
  CARDS
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

const getOtherPlayer = player => player === PLAYERS['1'] ? PLAYERS['2'] : PLAYERS['1']
const setToArray = set => Array.from(set.values())
const convertOwnMoves = moves => {
  const copy = moves.slice() // TODO: is this necessary/optimal?

  if (copy[MOVES['1']].self) {
    copy[MOVES['1']] = { self: setToArray(moves[MOVES['1']].self) }
  }

  if (copy[MOVES['2']].self) {
    copy[MOVES['2']] = { self: setToArray(moves[MOVES['2']].self) }
  }

  if (copy[MOVES['3']].self) {
    copy[MOVES['3']] = {
      self: setToArray(moves[MOVES['3']].self),
      other: setToArray(moves[MOVES['3']].other)
    }
  }

  if (copy[MOVES['4']].self) {
    copy[MOVES['4']] = {
      self: setToArray(moves[MOVES['4']].self),
      other: setToArray(moves[MOVES['4']].other)
    }
  }

  return copy
}
const censorOpponentMoves = moves => {
  const copy = moves.slice()

  if (copy[MOVES['1']].self) {
    copy[MOVES['1']] = { self: [CARDS.UNKNOWN] }
  }

  if (copy[MOVES['2']].self) {
    copy[MOVES['2']] = { self: [CARDS.UNKNOWN, CARDS.UNKNOWN] }
  }

  if (copy[MOVES['3']].self) {
    copy[MOVES['3']] = {
      self: setToArray(moves[MOVES['3']].self),
      other: setToArray(moves[MOVES['3']].other)
    }
  }

  if (copy[MOVES['4']].self) {
    copy[MOVES['4']] = {
      self: setToArray(moves[MOVES['4']].self),
      other: setToArray(moves[MOVES['4']].other)
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

  const p1 = player1(api(PLAYERS['1']))
  const p2 = player2(api(PLAYERS['2']))

  if (!p1.getMove || !p1.getMove3Response || !p1.getMove4Response) {
    throw new Error('ERROR: p1 is missing method declarations')
  }
  if (!p2.getMove || !p2.getMove3Response || !p2.getMove4Response) {
    throw new Error('ERROR: p2 is missing method declarations')
  }

  const players = {
    [PLAYERS['1']]: p1,
    [PLAYERS['2']]: p2
  }

  while (!gameOverSelector(store.getState())) {
    const currentPlayer = currentPlayerSelector(store.getState())
    const otherPlayer = getOtherPlayer(currentPlayer)
    const currentPlayerCards = players[currentPlayer].getMove()
    // TODO: validate currentPlayerCards
    // TODO: How much validation to
    const otherPlayerCards = (() => {
      if (currentPlayerCards.length === 3) return [players[otherPlayer].getMove3Response(currentPlayerCards)]
      if (currentPlayerCards.length === 4) {
        return players[otherPlayer].getMove4Response([
          [currentPlayerCards[0], currentPlayerCards[1]],
          [currentPlayerCards[2], currentPlayerCards[3]]
        ])
      }
      return []
    })()

    store.dispatch({
      type: 'TURN',
      payload: {
        cards: {
          currentPlayerCards: new Set(currentPlayerCards),
          otherPlayerCards: new Set(otherPlayerCards)
        }
      }
    })
  }

  return winnerSelector(store.getState())
}

exports.simulation = simulation
