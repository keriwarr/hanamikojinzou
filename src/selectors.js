'use strict'

const { createSelector } = require('reselect')

const {
  GEISHA,
  PLAYER,
  MOVE,
  ALL_MOVES,
  MAX_HAND_SIZE,
  STARTING_HAND_SIZE,
  CARD_VALUES,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  LAST_TURN
} = require('./constants.js')
const { cardType } = require('./utils.js')
const { InternalCardSet } = require('./cardset.js')

const roundSelector = state => state.round
const favourSelector = state => state.favour
const deckSelector = state => state.deck
const movesSelector = state => state.moves

// Which, of the four kinds of moves has a player not taken this round
const availableMovesSelectorCreator = playerID => createSelector(
  movesSelector,
  moves => {
    const availableMoves = new Set()
    ALL_MOVES.forEach(move => {
      if (moves[playerID][move] === null) availableMoves.add(move)
    })
    return availableMoves
  }
)
const firstPlayerAvailableMovesSelector = availableMovesSelectorCreator(PLAYER.FIRST)
const secondPlayerAvailableMovesSelector = availableMovesSelectorCreator(PLAYER.SECOND)
const availableMovesSelectors = {
  [PLAYER.FIRST]: firstPlayerAvailableMovesSelector,
  [PLAYER.SECOND]: secondPlayerAvailableMovesSelector
}

// How many turns in total have been taken this round
const turnSelector = createSelector(
  movesSelector,
  moves => {
    let total = 0
    const firstPlayerMoves = moves[PLAYER.FIRST]
    const secondPlayerMoves = moves[PLAYER.SECOND]
    let key

    for (key in firstPlayerMoves) {
      if (firstPlayerMoves.hasOwnProperty(key) && firstPlayerMoves[key] !== null) {
        total += 1
      }
    }
    for (key in secondPlayerMoves) {
      if (secondPlayerMoves.hasOwnProperty(key) && secondPlayerMoves[key] !== null) {
        total += 1
      }
    }

    return total
  }
)

// Who's turn is it
const currentPlayerSelector = createSelector(
  roundSelector,
  turnSelector,
  (round, turn) => ((round + turn) % 2 === 0) ? PLAYER.FIRST : PLAYER.SECOND
)

// All of the cards that you have ever drawn into your hand this round
const totalHandSelectorCreator = playerID => createSelector(
  turnSelector,
  roundSelector,
  deckSelector,
  (turn, round, deck) => {
    const start = playerID === PLAYER.FIRST ? 0 : MAX_HAND_SIZE
    const cardDrawingOffset = (
      ((playerID === PLAYER.FIRST) && (round % 2 === 0)) ||
      ((playerID === PLAYER.SECOND) && (round % 2 === 1))
    ) ? 2 : 1
    const count = Math.floor((turn + cardDrawingOffset) / 2) + STARTING_HAND_SIZE
    return new InternalCardSet(deck.slice(start, start + count)) // TODO: maybe should be passing in GEISHA values to this ctor
  }
)
const firstPlayerTotalHandSelector = totalHandSelectorCreator(PLAYER.FIRST)
const secondPlayerTotalHandSelector = totalHandSelectorCreator(PLAYER.SECOND)
const totalHandSelectors = {
  [PLAYER.FIRST]: firstPlayerTotalHandSelector,
  [PLAYER.SECOND]: secondPlayerTotalHandSelector
}

const playedCardsSelectorCreator = playerID => createSelector(
  movesSelector,
  moves => {
    const cardSets = []
    if (moves[playerID][MOVE.SECRET]) {
      cardSets.push(moves[playerID][MOVE.SECRET].cards)
    }
    if (moves[playerID][MOVE.TRADEOFF]) {
      cardSets.push(moves[playerID][MOVE.TRADEOFF].cards)
    }
    if (moves[playerID][MOVE.GIFT]) {
      cardSets.push(moves[playerID][MOVE.GIFT].cards)
    }
    if (moves[playerID][MOVE.COMPETITION]) {
      cardSets.push(moves[playerID][MOVE.COMPETITION].pairs[0])
      cardSets.push(moves[playerID][MOVE.COMPETITION].pairs[1])
    }
    return InternalCardSet.union.apply(null, cardSets)
  }
)

// All of the cards which you have ever drawn into your hand and haven't played
// yet, this round
// TODO:
const handSelectorCreator = playerID => createSelector(
  totalHandSelectors[playerID],
  movesSelector,
  (totalHand, moves) => {
    const cards = totalHand.cards
    moves[playerID].forEach(move => {
      if (move.self) move.self.forEach(card => hand.delete(card))
    })
    return hand
  }
)
const firstPlayerHandSelector = handSelectorCreator(PLAYER.FIRST)
const secondPlayerHandSelector = handSelectorCreator(PLAYER.SECOND)
const handSelectors = {
  [PLAYER.FIRST]: firstPlayerHandSelector,
  [PLAYER.SECOND]: secondPlayerHandSelector
}

const handSizeSelectorCreator = playerID => createSelector(
  handSelectors[playerID],
  hand => hand.size
)
const firstPlayerHandSizeSelector = handSizeSelectorCreator(PLAYER.FIRST)
const secondPlayerHandSizeSelector = handSizeSelectorCreator(PLAYER.SECOND)
const handSizeSelectors = {
  [PLAYER.FIRST]: firstPlayerHandSizeSelector,
  [PLAYER.SECOND]: secondPlayerHandSizeSelector
}

