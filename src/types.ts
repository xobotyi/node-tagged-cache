export interface ICacheOptions {
  /**
   * Time in seconds entry will be treated as fresh.
   * <br/>_0_ means unlimited TTL
   */
  defaultTTL: number;

  /**
   * Interval in seconds during which expired entries will be deleted. It is not recommended to set
   * this value too small since garbage collection is CPU-cost operation as it has to iterate over
   * all keys in cache.
   * <br/>_0_ means no garbage collection.
   */
  garbageCollectInterval: number;

  /**
   * If _`true`_ every stored value will be deeply cloned. Otherwise it will be stored by reference
   */
  clone: boolean;

  /**
   * Amount of keys that can be stored.
   * <br/>_0_ means infinite amount.
   */
  capacity: number;

  /**
   * Function that used to retrieve time in seconds.
   */
  getSeconds: () => number;
}

export interface ICacheStats {
  capacity: number;
  keys: number;
  hits: number;
  misses: number;
  stores: number;
  replaces: number;
  writes: number;
  deletes: number;
  clears: number;
  uptime: number;
}

export interface ICacheEntry<
  K extends string | number = string | number,
  V extends Exclude<any, undefined> = Exclude<any, undefined>
> {
  k: K;
  v: V;
  s: number;
  t: number;
  e: number;
}

export interface ICache<
  Keys extends string | number = string | number,
  Values extends Exclude<any, undefined> = Exclude<any, undefined>
> {
  size: number;
  capacity: number;
  totalCapacity: number;
  stats: ICacheStats;
  options: ICacheOptions;
  garbageCollectionEnabled: boolean;

  get(key: Keys): Values | undefined;

  mget<K extends Keys = Keys>(keys: K[]): Record<K, Values | undefined>;

  set(key: Keys, value: Values, ttl?: ICacheOptions['defaultTTL']): void;

  mset(kv: Record<Keys, Values>, ttl?: ICacheOptions['defaultTTL']): void;

  add(key: Keys, value: Values, ttl?: ICacheOptions['defaultTTL']): boolean;

  madd<K extends Keys = Keys>(
    kv: Record<K, Values>,
    ttl?: ICacheOptions['defaultTTL'],
  ): Record<K, boolean>;

  replace(key: Keys, value: Values, ttl?: ICacheOptions['defaultTTL']): boolean;

  mreplace<K extends Keys = Keys>(
    kv: Record<K, Values>,
    ttl?: ICacheOptions['defaultTTL'],
  ): Record<K, boolean>;

  del(key: Keys): boolean;

  mdel<K extends Keys = Keys>(keys: K[]): Record<K, boolean>;

  has(key: Keys): boolean;

  keys(): Keys[];
}

export type ITaggedCache = ICache;
