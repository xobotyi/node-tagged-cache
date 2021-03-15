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
   * If _`true`_ every stored value will be deeply cloned.
   * <br/>Otherwise, if `shallowCopy` is also set to false, values will be stored by reference.
   * <br/>Overrides `shallowCopy` option, but overridden by `copyFn` option.
   */
  deepCopy: boolean;

  /**
   * if _`true`_ every stored value will be shallowly cloned.
   * <br/>Otherwise, if `deepCopy` is also set to false, values will be stored by reference.
   * <br/>`deepCopy` and `copyFn` is overrides this option.
   */
  shallowCopy: boolean;

  /**
   * If set this function will be used to copy value during value storing and retrieving.
   * <br/>Overrides `deepCopy` and `shallowCopy` option.
   */
  copyFn: <T>(val: T) => T;

  /**
   * Amount of keys that can be stored.
   * <br/>_0_ means infinite amount.
   */
  capacity: number;

  /**
   * Strategy to handle cache overflow
   */
  capacityOverflowStrategy: ICacheOverflowStrategyCtor;
}

export interface ICacheEntry<V extends Exclude<any, undefined> = Exclude<any, undefined>> {
  key: string;
  val: V;
  iat: number;
  ttl: number;
  exp: number;
}

export interface ICacheOverflowStrategyCtor<
  V extends Exclude<any, undefined> = Exclude<any, undefined>
> {
  new (capacity: number, removeCacheEntry: (key: string) => boolean): ICacheOverflowStrategy<V>;
}

export interface ICacheOverflowStrategy<
  V extends Exclude<any, undefined> = Exclude<any, undefined>
> {
  onGet: (key: string, value: V) => void;

  onSet: (key: string, value: V) => void;

  /**
   * @param key Key of deleted entry.
   * @param value Value of deleted entry.
   * @param byUser Whether entry has been deleted by `Cache.del` call.
   */
  onDelete: (key: string, value: V, byUser: boolean) => void;
}
