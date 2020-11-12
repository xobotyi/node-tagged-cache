jest.useFakeTimers();

import {Cache} from '../src';
import {getControllableSecondsFetcher} from './controllableSecondsFetcher';
import {ICacheStats} from '../src/types';

describe('Cache', () => {
  it('should be defined', () => {
    expect(Cache).toBeDefined();
  });

  it('should be constructable via new', () => {
    const cache = new Cache({garbageCollectInterval: 0});

    expect(cache instanceof Cache).toBe(true);
  });

  it('should contain entries passed to constructor', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({getSeconds, garbageCollectInterval: 0}, [
      [
        'someKey1',
        {
          k: 'someKey1',
          v: 'someValue',
          s: getSeconds(),
          t: 20,
          e: getSeconds() + 20,
        },
      ],
      [
        'someKey2',
        {
          k: 'someKey2',
          v: 'someValue',
          s: getSeconds(),
          t: 20,
          e: getSeconds() + 20,
        },
      ],
    ]);

    expect(cache.has('someKey1')).toBe(true);
    expect(cache.has('someKey2')).toBe(true);
  });

  it('should throw if invalid construction options passed', () => {
    expect(() => {
      new Cache({capacity: -1});
    }).toThrow(new TypeError('capacity has to be a positive integer or Infinity'));
    expect(() => {
      new Cache({capacity: -Infinity});
    }).toThrow(new TypeError('capacity has to be a positive integer or Infinity'));
    expect(() => {
      new Cache({garbageCollectInterval: -1});
    }).toThrow(new TypeError('garbageCollectInterval has to be non-negative integer'));
    expect(() => {
      new Cache({defaultTTL: -1});
    }).toThrow(new TypeError('defaultTTL has to be non-negative integer'));
    expect(() => {
      /* @ts-expect-error non-functions has to error-out */
      new Cache({getSeconds: 1123});
    }).toThrow(new TypeError('getSeconds has to be a function'));
    expect(() => {
      new Cache({
        defaultTTL: 600,
        capacity: 10,
        clone: true,
        garbageCollectInterval: 0,
        getSeconds: () => 123,
      });
    }).not.toThrow();
  });

  describe('finite capacity cache', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({capacity: 5, getSeconds, garbageCollectInterval: 0});

    it('.options should return normalized options object', () => {
      expect(cache.options).toStrictEqual({
        capacity: 5,
        clone: true,
        garbageCollectInterval: 0,
        defaultTTL: 60,
        getSeconds,
      });
    });

    it('.set should store value by key', () => {
      cache.set('someKey', 'someValue', 20);

      expect(cache.get('someKey')).toBe('someValue');
    });

    it('.size should return amount of items stored in cache', () => {
      expect(cache.size).toBe(1);
    });

    it('.capacity should return amount of items that can be stored in cache', () => {
      expect(cache.capacity).toBe(4);
    });

    it('.totalCapacity should return total amount of items that can be stored in cache', () => {
      expect(cache.totalCapacity).toBe(5);
    });

    it('.get should retrieve value by key', () => {
      expect(cache.get('someKey')).toBe('someValue');
    });

    it('.get should return undefined if key not exists', () => {
      expect(cache.get('someKey1')).toBeUndefined();
    });

    it('.get should return undefined if entry is expired', () => {
      getSeconds.advanceTime(21);
      expect(cache.get('someKey')).toBeUndefined();
    });

    it('.mset should store value by key', () => {
      cache.mset(
        {
          someKey: 'someValue',
          someKey1: 'someValue1',
        },
        20,
      );
      cache.set('someKey', 'someValue', 22);

      expect(cache.get('someKey')).toBe('someValue');
      expect(cache.get('someKey1')).toBe('someValue1');
    });

    it('.mget should retrieve values by key', () => {
      expect(cache.mget(['someKey', 'someKey1'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: 'someValue1',
      });
    });

    it('.mget should return undefined if key not exists', () => {
      expect(cache.mget(['someKey', 'someKey1', 'someKey3'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: 'someValue1',
        someKey3: undefined,
      });
    });

    it('.mget should return undefined if entry is expired', () => {
      getSeconds.advanceTime(21);
      expect(cache.mget(['someKey', 'someKey1', 'someKey3'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: undefined,
        someKey3: undefined,
      });
    });

    it('.stats should return actual stats', () => {
      expect(cache.stats).toStrictEqual({
        capacity: 5,
        deletes: 0,
        hits: 9,
        keys: 1,
        misses: 5,
        stores: 4,
        replaces: 0,
        clears: 0,
        uptime: 42,
        writes: 4,
      } as ICacheStats);
    });

    it('.set should increase stores and writes counter', () => {
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey', 'someValue', 20);
      expect(cache.stats.stores).toBe(7);
      expect(cache.stats.writes).toBe(7);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.keys).toBe(1);
    });

    it('.mset should increase stores and writes counter', () => {
      cache.mset(
        {
          someKey1: 'someValue',
          someKey2: 'someValue',
          someKey3: 'someValue',
        },
        20,
      );
      expect(cache.stats.stores).toBe(10);
      expect(cache.stats.writes).toBe(10);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.keys).toBe(4);
    });

    it('.keys should return array with keys sorted by update time', () => {
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey1', 'someValue', 20);
      cache.set('someKey2', 'someValue', 20);
      cache.set('someKey3', 'someValue', 20);
      cache.set('someKey1', 'someValue', 20);
      expect(cache.keys()).toStrictEqual(['someKey', 'someKey2', 'someKey3', 'someKey1']);
    });

    it('.keysIterator should return iterator', () => {
      expect(Symbol.iterator in cache.keysIterator()).toBe(true);
    });

    it('first inserted keys should be deleted on capacity overflow', () => {
      cache.set('someKey1', 'someValue', 20);
      cache.set('someKey2', 'someValue', 20);
      cache.set('someKey3', 'someValue', 20);
      cache.set('someKey4', 'someValue', 20);
      cache.set('someKey5', 'someValue', 20);
      cache.set('someKey6', 'someValue', 20);
      expect(cache.keys()).toStrictEqual([
        'someKey2',
        'someKey3',
        'someKey4',
        'someKey5',
        'someKey6',
      ]);
      cache.set('someKey7', 'someValue', 20);
      expect(cache.keys()).toStrictEqual([
        'someKey3',
        'someKey4',
        'someKey5',
        'someKey6',
        'someKey7',
      ]);
    });

    it('.clear should remove all values and keys from cache', () => {
      cache.clear();
      expect(cache.keys()).toStrictEqual([]);
      expect(cache.size).toBe(0);
      expect(cache.capacity).toBe(5);
      expect(cache.totalCapacity).toBe(5);
      expect(cache.stats.clears).toBe(1);
    });

    it('.clearCounters should nullify all counters', () => {
      cache.clearCounters();
      expect(cache.stats).toStrictEqual({
        capacity: 5,
        deletes: 0,
        keys: 0,
        hits: 0,
        misses: 0,
        stores: 0,
        replaces: 0,
        clears: 0,
        uptime: 42,
        writes: 0,
      } as ICacheStats);
    });

    it('.add should set key only if entry with such key not yet exists', () => {
      expect(cache.add('someKey1', 'someValue', 20)).toBe(true);
      expect(cache.add('someKey1', 'someValue', 20)).toBe(false);
      expect(cache.stats.stores).toBe(1);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.madd should set keys only if entry with such key not yet exists', () => {
      expect(
        cache.madd(
          {
            someKey1: 'someValue',
            someKey2: 'someValue',
          },
          20,
        ),
      ).toStrictEqual({
        someKey1: false,
        someKey2: true,
      });
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.replace should set key only if entry with such key already exists', () => {
      expect(cache.replace('someKey2', 'someValue', 20)).toBe(true);
      expect(cache.replace('someKey3', 'someValue', 20)).toBe(false);
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(1);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.mreplace should set key only if entry with such key already exists', () => {
      expect(
        cache.mreplace(
          {
            someKey2: 'someValue',
            someKey3: 'someValue',
          },
          20,
        ),
      ).toStrictEqual({
        someKey2: true,
        someKey3: false,
      });
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(2);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.has should return true only if entry exists', () => {
      expect(cache.has('someKey2')).toBe(true);
      expect(cache.has('someKey3')).toBe(false);
    });

    it('.del should return true and increase counter only if entry existed', () => {
      expect(cache.del('someKey2')).toBe(true);
      expect(cache.del('someKey3')).toBe(false);
      expect(cache.stats.deletes).toBe(1);
    });

    it('.mdel should increase deletes counter', () => {
      expect(cache.mdel(['someKey1', 'someKey2'])).toStrictEqual({
        someKey1: true,
        someKey2: false,
      });
      expect(cache.stats.deletes).toBe(2);
    });

    it('getRawEntries should return map containing stored entries', () => {
      cache.set('someKey1', 'someValue', 20);
      cache.set('someKey2', 'someValue', 20);

      expect(cache.rawEntries()).toStrictEqual(
        new Map([
          [
            'someKey1',
            {
              k: 'someKey1',
              v: 'someValue',
              s: getSeconds(),
              t: 20,
              e: getSeconds() + 20,
            },
          ],
          [
            'someKey2',
            {
              k: 'someKey2',
              v: 'someValue',
              s: getSeconds(),
              t: 20,
              e: getSeconds() + 20,
            },
          ],
        ]),
      );
    });
  });

  describe('infinite capacity cache', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({capacity: Infinity, getSeconds, garbageCollectInterval: 0});

    it('.options should return normalized options object', () => {
      expect(cache.options).toStrictEqual({
        capacity: Infinity,
        clone: true,
        garbageCollectInterval: 0,
        defaultTTL: 60,
        getSeconds,
      });
    });

    it('.set should store value by key', () => {
      cache.set('someKey', 'someValue', 20);

      expect(cache.get('someKey')).toBe('someValue');
    });

    it('.size should return amount of items stored in cache', () => {
      expect(cache.size).toBe(1);
    });

    it('.capacity should return amount of items that can be stored in cache', () => {
      expect(cache.capacity).toBe(Infinity);
    });

    it('.totalCapacity should return total amount of items that can be stored in cache', () => {
      expect(cache.totalCapacity).toBe(Infinity);
    });

    it('.get should retrieve value by key', () => {
      expect(cache.get('someKey')).toBe('someValue');
    });

    it('.get should return undefined if key not exists', () => {
      expect(cache.get('someKey1')).toBeUndefined();
    });

    it('.get should return undefined if entry is expired', () => {
      getSeconds.advanceTime(21);
      expect(cache.get('someKey')).toBeUndefined();
    });

    it('.mset should store value by key', () => {
      cache.mset(
        {
          someKey: 'someValue',
          someKey1: 'someValue1',
        },
        20,
      );
      cache.set('someKey', 'someValue', 22);

      expect(cache.get('someKey')).toBe('someValue');
      expect(cache.get('someKey1')).toBe('someValue1');
    });

    it('.mget should retrieve values by key', () => {
      expect(cache.mget(['someKey', 'someKey1'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: 'someValue1',
      });
    });

    it('.mget should return undefined if key not exists', () => {
      expect(cache.mget(['someKey', 'someKey1', 'someKey3'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: 'someValue1',
        someKey3: undefined,
      });
    });

    it('.mget should return undefined if entry is expired', () => {
      getSeconds.advanceTime(21);
      expect(cache.mget(['someKey', 'someKey1', 'someKey3'])).toStrictEqual({
        someKey: 'someValue',
        someKey1: undefined,
        someKey3: undefined,
      });
    });

    it('.stats should return actual stats', () => {
      expect(cache.stats).toStrictEqual({
        capacity: Infinity,
        deletes: 0,
        hits: 9,
        keys: 1,
        misses: 5,
        stores: 4,
        replaces: 0,
        clears: 0,
        uptime: 42,
        writes: 4,
      } as ICacheStats);
    });

    it('.set should increase stores and writes counter', () => {
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey', 'someValue', 20);
      expect(cache.stats.stores).toBe(7);
      expect(cache.stats.writes).toBe(7);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.keys).toBe(1);
    });

    it('.mset should increase stores and writes counter', () => {
      cache.mset(
        {
          someKey1: 'someValue',
          someKey2: 'someValue',
          someKey3: 'someValue',
        },
        20,
      );
      expect(cache.stats.stores).toBe(10);
      expect(cache.stats.writes).toBe(10);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.keys).toBe(4);
    });

    it('.keys should return array with keys sorted by insert time', () => {
      cache.set('someKey', 'someValue', 20);
      cache.set('someKey1', 'someValue', 20);
      cache.set('someKey2', 'someValue', 20);
      cache.set('someKey3', 'someValue', 20);
      cache.set('someKey1', 'someValue', 20);
      expect(cache.keys()).toStrictEqual(['someKey', 'someKey1', 'someKey2', 'someKey3']);
    });

    it('.keysIterator should return iterator', () => {
      expect(Symbol.iterator in cache.keysIterator()).toBe(true);
    });

    it('.clear should remove all values and keys from cache', () => {
      cache.clear();
      expect(cache.keys()).toStrictEqual([]);
      expect(cache.size).toBe(0);
      expect(cache.capacity).toBe(Infinity);
      expect(cache.totalCapacity).toBe(Infinity);
      expect(cache.stats.clears).toBe(1);
    });

    it('.clearCounters should nullify all counters', () => {
      cache.clearCounters();
      expect(cache.stats).toStrictEqual({
        capacity: Infinity,
        deletes: 0,
        keys: 0,
        hits: 0,
        misses: 0,
        stores: 0,
        replaces: 0,
        clears: 0,
        uptime: 42,
        writes: 0,
      } as ICacheStats);
    });

    it('.add should set key only if entry with such key not yet exists', () => {
      expect(cache.add('someKey1', 'someValue', 20)).toBe(true);
      expect(cache.add('someKey1', 'someValue', 20)).toBe(false);
      expect(cache.stats.stores).toBe(1);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.madd should set keys only if entry with such key not yet exists', () => {
      expect(
        cache.madd(
          {
            someKey1: 'someValue',
            someKey2: 'someValue',
          },
          20,
        ),
      ).toStrictEqual({
        someKey1: false,
        someKey2: true,
      });
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(0);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.replace should set key only if entry with such key already exists', () => {
      expect(cache.replace('someKey2', 'someValue', 20)).toBe(true);
      expect(cache.replace('someKey3', 'someValue', 20)).toBe(false);
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(1);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.mreplace should set key only if entry with such key already exists', () => {
      expect(
        cache.mreplace(
          {
            someKey2: 'someValue',
            someKey3: 'someValue',
          },
          20,
        ),
      ).toStrictEqual({
        someKey2: true,
        someKey3: false,
      });
      expect(cache.stats.stores).toBe(2);
      expect(cache.stats.replaces).toBe(2);
      expect(cache.stats.hits).toBe(0);
      expect(cache.stats.misses).toBe(0);
    });

    it('.has should return true only if entry exists', () => {
      expect(cache.has('someKey2')).toBe(true);
      expect(cache.has('someKey3')).toBe(false);
    });

    it('.del should return true and increase counter only if entry existed', () => {
      expect(cache.del('someKey2')).toBe(true);
      expect(cache.del('someKey3')).toBe(false);
      expect(cache.stats.deletes).toBe(1);
    });

    it('.mdel should increase deletes counter', () => {
      expect(cache.mdel(['someKey1', 'someKey2'])).toStrictEqual({
        someKey1: true,
        someKey2: false,
      });
      expect(cache.stats.deletes).toBe(2);
    });

    it('getRawEntries should return map containing stored entries', () => {
      cache.set('someKey1', 'someValue', 20);
      cache.set('someKey2', 'someValue', 20);

      expect(cache.rawEntries()).toStrictEqual(
        new Map([
          [
            'someKey1',
            {
              k: 'someKey1',
              v: 'someValue',
              s: getSeconds(),
              t: 20,
              e: getSeconds() + 20,
            },
          ],
          [
            'someKey2',
            {
              k: 'someKey2',
              v: 'someValue',
              s: getSeconds(),
              t: 20,
              e: getSeconds() + 20,
            },
          ],
        ]),
      );
    });
  });

  describe('coning cache', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({capacity: 5, getSeconds, clone: true, garbageCollectInterval: 0});

    it('should return object copy but not object itself', () => {
      const obj = {foo: 'bar', baz: ['bax']};
      cache.set('someKey', obj);

      expect(cache.get('someKey')).not.toBe(obj);
      expect(cache.get('someKey')).toStrictEqual(obj);
    });
  });

  describe('no-coning cache', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({capacity: 5, getSeconds, clone: false, garbageCollectInterval: 0});

    it('should return object itself', () => {
      const obj = {foo: 'bar', baz: ['bax']};
      cache.set('someKey', obj);

      expect(cache.get('someKey')).toBe(obj);
    });
  });

  describe('garbage collector', () => {
    const getSeconds = getControllableSecondsFetcher();
    const cache = new Cache({capacity: 5, getSeconds, garbageCollectInterval: 60});
    const cache2 = new Cache({capacity: 5, getSeconds, garbageCollectInterval: 0});
    const cache3 = new Cache({capacity: 200, getSeconds, garbageCollectInterval: 60});

    it('should remove all expired keys', async (done) => {
      expect(cache.garbageCollectionEnabled).toBe(true);
      cache.set('someKey1', 'someVal', 50);
      cache.set('someKey2', 'someVal', 70);

      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      await cache.garbageCollectorPromise;
      expect(cache.keys()).toStrictEqual(['someKey2']);

      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      await cache.garbageCollectorPromise;
      expect(cache.keys()).toStrictEqual([]);
      done();
    });

    it('should be stopped by .stopGarbageCollection and restarted by .startGarbageCollection', () => {
      expect(cache.garbageCollectionEnabled).toBe(true);
      cache.set('someKey1', 'someVal', 50);
      cache.set('someKey2', 'someVal', 70);
      cache.stopGarbageCollection();
      expect(cache.garbageCollectionEnabled).toBe(false);

      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      expect(cache.keys()).toStrictEqual(['someKey1', 'someKey2']);

      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      expect(cache.keys()).toStrictEqual(['someKey1', 'someKey2']);

      cache.startGarbageCollection();
      expect(cache.garbageCollectionEnabled).toBe(true);
      expect(cache.keys()).toStrictEqual(['someKey1', 'someKey2']);
      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      expect(cache.keys()).toStrictEqual([]);
    });

    it('.startGarbageCollection should not start disabled garbage collection', () => {
      expect(cache2.garbageCollectionEnabled).toBe(false);
      cache2.startGarbageCollection();
      expect(cache2.garbageCollectionEnabled).toBe(false);
    });

    it('garbage collector should be wait each 100 elements processed', async (done) => {
      cache3.stopGarbageCollection();

      for (let i = 0; i < 150; i++) {
        cache3.set(`someKey${i}`, 'someVal', 50);
      }
      expect(cache3.size).toBe(150);

      cache3.startGarbageCollection();
      getSeconds.advanceTime(60);
      jest.advanceTimersToNextTimer();
      expect(cache3.size).toBe(50);
      jest.advanceTimersByTime(1000);
      await cache3.garbageCollectorPromise;
      expect(cache3.size).toBe(0);

      done();
    });
  });
});
