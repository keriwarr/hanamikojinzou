const {
  PLAYER_1,
  PLAYER_2
} = require('./hanami.js')
const { simulation } = require('./api.js')
const { basicPlayer } = require('./players.js')

const player1 = basicPlayer
let player1Wins = 0
const player2 = basicPlayer
let player2Wins = 0

for (let i = 0; i < 1000; i += 1) {
  const result = simulation(player1, player2)

  if (result === PLAYER_1) player1Wins += 1
  if (result === PLAYER_2) player2Wins += 1
}

console.log(player1Wins)
console.log(player2Wins)