// How favour would be allocated right now, according to the current distribution of item cards, and the existing favour
const currentFavourSelector = createSelector(
  movesSelector,
  favourSelector,
  (moves, favour) => {
    const player1Cards = new Set()
    const player2Cards = new Set()
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

    if (moves[PLAYER.FIRST][MOVE.SECRET].self) {
      moves[PLAYER.FIRST][MOVE.SECRET].self.forEach(card => player1Cards.add(card))
    }
    if (moves[PLAYER.SECOND][MOVE.SECRET].self) {
      moves[PLAYER.SECOND][MOVE.SECRET].self.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYER.FIRST][MOVE.GIFT].self) {
      moves[PLAYER.FIRST][MOVE.GIFT].self.forEach(card => player1Cards.add(card))
      moves[PLAYER.FIRST][MOVE.GIFT].other.forEach(card => player1Cards.delete(card))
      moves[PLAYER.FIRST][MOVE.GIFT].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYER.SECOND][MOVE.GIFT].self) {
      moves[PLAYER.SECOND][MOVE.GIFT].self.forEach(card => player2Cards.add(card))
      moves[PLAYER.SECOND][MOVE.GIFT].other.forEach(card => player2Cards.delete(card))
      moves[PLAYER.SECOND][MOVE.GIFT].other.forEach(card => player1Cards.add(card))
    }

    if (moves[PLAYER.FIRST][MOVE.COMPETITION].self) {
      moves[PLAYER.FIRST][MOVE.COMPETITION].self.forEach(card => player1Cards.add(card))
      moves[PLAYER.FIRST][MOVE.COMPETITION].other.forEach(card => player1Cards.delete(card))
      moves[PLAYER.FIRST][MOVE.COMPETITION].other.forEach(card => player2Cards.add(card))
    }

    if (moves[PLAYER.SECOND][MOVE.COMPETITION].self) {
      moves[PLAYER.SECOND][MOVE.COMPETITION].self.forEach(card => player2Cards.add(card))
      moves[PLAYER.SECOND][MOVE.COMPETITION].other.forEach(card => player2Cards.delete(card))
      moves[PLAYER.SECOND][MOVE.COMPETITION].other.forEach(card => player1Cards.add(card))
    }

    player1Cards.forEach(card => {
      player1ItemCount[cardType(card)] += 1
    })

    player2Cards.forEach(card => {
      player2ItemCount[cardType(card)] += 1
    })

    const newFavour = Object.assign({}, favour)

    Object.values(GEISHA).forEach(type => {
      if (player1ItemCount[type] > player2ItemCount[type]) {
        newFavour[type] = PLAYER.FIRST
      } else if (player2ItemCount[type] > player1ItemCount[type]) {
        newFavour[type] = PLAYER.SECOND
      }
    })

    return newFavour
  }
)

const playerCharmSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => Object.values(GEISHA).reduce((charm, geisha) => charm + (favour[geisha] === playerID ? CARD_VALUES[geisha] : 0), 0)
)
// How many charm points each player has
const firstPlayerCharmSelector = playerCharmSelectorCreator(PLAYER.FIRST)
const secondPlayerCharmSelector = playerCharmSelectorCreator(PLAYER.SECOND)
const charmSelectors = {
  [PLAYER.FIRST]: firstPlayerCharmSelector,
  [PLAYER.SECOND]: secondPlayerCharmSelector
}

const playerGeishasSelectorCreator = playerID => createSelector(
  favourSelector,
  favour => Object.values(GEISHA).reduce((count, geisha) => count + (favour[geisha] === playerID ? 1 : 0), 0)
)
// How many geishas each player has charmed
const firstPlayerGeishaSelector = playerGeishasSelectorCreator(PLAYER.FIRST)
const secondPlayerGeishaSelector = playerGeishasSelectorCreator(PLAYER.SECOND)
const geishaSelectors = {
  [PLAYER.FIRST]: firstPlayerGeishaSelector,
  [PLAYER.SECOND]: secondPlayerGeishaSelector
}

const winnerSelector = createSelector(
  firstPlayerCharmSelector,
  secondPlayerCharmSelector,
  firstPlayerGeishaSelector,
  secondPlayerGeishaSelector,
  (firstPCharm, secondPCharm, firstPGeisha, secondPGeisha) => {
    if (firstPCharm >= CHARM_THRESHOLD) return PLAYER.FIRST
    else if (secondPCharm >= CHARM_THRESHOLD) return PLAYER.SECOND
    else if (firstPGeisha >= GEISHA_THRESHOLD) return PLAYER.FIRST
    else if (secondPGeisha >= GEISHA_THRESHOLD) return PLAYER.SECOND
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
  firstPlayerAvailableMovesSelector,
  secondPlayerAvailableMovesSelector,
  availableMovesSelectors,
  turnSelector,
  currentPlayerSelector,
  firstPlayerTotalHandSelector,
  secondPlayerTotalHandSelector,
  totalHandSelectors,
  firstPlayerHandSelector,
  secondPlayerHandSelector,
  handSelectors,
  firstPlayerHandSizeSelector,
  secondPlayerHandSizeSelector,
  handSizeSelectors,
  currentFavourSelector,
  firstPlayerCharmSelector,
  secondPlayerCharmSelector,
  charmSelectors,
  firstPlayerGeishaSelector,
  secondPlayerGeishaSelector,
  geishaSelectors,
  winnerSelector,
  roundOverSelector,
  gameOverSelector
}
