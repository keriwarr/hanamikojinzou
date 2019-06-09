export const keyBy = <T extends number | string | symbol, S>(
  array: T[],
  iteratee: (elem: T) => S
): { [K in T]: S } =>
  Object.assign({}, ...array.map(elem => ({ [elem]: iteratee(elem) })));

export const enumValues = <T extends object>(enumObject: T): (T[keyof T])[] =>
  Object.values(enumObject);

export const enumKeys = <T extends object>(enumObject: T): (keyof T)[] =>
  Object.keys(enumObject) as (keyof T)[];
