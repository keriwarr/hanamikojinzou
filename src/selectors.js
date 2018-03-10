'use strict'

const { createSelector } = require('reselect')
const { Set } = require('immutable')

const {
  GEISHA,
  PLAYERS,
  MOVES,
  MAX_HAND_SIZE,
  STARTING_HAND_SIZE,
  CARD_VALUE_MAP,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  LAST_TURN,
  FavourRecord
} = require('./constants.js')
const { cardType } = require('./utils.js')

const roundSelector = state => state.round
const favourSelector = state => state.favour
const deckSelector = state => state.deck
const movesSelector = state => state.moves

// Which, of the four kinds of moves has a player not taken this round
// TODO: test this
const availableMovesSelectorCreator = playerID => createSelector(
  movesSelector,
  moves => MOVES.reduce((availableMoves, move) =>
    moves[playerID][move].self
      ? availableMoves
      : availableMoves.add(move),
  Set())
)
const player1AvailableMovesSelector = availableMovesSelectorCreator(PLAYERS.P1)
const player2AvailableMovesSelector = availableMovesSelectorCreator(PLAYERS.P2)
const availableMovesSelectors = {
  [PLAYERS.P1]: player1AvailableMovesSelector,
  [PLAYERS.P2]: player2AvailableMovesSelector
}

// How many turns in total have been taken this round
// TODO: should this just be spelled out explicitly?
// TODO: test this
const turnSelector = createSelector(
  movesSelector,
  moves => PLAYERS.reduce((playerTotal, p) => playerTotal + MOVES.reduce((movesTotal, m) =>
    movesTotal + (moves[p][m].self === null ? 0 : 1), 0
  ), 0)
)

// Who's turn is it
const currentPlayerSelector = createSelector(
  roundSelector,
  turnSelector,
  (round, turn) => ((round + turn) % 2) === 0 ? PLAYERS.P1 : PLAYERS.P2
)

// All of the cards that you have ever drawn into your hand this round
// TODO: test this
const totalHandSelectorCreator = playerID => createSelector(
  turnSelector,
  roundSelector,
  deckSelector,
  (turn, round, deck) => {
    const start = playerID === PLAYERS.P1 ? 0 : MAX_HAND_SIZE
    const cardDrawingOffset = (
      ((playerID === PLAYERS.P1) && (round % 2 === 0)) ||
      ((playerID === PLAYERS.P2) && (round % 2 === 1))
    ) ? 2 : 1
    const count = Math.floor((turn + cardDrawingOffset) / 2) + STARTING_HAND_SIZE
    return deck.slice(start, start + count)
  }
)
const player1TotalHandSelector = totalHandSelectorCreator(PLAYERS.P1)
const player2TotalHandSelector = totalHandSelectorCreator(PLAYERS.P2)
const totalHandSelectors = {
  [PLAYERS.P1]: player1TotalHandSelector,
  [PLAYERS.P2]: player2TotalHandSelector
}

// All of the cards which you have ever drawn into your hand and haven't played yet, this round
// TODO: test this
const handSelectorCreator = playerID => createSelector(
  totalHandSelectorCreator(playerID),
  movesSelector,
  (totalHand, moves) => MOVES.reduce((hand, move) =>
    moves[playerID][move].self
      ? hand.subtract(moves[playerID][move].self)
      : hand,
  totalHand)
)
const player1HandSelector = handSelectorCreator(PLAYERS.P1)
const player2HandSelector = handSelectorCreator(PLAYERS.P2)
const handSelectors = {
  [PLAYERS.P1]: player1HandSelector,
  [PLAYERS.P2]: player2HandSelector
}

const handSizeSelectorCreator = playerID => createSelector(
  handSelectorCreator(playerID),
  hand => hand.size
)
const player1HandSizeSelector = handSizeSelectorCreator(PLAYERS.P1)
const player2HandSizeSelector = handSizeSelectorCreator(PLAYERS.P2)
const handSizeSelectors = {
  [PLAYERS.P1]: player1HandSizeSelector,
  [PLAYERS.P2]: player2HandSizeSelector
}

