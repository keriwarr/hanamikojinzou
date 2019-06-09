import { enumValues, keyBy } from "./utils";
import { Memoize } from "typescript-memoize";
import { BasePlayer } from "./Player";

export enum PLAYER {
  PLAYED_FIRST = "PLAYED_FIRST",
  PLAYED_SECOND = "PLAYED_SECOND"
}

export const getOtherPlayer = (player: PLAYER) => {
  if (player === PLAYER.PLAYED_FIRST) {
    return PLAYER.PLAYED_SECOND;
  }
  return PLAYER.PLAYED_FIRST;
};

export enum MOVE_KEY {
  SECRET = "SECRET",
  TRADEOFF = "TRADEOFF",
  GIFT = "GIFT",
  COMPETITION = "COMPETITION"
}

export const MOVE_KEYS = enumValues(MOVE_KEY);

export interface SecretMove {
  type: MOVE_KEY.SECRET;
  cards: [Card];
}
export interface TradeoffMove {
  type: MOVE_KEY.TRADEOFF;
  cards: [Card, Card];
}
export interface IncompleteGiftMove {
  type: MOVE_KEY.GIFT;
  cards: [Card, Card, Card];
}
export interface GiftMove extends IncompleteGiftMove {
  response: BasePlayer.Move3Response;
}
export interface IncompleteCompetitionMove {
  type: MOVE_KEY.COMPETITION;
  cards: [[Card, Card], [Card, Card]];
}
export interface CompetitionMove extends IncompleteCompetitionMove {
  response: BasePlayer.Move4Response;
}
export type IncompleteMove =
  | SecretMove
  | TradeoffMove
  | IncompleteGiftMove
  | IncompleteCompetitionMove;
export type Move = SecretMove | TradeoffMove | GiftMove | CompetitionMove;
export type Moves =
  | []
  | [Move]
  | [Move, Move]
  | [Move, Move, Move]
  | [Move, Move, Move, Move]
  | [Move, Move, Move, Move, Move]
  | [Move, Move, Move, Move, Move, Move]
  | [Move, Move, Move, Move, Move, Move, Move]
  | [Move, Move, Move, Move, Move, Move, Move, Move];

// If you have this much charm at the end of the round, you win
export const CHARM_THRESHOLD = 11;

// If you have the favour of this many geisha's at the end of the round, you win
export const GEISHA_THRESHOLD = 4;

export const STARTING_HAND_SIZE = 6;

export const MAX_HAND_SIZE = 10;

export const LAST_TURN = 7;

export enum GEISHA_KEY {
  // UNKNOWN is used to represent card objects which aren't visible to a player
  // i.e. the contents of the other players hand
  UNKNOWN = "UNKNOWN",
  PURPLE_2 = "PURPLE_2",
  RED_2 = "RED_2",
  YELLOW_2 = "YELLOW_2",
  BLUE_3 = "BLUE_3",
  ORANGE_3 = "ORANGE_3",
  GREEN_4 = "GREEN_4",
  PINK_5 = "PINK_5"
}
export const GEISHA_KEYS = enumValues(GEISHA_KEY);

interface IGeisha {
  value: number;
}

const GEISHA: { readonly [K in GEISHA_KEY]: IGeisha } = {
  [GEISHA_KEY.UNKNOWN]: { value: 0 },
  [GEISHA_KEY.PURPLE_2]: { value: 2 },
  [GEISHA_KEY.RED_2]: { value: 2 },
  [GEISHA_KEY.YELLOW_2]: { value: 2 },
  [GEISHA_KEY.BLUE_3]: { value: 3 },
  [GEISHA_KEY.ORANGE_3]: { value: 3 },
  [GEISHA_KEY.GREEN_4]: { value: 4 },
  [GEISHA_KEY.PINK_5]: { value: 5 }
};

