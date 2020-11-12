import {ICache, ICacheEntry, ICacheOptions, ICacheStats} from './types';
import {deepClone} from './rfdc';

export class Cache<
  K extends string | number = string | number,
  V extends Exclude<any, undefined> = Exclude<any, undefined>
> implements ICache<K, V> {
  /**
   * Time in seconds when instance been created.
   * @private
   */
  private readonly _createTime;

  /**
   * Storage instance where all the data is stored.
   * @private
   */
  private readonly _storage: Map<K, ICacheEntry<K, V>>;

  /**
   * Special storage for keys. Used when storage is finite capacity.
   * @private
   */
  private readonly _storedKeys: Set<K>;

  private _GCTimeOut: NodeJS.Timeout | null = null;
  private _GCPromise: Promise<void> | null = null;

  public get garbageCollectorPromise(): Promise<void> | null {
    return this._GCPromise;
  }

  private _GCEnabled = false;

  public get garbageCollectionEnabled(): boolean {
    return this._GCEnabled;
  }

  private _isFiniteCapacity = false;

  private readonly _counters: Omit<ICacheStats, 'keys' | 'capacity' | 'uptime'> = {
    hits: 0,
    misses: 0,
    stores: 0,
    replaces: 0,
    deletes: 0,
    clears: 0,
    writes: 0,
  };

  private readonly _options: ICacheOptions = {
    capacity: 512,
    clone: true,
    garbageCollectInterval: 600,
    defaultTTL: 60,
    getSeconds: () => process.hrtime()[0],
  };

  public get size(): number {
    return this._storage.size;
  }

  public get capacity(): number {
    return this._options.capacity ? this._options.capacity - this._storage.size : Infinity;
  }

  public get totalCapacity(): number {
    return this._options.capacity || Infinity;
  }

  public get stats(): ICacheStats {
    return {
      ...this._counters,
      keys: this._storage.size,
      capacity: this._options.capacity,
      uptime: this._options.getSeconds() - this._createTime,
    };
  }

  public get options(): ICacheOptions {
    return {...this._options};
  }

  constructor(
    options: Partial<ICacheOptions> = {},
    entries: [K, ICacheEntry<K, V>][] | null = null,
  ) {
    this.checkAndSetOptions(options);

    this._createTime = this._options.getSeconds();
    this._isFiniteCapacity = this._options.capacity !== Infinity;

    this._storage = new Map<K, ICacheEntry<K, V>>(entries);
    this._storedKeys = new Set(
      entries && this._isFiniteCapacity ? entries.map(([key]) => key) : [],
    );

    this.garbageCollector = this.garbageCollector.bind(this);

    // start garbage collection if required
    if (this._GCEnabled) {
      this.startGarbageCollection();
    }
  }

  private checkAndSetOptions(options?: Partial<ICacheOptions>) {
    if (!options) return;

    if (typeof options.capacity !== 'undefined') {
      if (typeof options.capacity === 'number' && options.capacity > 0) {
        this._options.capacity = options.capacity || Infinity;
      } else {
        throw new TypeError('capacity has to be a positive integer or Infinity');
      }
    }

    if (typeof options.garbageCollectInterval !== 'undefined') {
      if (
        typeof options.garbageCollectInterval === 'number' &&
        options.garbageCollectInterval >= 0
      ) {
        this._options.garbageCollectInterval = options.garbageCollectInterval;
        this._GCEnabled = this._options.garbageCollectInterval !== 0;
      } else {
        throw new TypeError('garbageCollectInterval has to be non-negative integer');
      }
    }

    if (typeof options.defaultTTL !== 'undefined') {
      if (typeof options.defaultTTL === 'number' && options.defaultTTL >= 0) {
        this._options.defaultTTL = options.defaultTTL;
      } else {
        throw new TypeError('defaultTTL has to be non-negative integer');
      }
    }

    if (typeof options.clone !== 'undefined') {
      this._options.clone = !!options.clone;
    }

    if (typeof options.getSeconds !== 'undefined') {
      if (typeof options.getSeconds === 'function') {
        this._options.getSeconds = options.getSeconds;
      } else {
        throw new TypeError('getSeconds has to be a function');
      }
    }
  }

  public startGarbageCollection(): void {
    if (!this._options.garbageCollectInterval) {
      this._GCEnabled = false;
      return;
    }

    this._GCEnabled = true;

    if (this._GCEnabled) {
      this._GCTimeOut = setTimeout(
        this.garbageCollector,
        this._options.garbageCollectInterval * 1000,
      );
    }
  }

  private async garbageCollector() {
    if (this._GCEnabled) {
      this._GCPromise = this.collectGarbage();
      await this._GCPromise;
    }

    if (this._GCEnabled) {
      this._GCTimeOut = setTimeout(
        this.garbageCollector,
        this._options.garbageCollectInterval * 1000,
      );
    }
  }

  public stopGarbageCollection(): void {
    this._GCEnabled = false;
    this._GCPromise = null;

    if (this._GCTimeOut) {
      clearTimeout(this._GCTimeOut);
      this._GCTimeOut = null;
    }
  }

  /**
   * !VERY! time cost operation since it has to iterate over whole the storage so it made async with
   * awaiting each 100 items checked.
   */
  private async collectGarbage(now?: number): Promise<void> {
    now = now ?? this._options.getSeconds();
    let processed = 0;

    for (const entry of this._storage.values()) {
      if (entry.e && entry.e < now) {
        this._storage.delete(entry.k);

        if (this._isFiniteCapacity) {
          this._storedKeys.delete(entry.k);
        }
      }

      if (++processed % 100 === 0) {
        // this should prevent blocking thread for a long time.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private storeEntry(key: K, value: V, stored: number, ttl: number, expire: number) {
    if (this._options.clone) {
      value = deepClone(value);
    }

    this._storage.set(key, {
      k: key,
      v: value,
      s: stored,
      t: ttl,
      e: expire,
    });
    this._counters.writes++;

    if (this._isFiniteCapacity) {
      this._storedKeys.delete(key);
      this._storedKeys.add(key);
    }
  }

  /**
   * Remove least updated keys that overflow the storage capacity
   */
  private removeDanglingEntries(): K[] {
    const deletedKeys: K[] = [];

    if (!this._isFiniteCapacity) return deletedKeys;

    let keysToDelete = this._options.capacity
      ? Math.max(0, this._storedKeys.size - this._options.capacity)
      : 0;

    if (keysToDelete) {
      const iterator = this._storedKeys.values();

      while (keysToDelete) {
        const key = iterator.next().value;

        this._storedKeys.delete(key);
        this._storage.delete(key);
        deletedKeys.push(key);

        keysToDelete--;
      }
    }

    return deletedKeys;
  }

  /**
   * Return entry or it's value in case it exists in storage and not expired
   */
  private fetchIfNotExpired(key: K): V | undefined;
  private fetchIfNotExpired(key: K, raw: true, now?: number): ICacheEntry<K, V> | undefined;
  private fetchIfNotExpired(key: K, raw: false, now?: number): V | undefined;
  private fetchIfNotExpired(key: K, raw = false, now?: number): ICacheEntry<K, V> | V | undefined {
    const entry = this._storage.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.e) {
      now = typeof now === 'undefined' ? this._options.getSeconds() : now;

      if (entry.e < now) {
        this._storage.delete(key);

        if (this._isFiniteCapacity) {
          this._storedKeys.delete(key);
        }

        return undefined;
      }
    }

    // if raw entry requested - dont bother of cloning
    if (raw) {
      return entry;
    }

    if (this._options.clone) {
      return deepClone(entry.v);
    }

    return entry.v;
  }

  /**
   * Store value in cache by key.
   *
   * @param key   Key that value can be accessed later.
   * @param value Stored value, can't be undefined.
   * @param ttl   Time in seconds during which value will be treated as fresh. 0 means
   *  unlimited storage time.
   */
  public set(key: K, value: V, ttl?: ICacheOptions['defaultTTL']): void {
    ttl = typeof ttl === 'undefined' ? this._options.defaultTTL : ttl;
    const stored = this._options.getSeconds();
    const expire = Math.max(ttl && stored + ttl, 0);

    this.storeEntry(key, value, stored, ttl!, expire);
    this._counters.stores++;

    if (this._isFiniteCapacity) {
      this.removeDanglingEntries();
    }
  }

  /**
   * As .set but multiple items at a time.
   *
   * @param kv Object where keys - key to replace values - values to set.
   *
   * @returns Object where keys - requested keys and values - set result.
   */
  public mset(kv: Record<K, V>, ttl?: ICacheOptions['defaultTTL']): void {
    ttl = typeof ttl === 'undefined' ? this._options.defaultTTL : ttl;
    const stored = this._options.getSeconds();
    const expire = Math.max(ttl && stored + ttl, 0);

    (Object.entries(kv) as [K, V][]).forEach(([key, value]) => {
      this.storeEntry(key, value, stored, ttl!, expire);
      this._counters.stores++;
    });

    if (this._isFiniteCapacity) {
      this.removeDanglingEntries();
    }
  }

  /**
   * Store value in cache by key only if does not exist yet.
   *
   * @param key   Key that value can be accessed later.
   * @param value Stored value, can't be undefined.
   * @param ttl   Time in seconds during which value will be treated as fresh. 0 means
   *  unlimited storage time.
   *
   * @returns _true_ in case value been stored and _false_ otherwise
   */
  public add(key: K, value: V, ttl?: ICacheOptions['defaultTTL']): boolean {
    if (this.fetchIfNotExpired(key, true)) {
      return false;
    }

    this.set(key, value, ttl);

    return true;
  }

  /**
   * As .add but multiple items at a time.
   *
   * @param kv Object where keys - key to add values - values to add.
   *
   * @returns Object where keys - requested keys and values - add result.
   */
  public madd<Keys extends K = K>(
    kv: Record<Keys, V>,
    ttl?: ICacheOptions['defaultTTL'],
  ): Record<Keys, boolean> {
    ttl = typeof ttl === 'undefined' ? this._options.defaultTTL : ttl;
    const stored = this._options.getSeconds();
    const expire = Math.max(ttl && stored + ttl, 0);
    const result = {} as Record<Keys, boolean>;

    (Object.entries(kv) as [Keys, V][]).forEach(([key, value]) => {
      if (this.fetchIfNotExpired(key, true)) {
        result[key] = false;
      } else {
        this.storeEntry(key, value, stored, ttl!, expire);
        this._counters.stores++;
        result[key] = true;
      }
    });

    if (this._isFiniteCapacity) {
      this.removeDanglingEntries();
    }

    return result;
  }

  /**
   * Store value in cache by key only if it is already exist in store.
   *
   * @param key   Key that value can be accessed later.
   * @param value Stored value, can't be undefined.
   * @param ttl   Time in seconds during which value will be treated as fresh. 0 means
   *  unlimited storage time.
   *
   * @returns _true_ in case value been stored and _false_ otherwise.
   */
  public replace(key: K, value: V, ttl?: ICacheOptions['defaultTTL']): boolean {
    if (!this.fetchIfNotExpired(key, true)) {
      return false;
    }

    ttl = typeof ttl === 'undefined' ? this._options.defaultTTL : ttl;
    const stored = this._options.getSeconds();
    const expire = Math.max(ttl && stored + ttl, 0);

    this.storeEntry(key, value, stored, ttl!, expire);
    this._counters.replaces++;

    if (this._isFiniteCapacity) {
      this.removeDanglingEntries();
    }

    return true;
  }

  /**
   * As .replace but multiple items at a time.
   *
   * @param kv Object where keys - key to replace values - values to replace with.
   *
   * @returns Object where keys - requested keys and values - replace result.
   */
  public mreplace<Keys extends K = K>(
    kv: Record<Keys, V>,
    ttl?: ICacheOptions['defaultTTL'],
  ): Record<Keys, boolean> {
    ttl = typeof ttl === 'undefined' ? this._options.defaultTTL : ttl;
    const stored = this._options.getSeconds();
    const expire = Math.max(ttl && stored + ttl, 0);
    const result = {} as Record<Keys, boolean>;

    (Object.entries(kv) as [Keys, V][]).forEach(([key, value]) => {
      if (!this.fetchIfNotExpired(key, true)) {
        result[key] = false;
      } else {
        this.storeEntry(key, value, stored, ttl!, expire);
        this._counters.replaces++;
        result[key] = true;
      }
    });

    if (this._isFiniteCapacity) {
      this.removeDanglingEntries();
    }

    return result;
  }

  /**
   * Return value stored by key or undefined otherwise.
   *
   * @returns Stored value or undefined in case it does not exist or expired.
   */
  public get(key: K): V | undefined {
    const res = this.fetchIfNotExpired(key);

    if (typeof res === 'undefined') {
      this._counters.misses++;
    } else {
      this._counters.hits++;
    }

    return res;
  }

  /**
   * As .get but multiple items at a time.
   *
   * @param keys Array of keys to get.
   *
   * @returns Object where keys - requested keys and values - get result.
   */
  public mget<Keys extends K = K>(keys: Keys[]): Record<Keys, V | undefined> {
    const result = {} as Record<Keys, V | undefined>;
    const now = this._options.getSeconds();

    keys.forEach((key) => {
      const res = this.fetchIfNotExpired(key, false, now);

      if (typeof res === 'undefined') {
        this._counters.misses++;
      } else {
        this._counters.hits++;
      }

      result[key] = res;
    });

    return result;
  }

  /**
   * Check if key exists and not expired.
   *
   * @returns _true_ in case key exists and not expired and _false_ otherwise.
   */
  public has(key: K): boolean {
    return Boolean(this.fetchIfNotExpired(key, true));
  }

  /**
   * Delete key from cache.
   *
   * @return _true_ in case key existed and been deleted and _false_ otherwise.
   */
  public del(key: K): boolean {
    if (this._storage.delete(key)) {
      this._counters.deletes++;

      if (this._isFiniteCapacity) {
        this._storedKeys.delete(key);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
   * As .del but multiple items at a time.
   *
   * @param keys Array of keys to delete.
   *
   * @returns Object where keys - requested keys and values - delete result.
   */
  public mdel<Keys extends K = K>(keys: Keys[]): Record<Keys, boolean> {
    const result = {} as Record<Keys, boolean>;

    keys.forEach((key) => {
      if (this._storage.delete(key)) {
        this._counters.deletes++;

        if (this._isFiniteCapacity) {
          this._storedKeys.delete(key);
        }

        result[key] = true;
      } else {
        result[key] = false;
      }
    });

    return result;
  }

  /**
   * Clear the storage completely (stats will remain untouched).
   */
  public clear(): void {
    this._storage.clear();
    if (this._isFiniteCapacity) {
      this._storedKeys.clear();
    }
    this._counters.clears++;
  }

  /**
   * Clear counters (set all counters back to 0).
   */
  public clearCounters(): void {
    const keys = Object.keys(this._counters) as (keyof Omit<
      ICacheStats,
      'keys' | 'capacity' | 'uptime'
    >)[];
    keys.forEach((key) => {
      this._counters[key] = 0;
    });
  }

  /**
   * @returns IterableIterator to iterate over all stored keys in order from oldest to newest key.
   * <br/>In case cache instance been constructed with _`capacity: 0`_ option - keys will be in
   * first-set order.
   */
  public keysIterator(): IterableIterator<K> {
    if (this._isFiniteCapacity) {
      return this._storedKeys.values();
    }

    return this._storage.keys();
  }

  /**
   * @returns Array containing all the keys in order from oldest to newest.
   * <br/>In case cache instance been constructed with _`capacity: 0`_ option - keys will be in
   * first-set order.
   */
  public keys(): K[] {
    const keys: K[] = [];

    if (this._isFiniteCapacity) {
      for (const key of this._storedKeys.values()) {
        keys.push(key);
      }
    } else {
      for (const key of this._storage.keys()) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * WARNING!
   * <br/>This method returns different from internal storage Map, but contain reference-equal
   * values - use it with caution!
   *
   * @returns Map identical to internal storage.
   */
  public rawEntries(): Map<K, ICacheEntry<K, V>> {
    return new Map(this._storage.entries());
  }
}