// How favour would be allocated right now, according to the current distribution of item cards, and the existing favour
// TODO: test this
const currentFavourSelector = createSelector(
  movesSelector,
  favourSelector,
  (moves, favour) => {
    let player1Cards = Set()
    let player2Cards = Set()
    const player1ItemCount = {
      [GEISHA.PURPLE_2]: 0,
      [GEISHA.RED_2]: 0,
      [GEISHA.YELLOW_2]: 0,
      [GEISHA.BLUE_3]: 0,
      [GEISHA.ORANGE_3]: 0,
      [GEISHA.GREEN_4]: 0,
      [GEISHA.PINK_5]: 0
    }
    const player2ItemCount = {
      [GEISHA.PURPLE_2]: 0,
      [GEISHA.RED_2]: 0,
      [GEISHA.YELLOW_2]: 0,
      [GEISHA.BLUE_3]: 0,
      [GEISHA.ORANGE_3]: 0,
      [GEISHA.GREEN_4]: 0,
      [GEISHA.PINK_5]: 0
    }

    if (moves[PLAYERS.P1][MOVES.M1].self) {
      player1Cards = player1Cards.union(moves[PLAYERS.P1][MOVES.M1].self)
    }
    if (moves[PLAYERS.P2][MOVES.M1].self) {
      player2Cards = player2Cards.union(moves[PLAYERS.P2][MOVES.M1].self)
    }

    if (moves[PLAYERS.P1][MOVES.M3].self) {
      player1Cards = player1Cards.union(moves[PLAYERS.P1][MOVES.M3].self)
      player1Cards = player1Cards.subtract(moves[PLAYERS.P1][MOVES.M3].other)
      player2Cards = player2Cards.union(moves[PLAYERS.P1][MOVES.M3].other)
    }

    if (moves[PLAYERS.P2][MOVES.M3].self) {
      player2Cards = player2Cards.union(moves[PLAYERS.P2][MOVES.M3].self)
      player2Cards = player2Cards.subtract(moves[PLAYERS.P2][MOVES.M3].other)
      player1Cards = player1Cards.union(moves[PLAYERS.P2][MOVES.M3].other)
    }

    if (moves[PLAYERS.P1][MOVES.M4].self) {
      player1Cards = player1Cards.union(moves[PLAYERS.P1][MOVES.M4].self)
      player1Cards = player1Cards.subtract(moves[PLAYERS.P1][MOVES.M4].other)
      player2Cards = player2Cards.union(moves[PLAYERS.P1][MOVES.M4].other)
    }

    if (moves[PLAYERS.P2][MOVES.M4].self) {
      player2Cards = player2Cards.union(moves[PLAYERS.P2][MOVES.M4].self)
      player2Cards = player2Cards.subtract(moves[PLAYERS.P2][MOVES.M4].other)
      player1Cards = player1Cards.union(moves[PLAYERS.P2][MOVES.M4].other)
    }

    player1Cards.forEach(card => {
      player1ItemCount[cardType(card)] += 1
    })

    player2Cards.forEach(card => {
      player2ItemCount[cardType(card)] += 1
    })

    return new FavourRecord(GEISHA.reduce((newFavour, geisha) => {
      return Object.assign({}, newFavour, {
        [geisha]: (player1ItemCount[geisha] > player2ItemCount[geisha]
          ? PLAYERS.P1
          : (player2ItemCount[geisha] > player1ItemCount[geisha]
            ? PLAYERS.P2
            : favour[geisha]
          )
        )
      })
    }))
  }
)

const playerCharmSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => GEISHA.reduce((charm, geisha) => favour[geisha] === playerID ? charm + CARD_VALUE_MAP[geisha] : charm, 0)
)
// How many charm points each player has
const player1CharmSelector = playerCharmSelectorCreator(PLAYERS.P1)
const player2CharmSelector = playerCharmSelectorCreator(PLAYERS.P2)
const charmSelectors = {
  [PLAYERS.P1]: player1CharmSelector,
  [PLAYERS.P2]: player2CharmSelector
}

const playerGeishasSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => GEISHA.reduce((count, geisha) => favour[geisha] === playerID ? count + 1 : count, 0)
)
// How many geishas each player has charmed
const player1GeishaSelector = playerGeishasSelectorCreator(PLAYERS.P1)
const player2GeishaSelector = playerGeishasSelectorCreator(PLAYERS.P2)
const geishaSelectors = {
  [PLAYERS.P1]: player1GeishaSelector,
  [PLAYERS.P2]: player2GeishaSelector
}

const winnerSelector = createSelector(
  player1CharmSelector,
  player2CharmSelector,
  player1GeishaSelector,
  player2GeishaSelector,
  (p1charm, p2charm, p1geisha, p2geisha) => {
    if (p1charm >= CHARM_THRESHOLD) return PLAYERS.P1
    else if (p2charm >= CHARM_THRESHOLD) return PLAYERS.P2
    else if (p1geisha >= GEISHA_THRESHOLD) return PLAYERS.P1
    else if (p2geisha >= GEISHA_THRESHOLD) return PLAYERS.P2
    else return null
  }
)

const roundOverSelector = createSelector(
  turnSelector,
  turn => turn > LAST_TURN
)

const gameOverSelector = createSelector(
  winnerSelector,
  winner => winner !== null
)

module.exports = {
  roundSelector,
  favourSelector,
  deckSelector,
  movesSelector,
  player1AvailableMovesSelector,
  player2AvailableMovesSelector,
  availableMovesSelectors,
  turnSelector,
  currentPlayerSelector,
  player1TotalHandSelector,
  player2TotalHandSelector,
  totalHandSelectors,
  player1HandSelector,
  player2HandSelector,
  handSelectors,
  player1HandSizeSelector,
  player2HandSizeSelector,
  handSizeSelectors,
  currentFavourSelector,
  player1CharmSelector,
  player2CharmSelector,
  charmSelectors,
  player1GeishaSelector,
  player2GeishaSelector,
  geishaSelectors,
  winnerSelector,
  roundOverSelector,
  gameOverSelector
}
