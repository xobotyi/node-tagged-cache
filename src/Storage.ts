import type {IStorage} from './types';

const STORAGE = Symbol('storage');

export class Storage<
  K extends string | number = string | number,
  V extends Exclude<any, undefined> = Exclude<any, undefined>
> implements IStorage<K, V> {
  private readonly [STORAGE]: Map<K | string | number, V> = new Map();

  constructor(initialData?: (readonly [K, V])[]) {
    this[STORAGE] = new Map(initialData);
  }

  public get(key: K | string | number): V | Exclude<any, undefined> | undefined {
    return this[STORAGE].get(key);
  }

  public mget<Keys extends K | string | number>(
    keys: Keys[],
  ): Record<Keys, V | Exclude<any, undefined> | undefined> {
    const result = {} as Record<Keys, V | undefined>;

    for (const key of keys) {
      result[key] = this[STORAGE].get(key);
    }

    return result;
  }

  public set(key: K | string | number, value: V | Exclude<any, undefined>): void {
    this[STORAGE].set(key, value);
  }

  public mset(kv: Record<K | string | number, V | Exclude<any, undefined>>): void {
    for (const [key, value] of Object.entries(kv)) {
      this[STORAGE].set(key, value);
    }
  }

  public delete(key: K | string | number): boolean {
    return this[STORAGE].delete(key);
  }

  public has(key: K | string | number): boolean {
    return this[STORAGE].has(key);
  }

  public clear(): void {
    this[STORAGE].clear();
  }

  public values():
    | IterableIterator<V | Exclude<any, undefined>>
    | Array<V | Exclude<any, undefined>> {
    return this[STORAGE].values();
  }

  public keys(): IterableIterator<K | string | number> | Array<K | string | number> {
    return this[STORAGE].keys() as IterableIterator<K | string | number>;
  }

  public entries():
    | IterableIterator<[K | string | number, V | Exclude<any, undefined>]>
    | Array<[K | string | number, V | Exclude<any, undefined>]> {
    return this[STORAGE].entries() as IterableIterator<
      [K | string | number, V | Exclude<any, undefined>]
    >;
  }
}
