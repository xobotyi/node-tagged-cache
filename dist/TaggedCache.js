"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TagController_1 = require("./TagController");
const timestamp_1 = require("./timestamp");
const defaultOptions = {
    defaultTTL: 600000,
    emitErrorOnMissing: false,
    cleanupInterval: 60000
};
class TaggedCache {
    constructor(options = {}) {
        this.options = Object.assign({}, defaultOptions);
        this.tags = new TagController_1.TagController();
        this.storage = new Map();
        this.setOptions(options);
    }
    setOptions(options) {
        if (options.defaultTTL && options.defaultTTL < 0) {
            throw new Error("defaultTTL has to be greater or equal 0");
        }
        if (options.cleanupInterval && options.cleanupInterval < 0) {
            throw new Error("cleanupInterval has to be greater or equal 0");
        }
        this.options = Object.assign({}, this.options, options);
        return this;
    }
    getOptions() {
        return Object.assign({}, this.options);
    }
    set(key, value, ttl, tags = []) {
        const iat = timestamp_1.default();
        const entry = {
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
    mset(setToStore, ttl, tags = []) {
        const iat = timestamp_1.default();
        for (let key in setToStore) {
            const entry = {
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
    get(key, defaultValue = undefined, raw = false) {
        const entry = this.storage.get(key);
        if (!entry || !this.isValid(entry)) {
            return defaultValue;
        }
        return raw ? Object.assign({}, entry) : entry.val;
    }
    mget(keys, defaultValue = undefined, raw = false) {
        const result = {};
        const now = timestamp_1.default();
        for (const key of keys) {
            const entry = this.storage.get(key);
            if (!entry || !this.isValid(entry, now)) {
                result[key] = defaultValue;
                continue;
            }
            result[key] = raw ? Object.assign({}, entry) : entry.val;
        }
        return result;
    }
    has(key) {
        const entry = this.storage.get(key);
        if (entry) {
            return this.isValid(entry);
        }
        return false;
    }
    mhas(keys) {
        const result = {};
        const now = timestamp_1.default();
        for (let key of keys) {
            const entry = this.storage.get(key);
            if (entry) {
                result[key] = this.isValid(entry, now);
            }
            else {
                result[key] = false;
            }
        }
        return result;
    }
    delete(key) {
        this.storage.delete(key);
        return this;
    }
    mdelete(keys) {
        for (const key of keys) {
            this.storage.delete(key);
        }
        return this;
    }
    isValid(entry, now = 0) {
        if ((entry.exp && (now || timestamp_1.default()) >= entry.exp) ||
            (entry.tags && !this.tags.validate(entry.tags))) {
            this.storage.delete(entry.key);
            return false;
        }
        return true;
    }
}
exports.TaggedCache = TaggedCache;
