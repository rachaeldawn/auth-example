
export type SpyObject<T> = T & { [key in keyof T]: jest.SpyInstance };
export type SpyObjectContainer<T> = { [key in keyof T]: SpyObject<T[key]> };

export type KeyDictionary<T> = {
  [key in keyof T]: Array<keyof T[key]>;
};

/**
 * Used when the service/class is flat (no nesting). Creates a spy object
 * where each key is a `jest.SpyInstance`
 */
export function createSpyObject<T>(keys: Array<keyof T>): SpyObject<T> {
  const entries = keys.map(a => [a, jest.fn()]);
  return Object.fromEntries(entries) as SpyObject<T>;
}

/**
 * Used for making full class replicas where there are nested properties,
 * each `key` in `keys` becomes a `SpyObject<T>[key]`
 */
export function createSpyObjectContainer<T>(
  keys: Partial<KeyDictionary<T>>
): SpyObjectContainer<T> {
  const keyMap = Object.entries(keys) as Array<[string, string[]]>;
  const entries = keyMap.map(([prop, k]) => [ prop, createSpyObject(k) ]);
  return Object.fromEntries(entries) as SpyObjectContainer<T>;
}
