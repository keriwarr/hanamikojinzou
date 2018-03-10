'use strict'

const { Record } = require('immutable')

const createEnum = items => {
  const Enum = Record(items)
  return new Enum()
}

const GEISHA = createEnum({
  PURPLE_2: '0',
  RED_2: '1',
  YELLOW_2: '2',
  BLUE_3: '3',
  ORANGE_3: '4',
  GREEN_4: '5',
  PINK_5: '6'
})

const PLAYERS = createEnum({
  P1: '0',
  P2: '1'
})

const MOVES = createEnum({
  M1: '0',
  M2: '1',
  M3: '2',
  M4: '3'
})

// i.e. How many of them exist, and how much the corresponding geisha's favour is worth
// TODO: should these objects been Immutable? If they're maps you can't index into them with numbers :(
const CARD_VALUE_MAP = {
  [GEISHA.PURPLE_2]: 2,
  [GEISHA.RED_2]: 2,
  [GEISHA.YELLOW_2]: 2,
  [GEISHA.BLUE_3]: 3,
  [GEISHA.ORANGE_3]: 3,
  [GEISHA.GREEN_4]: 4,
  [GEISHA.PINK_5]: 5
}

// If you have this much charm at the end of the round, you win
const CHARM_THRESHOLD = 11

// If you have the favour of this many geisha's at the end fo the round, you win
const GEISHA_THRESHOLD = 4

const STARTING_HAND_SIZE = 6

const MAX_HAND_SIZE = 10

const LAST_TURN = 7

// Number of cards to move type
const MOVE_SIZE_TO_MOVE_MAP = {
  1: MOVES.M1,
  2: MOVES.M2,
  3: MOVES.M3,
  4: MOVES.M4
}

// move type to how many cards the opponet chooses
const EXPECTED_OTHER_PLAYER_SELECTION_SIZE = {
  [MOVES.M1]: 0,
  [MOVES.M2]: 0,
  [MOVES.M3]: 1,
  [MOVES.M4]: 2
}

// Describes a single move. 'self' are the cards that the player who made this move chose.
// 'other' is a subset of 'self' and are the cards that the other player chose.
const MoveRecord = Record({
  self: null,
  other: null
})

// Describes all the moves that a given player takes in a round.
const MoveSetRecord = Record({
  [MOVES.M1]: new MoveRecord(),
  [MOVES.M2]: new MoveRecord(),
  [MOVES.M3]: new MoveRecord(),
  [MOVES.M4]: new MoveRecord()
})

// Describes all the moves that both players takes in a round
const MovesRecord = Record({
  [PLAYERS.P1]: new MoveSetRecord(),
  [PLAYERS.P2]: new MoveSetRecord()
})

// Describest the current allocation of favour
const FavourRecord = Record({
  [GEISHA.PURPLE_2]: null,
  [GEISHA.PURPLE_2]: null,
  [GEISHA.RED_2]: null,
  [GEISHA.YELLOW_2]: null,
  [GEISHA.BLUE_3]: null,
  [GEISHA.ORANGE_3]: null,
  [GEISHA.GREEN_4]: null,
  [GEISHA.PINK_5]: null
})

// Describes all the state corresponding to an on going game
const StateRecord = Record({
  deck: undefined,
  favour: new FavourRecord(),
  moves: new MovesRecord(),
  round: 0
})

module.exports = {
  GEISHA,
  PLAYERS,
  MOVES,
  CARD_VALUE_MAP,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  STARTING_HAND_SIZE,
  MAX_HAND_SIZE,
  LAST_TURN,
  EXPECTED_OTHER_PLAYER_SELECTION_SIZE,
  MOVE_SIZE_TO_MOVE_MAP,
  MoveRecord,
  MoveSetRecord,
  MovesRecord,
  FavourRecord,
  StateRecord
}
