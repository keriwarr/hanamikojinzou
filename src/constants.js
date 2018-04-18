'use strict'

const GEISHA = Object.freeze({
  // UNKNOWN is used to represent card objects which aren't visible to a player
  // i.e. the contents of the other players hand
  UNKNOWN: 0,
  PURPLE_2: 1,
  RED_2: 2,
  YELLOW_2: 3,
  BLUE_3: 4,
  ORANGE_3: 5,
  GREEN_4: 6,
  PINK_5: 7
})
const ALL_GEISHA = Object.values(GEISHA)

const PLAYER = Object.freeze({
  FIRST: 1,
  SECOND: 2
})

const MOVE = Object.freeze({
  SECRET: 1,
  TRADEOFF: 2,
  GIFT: 3,
  COMPETITION: 4
})
const ALL_MOVES = Object.values(MOVE)

// i.e. How many of them exist, and how much the corresponding geisha's favour is worth
const CARD_VALUES = Object.freeze({
  [GEISHA.PURPLE_2]: 2,
  [GEISHA.RED_2]: 2,
  [GEISHA.YELLOW_2]: 2,
  [GEISHA.BLUE_3]: 3,
  [GEISHA.ORANGE_3]: 3,
  [GEISHA.GREEN_4]: 4,
  [GEISHA.PINK_5]: 5
})

// If you have this much charm at the end of the round, you win
const CHARM_THRESHOLD = 11

// If you have the favour of this many geisha's at the end fo the round, you win
const GEISHA_THRESHOLD = 4

const STARTING_HAND_SIZE = 6

const MAX_HAND_SIZE = 10

const LAST_TURN = 7

module.exports = {
  GEISHA,
  ALL_GEISHA,
  PLAYER,
  MOVE,
  ALL_MOVES,
  CARD_VALUES,
  CHARM_THRESHOLD,
  GEISHA_THRESHOLD,
  STARTING_HAND_SIZE,
  MAX_HAND_SIZE,
  LAST_TURN
}
