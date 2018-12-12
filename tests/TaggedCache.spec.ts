import {disableTimestampCache, TaggedCache, timestamp} from "../src/index";

disableTimestampCache();

describe("TaggedCache", () => {
    const cache = new TaggedCache({cleanupInterval: 60000});

    afterEach(() => {
        cache.flush();
    });

    describe(".getOptions", () => {
        it("should return an object", () => {
            expect(typeof cache.getOptions()).toBe("object");
        });

        it("returned object should be only a copy", () => {
            expect(cache.getOptions()).not.toBe(cache.getOptions());
        });

        it("and contain all needed fields", () => {
            const optsKeys: string[] = Object.getOwnPropertyNames(cache.getOptions());

            expect(optsKeys.includes("defaultTTL")).toBeTruthy();
            expect(optsKeys.includes("emitErrorOnMissing")).toBeTruthy();
            expect(optsKeys.includes("cleanupInterval")).toBeTruthy();
        });
    });

    describe(".setOptions", () => {
        it("should return an instance", () => {
            expect(cache.setOptions({})).toBe(cache);
        });

        it("should apply given options", () => {
            expect(cache.setOptions({defaultTTL: 150}).getOptions().defaultTTL).toBe(150);
        });

        it("should throw if defaultTTL <0", () => {
            expect(() => cache.setOptions({defaultTTL: -1})).toThrowError();
        });

        it("should throw if cleanupInterval <0", () => {
            expect(() => cache.setOptions({cleanupInterval: -1})).toThrowError();
        });

        it("should restart the crawler if cleanupInterval has changed", (done) => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 10, ['tag1']);
            expect(cache.stats().items).toBe(2);
            expect(cache.crawler.active).toBeTruthy();

            setTimeout(() => {
                cache.setOptions({cleanupInterval: 1000});
                expect(cache.stats().items).toBe(0);
                done();
            }, 50);
        });
    });

    describe(".stats", () => {
        it("should return actual server statistics", () => {
            const stats = cache.stats();
            const keys  = Object.getOwnPropertyNames(stats);

            expect(keys.includes("items")).toBeTruthy();
            expect(keys.includes("time")).toBeTruthy();
            expect(keys.includes("uptime")).toBeTruthy();
        });
    });

    describe(".cleanup", () => {
        it("should remove all invalid keys", (done) => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            expect(cache.stats().items).toBe(2);
            cache.tags.drop('tag1');
            cache.cleanup().then(() => {
                expect(cache.stats().items).toBe(0);
                done();
            });
        });
    });

    describe(".validate", () => {
        const testEntry = {
            key: "testKey",
            exp: 0,
            iat: 0,
            ttl: 0,
            tags: {},
            val: null,
        };

        it("should return true if exp === 0", () => {
            expect(cache.validate(testEntry)).toBeTruthy();
        });

        it("should return true if exp > 0 and not in past", () => {
            testEntry.exp = timestamp() + 10;
            expect(cache.validate(testEntry)).toBeTruthy();
        });

        it("should delete entry given key if it is invalid", () => {
            testEntry.exp = 2;
            testEntry.iat = 1;
            testEntry.ttl = 1;

            expect(cache.stats().items).toBe(0);
            cache.set('testKey', 'testValue', 200000, ['tag1']);
            expect(cache.stats().items).toBe(1);
            expect(cache.validate(testEntry)).toBeFalsy();
            expect(cache.stats().items).toBe(0);
        });
    });

    describe(".delete", () => {
        it("should return instance", () => {
            expect(cache.delete('testKey')).toBe(cache);
        });
        it("should delete given key", () => {
            expect(cache.stats().items).toBe(0);
            cache.set('testKey', 'testValue', 200000, ['tag1']);
            expect(cache.stats().items).toBe(1);
            cache.delete('testKey');
            expect(cache.stats().items).toBe(0);
        });
    });

    describe(".mdelete", () => {
        it("should return instance", () => {
            expect(cache.mdelete(['testKey'])).toBe(cache);
        });

        it("should delete given keys", () => {
            expect(cache.stats().items).toBe(0);
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            expect(cache.stats().items).toBe(2);
            cache.mdelete(['testKey', 'testKey2']);
            expect(cache.stats().items).toBe(0);
        });
    });

    describe(".flush", () => {
        it("should empty the storage", () => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            expect(cache.stats().items).toBe(2);
            cache.flush();
            expect(cache.stats().items).toBe(0);
        });

        it("and stop the crawler", () => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            cache.flush();

            expect(cache.crawler.active).toBeFalsy();
        });
    });

    describe(".keys", () => {
        it("should return the iterator", () => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            expect(cache.stats().items).toBe(2);
            expect(cache.keys().next).toBeInstanceOf(Function);
        });

        it("that will iterate over the keys", () => {
            cache.mset({'testKey': 'testValue', 'testKey2': 'testValue2'}, 200000, ['tag1']);
            const iterator = cache.keys();
            expect(iterator.next().value).toBe("testKey");
            expect(iterator.next().value).toBe("testKey2");
        });
    });

    describe(".set", () => {
        it("should return the cache instance", () => {
            expect(cache.set('testKey', 'testValue', 200000)).toBe(cache);
        });

        it("should store given value with given key and TTL", () => {
            cache.set('testKey', 'testValue', 200000, ['tag1']);
            const entry = cache.get('testKey', null, true);

            expect(cache.stats().items).toBe(1);
            expect(entry).not.toBe(null);
            expect(entry.key).toBe('testKey');
            expect(entry.val).toBe('testValue');
            expect(entry.ttl).toBe(200000);
            expect(entry.exp - entry.iat).toBe(200000);
            expect(Object.getOwnPropertyNames(entry.tags).length).toBe(1);
        });
    });

    describe(".mset", () => {
        it("should return the cache instance", () => {
            expect(cache.mset({'testKey': 'testValue'}, 200000)).toBe(cache);
        });

        it("should store given value with given key and TTL", () => {
            cache.mset(
                {
                    'testKey': 'testValue',
                    'testKey1': 'testValue1',
                },
                200000,
                ['tag1']);
            const entries = cache.mget(['testKey', 'testKey1'], null, true);

            expect(cache.stats().items).toBe(2);
            expect(entries['testKey']).not.toBe(null);
            expect(entries['testKey'].key).toBe('testKey');
            expect(entries['testKey'].val).toBe('testValue');
            expect(entries['testKey'].ttl).toBe(200000);
            expect(entries['testKey'].exp - entries['testKey'].iat).toBe(200000);
            expect(Object.getOwnPropertyNames(entries['testKey'].tags).length).toBe(1);

            expect(entries['testKey1']).not.toBe(null);
            expect(entries['testKey1'].key).toBe('testKey1');
            expect(entries['testKey1'].val).toBe('testValue1');
            expect(entries['testKey1'].ttl).toBe(200000);
            expect(entries['testKey1'].exp - entries['testKey1'].iat).toBe(200000);
            expect(Object.getOwnPropertyNames(entries['testKey1'].tags).length).toBe(1);
        });
    });

    describe(".get", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);
        it("should return default value if entry does not exists", () => {
            expect(cache.get('testKey2', "This item is not exists")).toBe("This item is not exists");
        });

        it("should return whole entry with service fields if item exists and raw=true", () => {
            const entry = cache.get('testKey', "This item does not exist", true);

            expect(typeof entry).toBe("object");

            expect(entry.key).toBe('testKey');
            expect(entry.val).toBe('testValue');
            expect(entry.ttl).toBe(200000);
            expect(entry.exp - entry.iat).toBe(200000);
            expect(Object.getOwnPropertyNames(entry.tags).length).toBe(1);
        });

        it("should return only value if item exists and raw=false", () => {
            expect(cache.get('testKey')).toBe("testValue");
        });

        it("should invalidate entry if it is expired but not garbage collected yet", (done) => {
            cache.set('testKey', 'testValue', 2, ['tag1']);
            setTimeout(() => {
                expect(cache.get('testKey', "This item is not exists")).toBe("This item is not exists");
                done();
            }, 10)
        });
    });

    describe(".mget", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);

        const testKeyEntry  = cache.get('testKey', null, true);
        const testKey1Entry = cache.get('testKey1', null, true);

        it("should return an object with requested keys as object keys and result as values", () => {
            const res = cache.mget(["testKey", "testKey1", "testKey3"]);
            expect(typeof res).toBe('object');
            expect(res).toEqual({
                                    "testKey": "testValue",
                                    "testKey1": "testValue1",
                                    "testKey3": undefined,
                                });
        });

        it("should return whole entry with service fields if item exists and raw=true", () => {
            const res = cache.mget(["testKey", "testKey1", "testKey3"], null, true);
            expect(res).toEqual({
                                    "testKey": testKeyEntry,
                                    "testKey1": testKey1Entry,
                                    "testKey3": null,
                                });
        });

        it("should invalidate entries if it is expired but not garbage collected yet", (done) => {
            cache.set('testKey', 'testValue', 2, ['tag1']);
            setTimeout(() => {
                const res = cache.mget(["testKey", "testKey1", "testKey3"], null, true);
                expect(res).toEqual({
                                        "testKey": null,
                                        "testKey1": testKey1Entry,
                                        "testKey3": null,
                                    });
                done();
            }, 10)
        });
    });

    describe(".has", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);

        it("should return false if entry does not exists", () => {
            expect(cache.has('testKey2')).toBeFalsy();
        });

        it("should return true if entry exists", () => {
            expect(cache.has('testKey')).toBeTruthy();
        });

        it("should invalidate entry if it is expired but not garbage collected yet and return false", (done) => {
            cache.set('testKey', 'testValue', 2, ['tag1']);
            setTimeout(() => {
                expect(cache.has('testKey')).toBeFalsy();
                done();
            }, 10)
        });
    });

    describe(".mhas", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);

        it("should return an object with requested keys as object keys and result as values", () => {
            const res = cache.mhas(["testKey", "testKey1", "testKey3"]);
            expect(typeof res).toBe('object');
            expect(res).toEqual({
                                    "testKey": true,
                                    "testKey1": true,
                                    "testKey3": false,
                                });
        });

        it("should invalidate entries if it is expired but not garbage collected yet", (done) => {
            cache.set('testKey', 'testValue', 2, ['tag1']);
            setTimeout(() => {
                const res = cache.mhas(["testKey", "testKey1", "testKey3"]);
                expect(res).toEqual({
                                        "testKey": false,
                                        "testKey1": true,
                                        "testKey3": false,
                                    });
                done();
            }, 10)
        });
    });

    describe(".delete", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);

        it("should return an instance", () => {
            expect(cache.delete('testKey3')).toBe(cache);
        });

        it("should delete given entry", () => {
            expect(cache.delete('testKey').get("testKey", "This item does not exist")).toBe("This item does not exist");
        });
    });

    describe(".mdelete", () => {
        const cache = new TaggedCache({cleanupInterval: 0});
        cache.mset(
            {
                'testKey': 'testValue',
                'testKey1': 'testValue1',
            },
            200000,
            ['tag1']);

        it("should return an instance", () => {
            expect(cache.mdelete(['testKey3'])).toBe(cache);
        });

        it("should delete given entries", () => {
            cache.mdelete(['testKey', 'testKey1']);
            expect(cache.get("testKey", "This item does not exist")).toBe("This item does not exist");
            expect(cache.get("testKey1", "This item does not exist")).toBe("This item does not exist");
        });
    });
});
