import { TagController, TagsList, TagsVersionsList } from "./TagController";
import timestamp from "./timestamp";

interface TaggedCacheOptions {
  defaultTTL?: number;
  emitErrorOnMissing?: boolean;
  cleanupInterval?: number;
}

const defaultOptions: TaggedCacheOptions = {
  defaultTTL: 600000, // 10m
  emitErrorOnMissing: false,
  cleanupInterval: 60000 // 1m
};

interface MultiGetResult {
  [number: string]: any;
}

interface MultiGetEntriesResult {
  [number: string]: TaggedCacheEntry;
}

interface MultiHasResult {
  [number: string]: boolean;
}

interface TaggedCacheEntry {
  key: string;
  exp: number;
  iat: number;
  ttl: number;
  tags: TagsVersionsList | null;
  val: any;
}

type TaggedCacheStorage = Map<string, TaggedCacheEntry>;
type TaggedCacheKey = string;
type TaggedCacheKeysList = string[];

export class TaggedCache {
  private options: TaggedCacheOptions = { ...defaultOptions };

  private readonly tags: TagController = new TagController();

  private storage: TaggedCacheStorage = new Map();

  constructor(options: TaggedCacheOptions = {}) {
    this.setOptions(options);
  }

  public setOptions(options: TaggedCacheOptions): TaggedCache {
    if (options.defaultTTL && options.defaultTTL < 0) {
      throw new Error("defaultTTL has to be greater or equal 0");
    }
    if (options.cleanupInterval && options.cleanupInterval < 0) {
      throw new Error("cleanupInterval has to be greater or equal 0");
    }

    this.options = {
      ...this.options,
      ...options
    };

    return this;
  }

  public getOptions(): TaggedCacheOptions {
    return { ...this.options };
  }

  public set(
    key: TaggedCacheKey,
    value: any,
    ttl: number,
    tags: TagsList = []
  ): TaggedCache {
    const iat = timestamp();

    const entry: TaggedCacheEntry = {
      key,
      val: value,
      iat,
      ttl,
      exp: ttl && iat + ttl,
      tags: !tags.length ? null : this.tags.mget(tags)
    };

    this.storage.set(key, entry);

    return this;
  }

  public mset(
    setToStore: MultiGetResult,
    ttl: number,
    tags: TagsList = []
  ): TaggedCache {
    const iat = timestamp();

    for (let key in setToStore) {
      const entry: TaggedCacheEntry = {
        key,
        val: setToStore[key],
        iat,
        ttl,
        exp: ttl && iat + ttl,
        tags: !tags.length ? null : this.tags.mget(tags)
      };

      this.storage.set(key, entry);
    }

    return this;
  }

  public get(key: TaggedCacheKey, defaultValue?: any, raw?: false): any;
  public get(
    key: TaggedCacheKey,
    defaultValue?: any,
    raw?: true
  ): TaggedCacheEntry;
  public get(
    key: TaggedCacheKey,
    defaultValue: any = undefined,
    raw: boolean = false
  ): any | TaggedCacheEntry {
    const entry = this.storage.get(key);

    if (!entry || !this.isValid(entry)) {
      return defaultValue;
    }

    return raw ? { ...entry } : entry.val;
  }

  public mget(
    keys: TaggedCacheKeysList,
    defaultValue?: any,
    raw?: false
  ): MultiGetResult;
  public mget(
    keys: TaggedCacheKeysList,
    defaultValue?: any,
    raw?: true
  ): MultiGetEntriesResult;
  public mget(
    keys: TaggedCacheKeysList,
    defaultValue: any = undefined,
    raw: boolean = false
  ): MultiGetResult | MultiGetEntriesResult {
    const result: MultiGetResult = {};
    const now = timestamp();

    for (const key of keys) {
      const entry = this.storage.get(key);

      if (!entry || !this.isValid(entry, now)) {
        result[key] = defaultValue;
        continue;
      }

      result[key] = raw ? { ...entry } : entry.val;
    }

    return result;
  }

  public has(key: TaggedCacheKey): boolean {
    const entry = this.storage.get(key);

    if (entry) {
      return this.isValid(entry);
    }

    return false;
  }

  public mhas(keys: TaggedCacheKeysList): MultiHasResult {
    const result: MultiHasResult = {};
    const now = timestamp();

    for (let key of keys) {
      const entry = this.storage.get(key);

      if (entry) {
        result[key] = this.isValid(entry, now);
      } else {
        result[key] = false;
      }
    }

    return result;
  }

  public delete(key: TaggedCacheKey): TaggedCache {
    this.storage.delete(key);

    return this;
  }

  public mdelete(keys: TaggedCacheKeysList): TaggedCache {
    for (const key of keys) {
      this.storage.delete(key);
    }

    return this;
  }

  public isValid(entry: TaggedCacheEntry, now: number = 0): boolean {
    if (
      (entry.exp && (now || timestamp()) >= entry.exp) ||
      (entry.tags && !this.tags.validate(entry.tags))
    ) {
      this.storage.delete(entry.key);
      return false;
    }

    return true;
  }
}
