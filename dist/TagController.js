"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timestamp_1 = require("./timestamp");
class TagController {
    constructor() {
        this.storage = new Map();
    }
    drop(tagName) {
        const now = timestamp_1.default();
        this.storage.set(tagName, now);
        return now;
    }
    mdrop(tagNames) {
        const result = {};
        const now = timestamp_1.default();
        for (let tagName of tagNames) {
            this.storage.set(tagName, now);
            result[tagName] = now;
        }
        return result;
    }
    get(tagName) {
        let version = this.storage.get(tagName);
        !version && (version = timestamp_1.default()) && this.storage.set(tagName, version);
        return version;
    }
    mget(tagNames) {
        const result = {};
        const now = timestamp_1.default();
        for (let tagName of tagNames) {
            let version = this.storage.get(tagName);
            !version && (version = now) && this.storage.set(tagName, version);
            result[tagName] = version;
        }
        return result;
    }
    validate(tagsVersions) {
        for (const tagName in tagsVersions) {
            if (tagsVersions[tagName] !== this.storage.get(tagName)) {
                return false;
            }
        }
        return true;
    }
}
exports.TagController = TagController;
