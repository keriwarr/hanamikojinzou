import { GEISHA_KEY, GEISHA_KEYS, Card, Moves, Move } from "./constants";
import { keyBy } from "./utils";
import { Reducer } from "redux";

enum HanamikojiActionType {
  TAKE_TURN = "TAKE_TURN"
}

interface TakeTurnAction {
  type: HanamikojiActionType.TAKE_TURN;
  payload: {
    move: Move;
  };
}

type HanamikojiAction = TakeTurnAction;

export function takeTurn(move: Move): HanamikojiAction {
  return {
    type: HanamikojiActionType.TAKE_TURN,
    payload: {
      move
    }
  };
}

type Favour = { readonly [K in GEISHA_KEY]: number };

const initialFavour: Favour = keyBy(GEISHA_KEYS, () => 0);

type Deck = [
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card,
  Card
];

const getShuffledDeck = (): Deck => {
  let deck: Deck = [
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1,
    Card.map.CARD1
  ];
  let j: number, x: Card, i: number;
  for (i = deck.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = deck[i];
    deck[i] = deck[j];
    deck[j] = x;
  }
  return deck;
};

interface IHanamikojiState {
  round: number;
  favour: Favour;
  deck: Deck;
  moves: Moves;
}

const initialState: IHanamikojiState = {
  round: 0,
  favour: initialFavour,
  deck: getShuffledDeck(),
  moves: []
};

export const hanamikojiReducer = ((
  state = initialState,
  action: HanamikojiAction
): IHanamikojiState => {
  switch (action.type) {
    case HanamikojiActionType.TAKE_TURN:
      return {
        ...state,
        moves: [...state.moves, action.payload.move] as Moves
      };
    default:
      return state;
  }
}) as Reducer<IHanamikojiState>;
