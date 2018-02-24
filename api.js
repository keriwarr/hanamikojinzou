const { createStore } = require('redux')

const {
  game,
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
  movesSelector,
  PLAYER_1,
  PLAYER_2,
  MOVE_1,
  MOVE_2,
  UNKNOWN
} = require('./hanami.js')

const getOtherPlayer = player => player === PLAYER_1 ? PLAYER_2 : PLAYER_1
const setToArray = set => Array.from(set.values())
const censorOpponentMoves = moves => {
  const copy = moves.slice()

  if (copy[MOVE_1].self) {
    copy[MOVE_1] = { self: new Set([UNKNOWN]) }
  }

  if (copy[MOVE_2].self) {
    copy[MOVE_2] = { self: new Set([UNKNOWN, UNKNOWN]) }
  }

  return copy
}

const simulation = (player1, player2) => {
  const store = createStore(game)

  store.dispatch({ type: 'INITIALIZE' })

  const api = playerID => ({
    getHand: () => setToArray(handSelector(store.getState())(playerID)),
    getTotalHand: () => setToArray(totalHandSelector(store.getState())(playerID)),
    getAvailableMoves: () => setToArray(availableMovesSelector(store.getState())(playerID)),
    getFavour: () => favourSelector(store.getState()),
    getRound: () => roundSelector(store.getState()),
    getTurn: () => turnSelector(store.getState()),
    getCharm: () => playerCharmSelectorCreator(playerID)(store.getState()),
    getMoves: () => movesSelector(store.getState())[playerID],
    getOpponentHandSize: () => handSizeSelector(store.getState())(getOtherPlayer(playerID)),
    getOpponentAvaiableMoves: () => setToArray(availableMovesSelector(store.getState())(getOtherPlayer(playerID))),
    getOpponentCharm: () => playerCharmSelectorCreator(getOtherPlayer(playerID))(store.getState()),
    getOpponentMoves: () => censorOpponentMoves(movesSelector(store.getState())[getOtherPlayer(playerID)])
  })

  const p1 = player1(api(PLAYER_1))
  const p2 = player2(api(PLAYER_2))

  if (!p1.getMove || !p1.getMove3Response || !p1.getMove4Response) {
    throw new Error('ERROR: p1 is missing method declarations')
  }
  if (!p2.getMove || !p2.getMove3Response || !p2.getMove4Response) {
    throw new Error('ERROR: p2 is missing method declarations')
  }

  const players = {
    [PLAYER_1]: p1,
    [PLAYER_2]: p2
  }

  while (!gameOverSelector(store.getState())) {
    const currentPlayer = currentPlayerSelector(store.getState())
    const otherPlayer = getOtherPlayer(currentPlayer)
    const currentPlayerCards = players[currentPlayer].getMove()
    // TODO: validate currentPlayerCards
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
