import { TagsList, TagsVersionsList } from "./TagController";
interface TaggedCacheOptions {
    defaultTTL?: number;
    emitErrorOnMissing?: boolean;
    cleanupInterval?: number;
}
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
declare type TaggedCacheKey = string;
declare type TaggedCacheKeysList = string[];
export default class TaggedCache {
    private options;
    private readonly tags;
    private readonly storage;
    private readonly crawler;
    private readonly createdAt;
    constructor(options?: TaggedCacheOptions);
    private cleanup;
    setOptions(options: TaggedCacheOptions): TaggedCache;
    getOptions(): TaggedCacheOptions;
    set(key: TaggedCacheKey, value: any, ttl: number, tags?: TagsList): TaggedCache;
    mset(setToStore: MultiGetResult, ttl: number, tags?: TagsList): TaggedCache;
    get(key: TaggedCacheKey, defaultValue?: any, raw?: false): any;
    get(key: TaggedCacheKey, defaultValue?: any, raw?: true): TaggedCacheEntry;
    mget(keys: TaggedCacheKeysList, defaultValue?: any, raw?: false): MultiGetResult;
    mget(keys: TaggedCacheKeysList, defaultValue?: any, raw?: true): MultiGetEntriesResult;
    has(key: TaggedCacheKey): boolean;
    mhas(keys: TaggedCacheKeysList): MultiHasResult;
    delete(key: TaggedCacheKey): TaggedCache;
    mdelete(keys: TaggedCacheKeysList): TaggedCache;
    validate(entry: TaggedCacheEntry, now?: number): boolean;
    flush(): TaggedCache;
    keys(): IterableIterator<string>;
    stats(): StatsObject;
}
export {};
