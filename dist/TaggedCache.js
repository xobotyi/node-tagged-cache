"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TagController_1 = require("./TagController");
const timestamp_1 = require("./timestamp");
const Crawler_1 = require("./Crawler");
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
        this.createdAt = Date.now();
        this.cleanup = () => __awaiter(this, void 0, void 0, function* () {
            for (let entry of this.storage.values()) {
                this.validate(entry);
            }
        });
        this.crawler = new Crawler_1.Crawler(this.cleanup);
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
        if (this.options.cleanupInterval) {
            this.crawler.setInterval(this.options.cleanupInterval).start();
        }
        else {
            this.crawler.stop();
        }
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
        if (!entry || !this.validate(entry)) {
            return defaultValue;
        }
        return raw ? Object.assign({}, entry) : entry.val;
    }
    mget(keys, defaultValue = undefined, raw = false) {
        const result = {};
        const now = timestamp_1.default();
        for (const key of keys) {
            const entry = this.storage.get(key);
            if (!entry || !this.validate(entry, now)) {
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
            return this.validate(entry);
        }
        return false;
    }
    mhas(keys) {
        const result = {};
        const now = timestamp_1.default();
        for (let key of keys) {
            const entry = this.storage.get(key);
            if (entry) {
                result[key] = this.validate(entry, now);
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
    validate(entry, now = 0) {
        if ((entry.exp && (now || timestamp_1.default()) >= entry.exp) ||
            (entry.tags && !this.tags.validate(entry.tags))) {
            this.storage.delete(entry.key);
            return false;
        }
        return true;
    }
    flush() {
        this.storage.clear();
        this.crawler.stop();
        return this;
    }
    keys() {
        return this.storage.keys();
    }
    stats() {
        const stats = {
            items: this.storage.size,
            time: timestamp_1.default(),
            uptime: Date.now() - this.createdAt
        };
        return stats;
    }
}
exports.default = TaggedCache;
