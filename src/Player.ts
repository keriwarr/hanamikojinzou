import { Card, MOVE_KEY, IncompleteMove } from "./constants";

export abstract class BasePlayer {
  public abstract readonly getMove: (
    api: BasePlayer.IGetMoveApi
  ) => IncompleteMove;
  public abstract readonly getMove3Response: (
    api: BasePlayer.IGetMove3ResponseApi
  ) => BasePlayer.Move3Response;
  public abstract readonly getMove4Response: (
    api: BasePlayer.IGetMove4ResponseApi
  ) => BasePlayer.Move4Response;
}

export namespace BasePlayer {
  export interface IBaseApi {
    getHand(): Card[];
  }

  export interface IGetMoveApi extends IBaseApi {
    getAvailableMoves():
      | [MOVE_KEY.SECRET]
      | [MOVE_KEY.TRADEOFF]
      | [MOVE_KEY.GIFT]
      | [MOVE_KEY.COMPETITION]
      | [MOVE_KEY.SECRET, MOVE_KEY.TRADEOFF]
      | [MOVE_KEY.SECRET, MOVE_KEY.GIFT]
      | [MOVE_KEY.SECRET, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.TRADEOFF, MOVE_KEY.GIFT]
      | [MOVE_KEY.TRADEOFF, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.GIFT, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.TRADEOFF, MOVE_KEY.GIFT, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.SECRET, MOVE_KEY.GIFT, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.SECRET, MOVE_KEY.TRADEOFF, MOVE_KEY.COMPETITION]
      | [MOVE_KEY.SECRET, MOVE_KEY.TRADEOFF, MOVE_KEY.GIFT]
      | [
          MOVE_KEY.SECRET,
          MOVE_KEY.TRADEOFF,
          MOVE_KEY.GIFT,
          MOVE_KEY.COMPETITION
        ];
  }

  export interface IGetMove3ResponseApi extends IBaseApi {
    getOffering(): [Card, Card, Card];
  }

  export interface IGetMove4ResponseApi extends IBaseApi {
    getOffering(): [[Card, Card], [Card, Card]];
  }

  export enum Move3Response {
    FIRST = "FIRST",
    SECOND = "SECOND",
    THIRD = "THIRD"
  }

  export enum Move4Response {
    FIRST = "FIRST",
    SECOND = "SECOND"
  }
}
