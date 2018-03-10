'use strict'

const { createStore } = require('redux')

const { hanamikojiReducer } = require('./reducer.js')
const {
  PLAYERS,
  MOVES
} = require('./constants.js')
const { executeTrial } = require('./api.js')
const {
  basicPlayer
  // hoard5sPlayer
} = require('./players.js')
const {
  handSelectors,
  totalHandSelectors,
  availableMovesSelectors,
  favourSelector,
  roundSelector,
  turnSelector,
  charmSelectors,
  movesSelector,
  handSizeSelectors
} = require('./selectors.js')
const { CardSet, getOtherPlayer } = require('./utils.js')

const censorOpponentMoves = moves => [MOVES.M1, MOVES.M2].reduce((censored, move) =>
  censored.getIn([move, 'self'])
    ? censored.setIn([move, 'self'], censored.getIn([move, 'self']).censor())
    : censored,
moves)

const store = createStore(hanamikojiReducer)

const api = playerID => ({
  getHand: () => new CardSet(handSelectors[playerID](store.getState())),
  getTotalHand: () => new CardSet(totalHandSelectors[playerID](store.getState())),
  getAvailableMoves: () => availableMovesSelectors[playerID](store.getState()),
  getFavour: () => favourSelector(store.getState()),
  getRound: () => roundSelector(store.getState()),
  getTurn: () => turnSelector(store.getState()),
  getCharm: () => charmSelectors[playerID](store.getState()),
  getMoves: () => movesSelector(store.getState())[playerID],
  getOpponentHandSize: () => handSizeSelectors(getOtherPlayer[playerID])(store.getState()),
  getOpponentAvaiableMoves: () => availableMovesSelectors[getOtherPlayer[playerID]](store.getState()),
  getOpponentCharm: () => charmSelectors[getOtherPlayer(playerID)](store.getState()),
  getOpponentMoves: () => censorOpponentMoves(movesSelector(store.getState())[getOtherPlayer(playerID)])
})

const playerA = basicPlayer
const playerB = basicPlayer

let playerAWins = 0
let playerBWins = 0

// TODO: atm , player 1 means first player and player 2 means seconds player
// this means that the first player passed to executeTrial must always be the one
// that was initialized with PLAYERS.P1. _This_ means that we have to initialize
// each player more than once. Kinda awkward

// TODO: reintroduce this check
// if (!p1.getMove || !p1.getMove3Response || !p1.getMove4Response) {
//   throw new Error('ERROR: p1 is missing method declarations')
// }
// if (!p2.getMove || !p2.getMove3Response || !p2.getMove4Response) {
//   throw new Error('ERROR: p2 is missing method declarations')
// }

for (let i = 0; i < 10000; i += 1) {
  const player1 = ((i % 2) === 0 ? playerA : playerB)(api(PLAYERS.P1))
  const player2 = ((i % 2) === 0 ? playerB : playerA)(api(PLAYERS.P2))

  const result = executeTrial(store, player1, player2)

  if (
    (result === PLAYERS.P1 && (i % 2) === 0) ||
    (result === PLAYERS.P2 && (i % 2) === 1)
  ) {
    playerAWins += 1
  } else {
    playerBWins += 1
  }
}

console.log(`Player A: ${playerAWins}`)
console.log(`Player B: ${playerBWins}`)
