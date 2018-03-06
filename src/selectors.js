'use strict'

const { createSelector } = require('reselect')

const {
  CARDS,
  PLAYERS,
  MOVES,
  MAX_HAND_SIZE,
  STARTING_HAND_SIZE,
  CARD_VALUE_MAP,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  LAST_TURN
} = require('./constants.js')
const { cardType } = require('./utils.js')

const roundSelector = state => state.round
const favourSelector = state => state.favour
const deckSelector = state => state.deck
const movesSelector = state => state.moves

// Which, of the four kinds of moves has a player not taken this round
const availableMovesSelector = createSelector(
  movesSelector,
  moves => playerID => {
    const availableMoves = new Set()
    Object.values(MOVES).forEach(move => {
      if (moves[playerID][move].self === null) availableMoves.add(move)
    })
    return availableMoves
  }
)

// How many turns in total have been taken this round
const turnSelector = createSelector(
  movesSelector,
  moves => moves[PLAYERS['1']].concat(moves[PLAYERS['2']]).reduce(
    (total, selection) => selection.self === null ? total : total + 1,
    0
  )
)

// Who's turn is it
const currentPlayerSelector = createSelector(
  roundSelector,
  turnSelector,
  (round, turn) => (round + turn) % 2
)

// All of the cards that you have ever drawn into your hand this round
const totalHandSelector = createSelector(
  turnSelector,
  deckSelector,
  (turn, deck) => playerID => {
    const start = playerID * MAX_HAND_SIZE
    const count = Math.floor(turn / 2) + STARTING_HAND_SIZE
    return new Set(Array.from(deck.values()).slice(start, start + count))
  }
)

// All of the cards which you have ever drawn into your hand and haven't played yet, this round
const handSelector = createSelector(
  totalHandSelector,
  movesSelector,
  (totalHand, moves) => playerID => {
    const playerTotalHand = totalHand(playerID)
    const hand = new Set(playerTotalHand)

    moves[playerID].forEach(move => {
      if (move.self) move.self.forEach(card => hand.delete(card))
    })

    return hand
  }
)

const handSizeSelector = createSelector(
  handSelector,
  hand => playerID => hand(playerID).size
)

// How favour would be allocated right now, according to the current distribution of item cards, and the existing favour
const currentFavourSelector = createSelector(
  movesSelector,
  favourSelector,
  (moves, favour) => {
    const player1Cards = new Set()
    const player2Cards = new Set()
    const player1ItemCount = {
      [CARDS.PURPLE_2]: 0,
      [CARDS.RED_2]: 0,
      [CARDS.YELLOW_2]: 0,
      [CARDS.BLUE_3]: 0,
      [CARDS.ORANGE_3]: 0,
      [CARDS.GREEN_4]: 0,
      [CARDS.PINK_5]: 0
    }
    const player2ItemCount = {
      [CARDS.PURPLE_2]: 0,
      [CARDS.RED_2]: 0,
      [CARDS.YELLOW_2]: 0,
      [CARDS.BLUE_3]: 0,
      [CARDS.ORANGE_3]: 0,
      [CARDS.GREEN_4]: 0,
      [CARDS.PINK_5]: 0
    }

    if (moves[PLAYERS['1']][MOVES['1']].self) {
      moves[PLAYERS['1']][MOVES['1']].self.forEach(card => player1Cards.add(card))
    }
    if (moves[PLAYERS['2']][MOVES['1']].self) {
      moves[PLAYERS['2']][MOVES['1']].self.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['1']][MOVES['3']].self) {
      moves[PLAYERS['1']][MOVES['3']].self.forEach(card => player1Cards.add(card))
      moves[PLAYERS['1']][MOVES['3']].other.forEach(card => player1Cards.delete(card))
      moves[PLAYERS['1']][MOVES['3']].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['2']][MOVES['3']].self) {
      moves[PLAYERS['2']][MOVES['3']].self.forEach(card => player2Cards.add(card))
      moves[PLAYERS['2']][MOVES['3']].other.forEach(card => player2Cards.delete(card))
      moves[PLAYERS['2']][MOVES['3']].other.forEach(card => player1Cards.add(card))
    }

    if (moves[PLAYERS['1']][MOVES['4']].self) {
      moves[PLAYERS['1']][MOVES['4']].self.forEach(card => player1Cards.add(card))
      moves[PLAYERS['1']][MOVES['4']].other.forEach(card => player1Cards.delete(card))
      moves[PLAYERS['1']][MOVES['4']].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYERS['2']][MOVES['4']].self) {
      moves[PLAYERS['2']][MOVES['4']].self.forEach(card => player2Cards.add(card))
      moves[PLAYERS['2']][MOVES['4']].other.forEach(card => player2Cards.delete(card))
      moves[PLAYERS['2']][MOVES['4']].other.forEach(card => player1Cards.add(card))
    }

    player1Cards.forEach(card => {
      player1ItemCount[cardType(card)] += 1
    })

    player2Cards.forEach(card => {
      player2ItemCount[cardType(card)] += 1
    })

    return Object.values(CARDS).map((type, index) => {
      if (player1ItemCount[type] > player2ItemCount[type]) return PLAYERS['1']
      if (player2ItemCount[type] > player1ItemCount[type]) return PLAYERS['2']
      return favour[index]
    })
  }
)

const playerCharmSelectorCreator = playerID => createSelector(
  favourSelector,
  // FIXME: I'm here abusing the fact that the values assigned to each card by the CARDS enum
  // corresponds to their position in the CARD_VALUE_MAP
  favour => favour.map((player, index) => player === playerID ? Object.values(CARD_VALUE_MAP)[index] : 0).reduce((a, b) => a + b, 0)
)
// How many charm points each player has
const player1CharmSelector = playerCharmSelectorCreator(PLAYERS['1'])
const player2CharmSelector = playerCharmSelectorCreator(PLAYERS['2'])

const playerGeishasSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => favour.map((player, index) => player === playerID ? 1 : 0).reduce((a, b) => a + b, 0)
)
// How many geishas each player has charmed
const player1GeishaSelector = playerGeishasSelectorCreator(PLAYERS['1'])
const player2GeishaSelector = playerGeishasSelectorCreator(PLAYERS['2'])

const winnerSelector = createSelector(
  player1CharmSelector,
  player2CharmSelector,
  player1GeishaSelector,
  player2GeishaSelector,
  (p1charm, p2charm, p1geisha, p2geisha) => {
    if (p1charm >= CHARM_THRESHOLD) return PLAYERS['1']
    else if (p2charm >= CHARM_THRESHOLD) return PLAYERS['2']
    else if (p1geisha >= GEISHA_THRESHOLD) return PLAYERS['1']
    else if (p2geisha >= GEISHA_THRESHOLD) return PLAYERS['2']
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
  availableMovesSelector,
  turnSelector,
  currentPlayerSelector,
  totalHandSelector,
  handSelector,
  handSizeSelector,
  currentFavourSelector,
  player1CharmSelector,
  player2CharmSelector,
  player1GeishaSelector,
  player2GeishaSelector,
  winnerSelector,
  roundOverSelector,
  gameOverSelector
}
