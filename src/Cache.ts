import {ICacheEntry, ICacheOptions, ICacheOverflowStrategy} from './types';
import {getUnixTimestamp} from './util/getUnixTimestamp';
import {deepCopy} from './util/deepCopy';
import {shallowCopy} from './util/shallowCopy';
import {LRUOverflowStrategy} from './overflow-strategy/LRUOverflowStrategy';

const O_OVERFLOW_STRATEGY = Symbol('O_OVERFLOW_STRATEGY');
const O_IS_FINITE_CAPACITY = Symbol('O_IS_FINITE_CAPACITY');

export class Cache<V extends Exclude<any, undefined>> {
  private readonly ttl: ICacheOptions['defaultTTL'];
  private readonly copyFn: ICacheOptions['copyFn'] | undefined;
  private readonly map: Map<string, ICacheEntry<V>>;

  private readonly isFiniteCapacity: boolean;
  private readonly capacityOverflowStrategy: ICacheOverflowStrategy;

  constructor(options: Partial<ICacheOptions> = {}) {
    this.map = new Map();

    this.ttl = options.defaultTTL ?? 60;

    this.copyFn =
      options.copyFn || // custom copy function
      (options.deepCopy && deepCopy) || // deep clone function
      (options.shallowCopy && shallowCopy) || // shallow copy function
      undefined;

    this.isFiniteCapacity = !!(options.capacity && options.capacity > 0);
    this.capacityOverflowStrategy = new (options.capacityOverflowStrategy ?? LRUOverflowStrategy)(
      options.capacity ?? 0,
      this.map.delete,
    );
  }

  /**
   * Create cache entry object.
   */
  private emitCacheEntry(key: string, val: V, ttl: number, now?: number): ICacheEntry<V> {
    now ??= getUnixTimestamp();

    return {
      key,
      val: this.copyFn ? this.copyFn(val) : val,
      iat: now,
      ttl,
      exp: ttl && now + ttl, // if ttl == 0 exp also becomes 0, meaning unlimited ttl.,
    };
  }

  /**
   * Create cache entry and store it in cache.
   */
  private setCacheEntry(key: string, value: V, ttl: number) {
    const entry = this.emitCacheEntry(key, value, ttl);

    this.map.set(key, entry);

    if (this.isFiniteCapacity) {
      this.capacityOverflowStrategy.onSet(key, entry.val);
    }
  }

  /**
   * Remove cache entry from cache and call
   */
  private removeCacheEntry(key: string, byUser = false): boolean {
    if (!this.map.has(key)) return false;

    if (this.isFiniteCapacity) {
      this.capacityOverflowStrategy.onDelete(key, this.map.get(key)!.val, byUser);
    }

    return this.map.delete(key);
  }

  private isEntryExpired(entry: ICacheEntry<V>): boolean {
    const {exp} = entry;

    return !!exp && getUnixTimestamp() > exp;
  }

  /**
   * Retrieve cache entry if not expired.
   */
  private getCacheEntryIfNotExpired(key: string, raw: true): ICacheEntry<V> | undefined;
  private getCacheEntryIfNotExpired(key: string, raw?: false): V | undefined;
  private getCacheEntryIfNotExpired(key: string, raw?: boolean): ICacheEntry<V> | V | undefined {
    const entry = this.map.get(key);

    if (!entry) return undefined;

    if (this.isEntryExpired(entry)) {
      this.removeCacheEntry(key, false);

      return undefined;
    }

    if (raw) return entry;

    const {val} = entry;

    if (this.isFiniteCapacity) {
      this.capacityOverflowStrategy.onGet(key, val);
    }

    return this.copyFn ? this.copyFn(val) : val;
  }

  /**
   * Store value in cache by key.
   *
   * @param key   Key that value can be accessed later.
   * @param value Stored value, can't be undefined.
   * @param ttl   Time in seconds during which value will be treated as fresh. 0 means
   *  unlimited storage time.
   */
  public set(key: string, value: V, ttl: number = this.ttl): this {
    this.setCacheEntry(key, value, ttl);

    return this;
  }

  /**
   * Return value stored by key or undefined otherwise.
   *
   * @returns Stored value or undefined in case it does not exist or expired.
   */
  public get(key: string): V | undefined {
    return this.getCacheEntryIfNotExpired(key);
  }

  /**
   * Check if key exists and not expired.
   *
   * @returns _true_ in case key exists and not expired and _false_ otherwise.
   */
  has(key: string): boolean {
    if (!this.map.has(key)) return false;

    return !!this.getCacheEntryIfNotExpired(key, true);
  }

  /**
   * Delete key from cache.
   *
   * @return _true_ in case key existed and been deleted and _false_ otherwise.
   */
  public del(key: string): boolean {
    return this.removeCacheEntry(key, true);
  }

  /**
   * Clear cache entries.
   */
  public clear(): this {
    this.map.clear();

    return this;
  }
}
