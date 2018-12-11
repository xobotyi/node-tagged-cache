import { TagController, TagsList, TagsVersionsList } from "./TagController";
import timestamp from "./timestamp";
import { Crawler } from "./Crawler";

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

interface StatsObject {
  items: number;
  time: number;
  uptime: number;
}

type TaggedCacheStorage = Map<string, TaggedCacheEntry>;
type TaggedCacheKey = string;
type TaggedCacheKeysList = string[];

export default class TaggedCache {
  private options: TaggedCacheOptions = { ...defaultOptions };

  private readonly tags: TagController = new TagController();

  private readonly storage: TaggedCacheStorage = new Map();

  private readonly crawler: Crawler;

  private readonly createdAt: number = Date.now();

  constructor(options: TaggedCacheOptions = {}) {
    this.crawler = new Crawler(this.cleanup);

    this.setOptions(options);
  }

  private cleanup = async (): Promise<void> => {
    for (let entry of this.storage.values()) {
      this.validate(entry);
    }
  };

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

    if (this.options.cleanupInterval) {
      this.crawler.setInterval(this.options.cleanupInterval).start();
    } else {
      this.crawler.stop();
    }

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

    if (!entry || !this.validate(entry)) {
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

      if (!entry || !this.validate(entry, now)) {
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
      return this.validate(entry);
    }

    return false;
  }

  public mhas(keys: TaggedCacheKeysList): MultiHasResult {
    const result: MultiHasResult = {};
    const now = timestamp();

    for (let key of keys) {
      const entry = this.storage.get(key);

      if (entry) {
        result[key] = this.validate(entry, now);
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

  public validate(entry: TaggedCacheEntry, now: number = 0): boolean {
    if (
      (entry.exp && (now || timestamp()) >= entry.exp) ||
      (entry.tags && !this.tags.validate(entry.tags))
    ) {
      this.storage.delete(entry.key);
      return false;
    }

    return true;
  }

  public flush(): TaggedCache {
    this.storage.clear();
    this.crawler.stop();

    return this;
  }

  public keys(): IterableIterator<string> {
    return this.storage.keys();
  }

  public stats(): StatsObject {
    const stats: StatsObject = {
      items: this.storage.size,
      time: timestamp(),
      uptime: Date.now() - this.createdAt
    };

    return stats;
  }
}