enum CARD_KEY {
  CARD1 = "CARD1",
  CARD2 = "CARD2",
  CARD3 = "CARD3",
  CARD4 = "CARD4",
  CARD5 = "CARD5",
  CARD6 = "CARD6",
  CARD7 = "CARD7",
  CARD8 = "CARD8",
  CARD9 = "CARD9",
  CARD10 = "CARD10",
  CARD11 = "CARD11",
  CARD12 = "CARD12",
  CARD13 = "CARD13",
  CARD14 = "CARD14",
  CARD15 = "CARD15",
  CARD16 = "CARD16",
  CARD17 = "CARD17",
  CARD18 = "CARD18",
  CARD19 = "CARD19",
  CARD20 = "CARD20",
  CARD21 = "CARD21"
}
const CARD_KEYS = enumValues(CARD_KEY);

interface ICard {
  geisha: GEISHA_KEY;
}

const CARD: { readonly [K in CARD_KEY]: ICard } = {
  [CARD_KEY.CARD1]: { geisha: GEISHA_KEY.PURPLE_2 },
  [CARD_KEY.CARD2]: { geisha: GEISHA_KEY.PURPLE_2 },
  [CARD_KEY.CARD3]: { geisha: GEISHA_KEY.RED_2 },
  [CARD_KEY.CARD4]: { geisha: GEISHA_KEY.RED_2 },
  [CARD_KEY.CARD5]: { geisha: GEISHA_KEY.YELLOW_2 },
  [CARD_KEY.CARD6]: { geisha: GEISHA_KEY.YELLOW_2 },
  [CARD_KEY.CARD7]: { geisha: GEISHA_KEY.BLUE_3 },
  [CARD_KEY.CARD8]: { geisha: GEISHA_KEY.BLUE_3 },
  [CARD_KEY.CARD9]: { geisha: GEISHA_KEY.BLUE_3 },
  [CARD_KEY.CARD10]: { geisha: GEISHA_KEY.ORANGE_3 },
  [CARD_KEY.CARD11]: { geisha: GEISHA_KEY.ORANGE_3 },
  [CARD_KEY.CARD12]: { geisha: GEISHA_KEY.ORANGE_3 },
  [CARD_KEY.CARD13]: { geisha: GEISHA_KEY.GREEN_4 },
  [CARD_KEY.CARD14]: { geisha: GEISHA_KEY.GREEN_4 },
  [CARD_KEY.CARD15]: { geisha: GEISHA_KEY.GREEN_4 },
  [CARD_KEY.CARD16]: { geisha: GEISHA_KEY.GREEN_4 },
  [CARD_KEY.CARD17]: { geisha: GEISHA_KEY.PINK_5 },
  [CARD_KEY.CARD18]: { geisha: GEISHA_KEY.PINK_5 },
  [CARD_KEY.CARD19]: { geisha: GEISHA_KEY.PINK_5 },
  [CARD_KEY.CARD20]: { geisha: GEISHA_KEY.PINK_5 },
  [CARD_KEY.CARD21]: { geisha: GEISHA_KEY.PINK_5 }
};

export class Card {
  readonly key: CARD_KEY;
  private readonly geishaKey: GEISHA_KEY;

  private constructor(key: CARD_KEY) {
    this.key = key;

    const card = CARD[key];
    this.geishaKey = card.geisha;
  }

  get geisha() {
    return Geisha.map[this.geishaKey];
  }

  static readonly map = keyBy(CARD_KEYS, key => new Card(key));
  static readonly all = enumValues(Card.map);
}

export class Geisha {
  readonly key: GEISHA_KEY;
  private readonly cardKeys: CARD_KEY[];
  private readonly _value: number;

  private constructor(key: GEISHA_KEY) {
    this.key = key;

    const geisha = GEISHA[key];
    this._value = geisha.value;
    this.cardKeys = CARD_KEYS.filter(cardKey => CARD[cardKey].geisha === key);
  }

  get value() {
    return this._value;
  }

  get count() {
    return this._value;
  }

  @Memoize()
  get cards() {
    return Card.all.filter(card => this.cardKeys.includes(card.key));
  }

  static readonly map = keyBy(GEISHA_KEYS, key => new Geisha(key));
  static readonly all = enumValues(Card.map);
}
