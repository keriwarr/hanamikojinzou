import { createStore } from "redux";
import { hanamikojiReducer, takeTurn } from "./reducer";
import { BasePlayer } from "./Player";
import {
  Move,
  PLAYER,
  getOtherPlayer,
  MOVE_KEY,
  SecretMove
} from "./constants";

let handSelector: any;
let availableMovesSelector: any;
let gameOverSelector: any;
let currentPlayerSelector: any;
let winnerSelector: any;

const simulation = (
  firstPlayer: BasePlayer,
  secondPlayer: BasePlayer
): "firstPlayerWon" | "secondPlayerWon" => {
  const store = createStore(hanamikojiReducer);

  const api = (player: PLAYER): BasePlayer.IGetMoveApi => ({
    getHand: () => handSelector(store.getState())(player),
    getAvailableMoves: () => availableMovesSelector(store.getState())(player)
  });

  const players: { [K in PLAYER]: BasePlayer } = {
    [PLAYER.PLAYED_FIRST]: firstPlayer,
    [PLAYER.PLAYED_SECOND]: secondPlayer
  };
  const apis: { [K in PLAYER]: BasePlayer.IGetMoveApi } = {
    [PLAYER.PLAYED_FIRST]: api(PLAYER.PLAYED_FIRST),
    [PLAYER.PLAYED_SECOND]: api(PLAYER.PLAYED_SECOND)
  };

  while (!gameOverSelector(store.getState())) {
    const currentPlayer: PLAYER = currentPlayerSelector(store.getState());
    const otherPlayer: PLAYER = getOtherPlayer(currentPlayer);
    const incompleteMove = players[currentPlayer].getMove(apis[currentPlayer]);
    const completeMove: Move = (() => {
      switch (incompleteMove.type) {
        case MOVE_KEY.GIFT:
          return {
            ...incompleteMove,
            response: players[otherPlayer].getMove3Response({
              ...apis[currentPlayer],
              getOffering: () => incompleteMove.cards
            })
          };
        case MOVE_KEY.COMPETITION:
          return {
            ...incompleteMove,
            response: players[otherPlayer].getMove4Response({
              ...apis[currentPlayer],
              getOffering: () => incompleteMove.cards
            })
          };
        default:
          return incompleteMove;
      }
    })();

    store.dispatch(takeTurn(completeMove));
  }

  return winnerSelector(store.getState());
};

class IncorrectPlayer extends BasePlayer {
  getMove = (api: BasePlayer.IGetMoveApi) => {
    const hand = api.getHand();
    const move: SecretMove = { type: MOVE_KEY.SECRET, cards: [hand[0]] };

    return move;
  };

  getMove3Response = () => {
    return BasePlayer.Move3Response.FIRST;
  };

  getMove4Response = () => {
    return BasePlayer.Move4Response.FIRST;
  };
}

let playerAWins = 0;
let playerBWins = 0;

for (let i = 0; i < 10000; i += 1) {
  const playerA = new IncorrectPlayer();
  const playerB = new IncorrectPlayer();
  const aWillGoFirst = i % 2 === 0;
  const result = (() => {
    if (aWillGoFirst) {
      return simulation(playerA, playerB);
    } else {
      return simulation(playerB, playerA);
    }
  })();

  if (
    (result === "firstPlayerWon" && aWillGoFirst) ||
    (result === "secondPlayerWon" && !aWillGoFirst)
  ) {
    playerAWins += 1;
  } else {
    playerBWins += 1;
  }
}

console.log(`Player 1: ${playerAWins}`);
console.log(`Player 2: ${playerBWins}`);
