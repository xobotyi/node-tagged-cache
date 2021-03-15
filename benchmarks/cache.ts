import NodeCache from 'node-cache';
import LRU from 'lru-cache';
// eslint-disable-next-line node/no-unpublished-import
import {Cache, OldCache} from '../src';
import {mediumDataItem} from './fuxtures';
import {runSuites} from './util/runSuites';
import {getSuite} from './util/getSuite';
import {FIFOOverflowStrategy} from '../src/overflow-strategy/FIFOOverflowStrategy';

const storeVal = mediumDataItem;

const keys = Array(100000)
  .fill(1)
  .map(() => String(Math.floor(Math.random() * 10000000)));
const keysAmount = keys.length;
let keysIndex = 0;

function getKey(): string {
  keysIndex = keysIndex++ % keysAmount;
  return keys[keysIndex];
}

const nodeTaggedCache = new Cache({
  capacity: 10000,
  defaultTTL: 3600,
  deepCopy: false,
  shallowCopy: false,
});
const nodeTaggedCacheFIFO = new Cache({
  capacity: 10000,
  capacityOverflowStrategy: FIFOOverflowStrategy,
  defaultTTL: 3600,
  deepCopy: false,
  shallowCopy: false,
});
const nodeTaggedCacheOld = new OldCache({
  capacity: 10000,
  defaultTTL: 3600,
  clone: false,
});
const nodeCache = new NodeCache({
  maxKeys: 10000,
  stdTTL: 3600,
  useClones: false,
  deleteOnExpire: true,
});
const lruCache = new LRU({
  max: 10000,
  maxAge: 3600000,
});

(async () => {
  await runSuites([
    getSuite('set')
      .add('#node-tagged-cache (Old)', () => nodeTaggedCacheOld.set(getKey(), storeVal))
      .add('#node-tagged-cache', () => nodeTaggedCache.set(getKey(), storeVal))
      .add('#node-tagged-cache (fifo)', () => nodeTaggedCacheFIFO.set(getKey(), storeVal))
      .add('#node-cache', () => nodeCache.set(getKey(), storeVal))
      .add('#lru-cache', () => lruCache.set(getKey(), storeVal)),

    getSuite('get')
      .add('#node-tagged-cache (Old)', () => nodeTaggedCacheOld.get(getKey()))
      .add('#node-tagged-cache', () => nodeTaggedCache.get(getKey()))
      .add('#node-tagged-cache (fifo)', () => nodeTaggedCacheFIFO.get(getKey()))
      .add('#node-cache', () => nodeCache.get(getKey()))
      .add('#lru-cache', () => lruCache.get(getKey())),

    getSuite('has')
      .add('#node-tagged-cache (Old)', () => nodeTaggedCacheOld.has(getKey()))
      .add('#node-tagged-cache', () => nodeTaggedCache.has(getKey()))
      .add('#node-tagged-cache (fifo)', () => nodeTaggedCacheFIFO.has(getKey()))
      .add('#node-cache', () => nodeCache.has(getKey()))
      .add('#lru-cache', () => lruCache.has(getKey())),

    getSuite('delete')
      .add('#node-tagged-cache (Old)', () => nodeTaggedCacheOld.del(getKey()))
      .add('#node-tagged-cache', () => nodeTaggedCache.del(getKey()))
      .add('#node-tagged-cache (fifo)', () => nodeTaggedCacheFIFO.del(getKey()))
      .add('#node-cache', () => nodeCache.del(getKey()))
      .add('#lru-cache', () => lruCache.del(getKey())),
  ]);
})();
