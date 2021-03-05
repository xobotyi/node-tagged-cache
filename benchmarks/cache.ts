import {Suite} from 'benchmark';
import NodeCache from 'node-cache';
import LRU from 'lru-cache';
// eslint-disable-next-line node/no-unpublished-import
import {Cache} from '../src';
import {mediumDataItem} from './fuxtures';

const storeVal = mediumDataItem;

const keys = Array(10000)
  .fill(1)
  .map(() => String(Math.floor(Math.random() * 10000000)));
const keysAmount = keys.length;
let keysIndex = 0;

function getKey(): string {
  keysIndex = keysIndex++ % keysAmount;
  return keys[keysIndex];
}

const nodeTaggedCache = new Cache({
  capacity: 1000,
  defaultTTL: 3600,
  clone: false,
});
const nodeCache = new NodeCache({
  maxKeys: 1000,
  stdTTL: 3600,
  useClones: false,
  deleteOnExpire: true,
});
const lruCache = new LRU({
  max: 1000,
  maxAge: 3600000,
});

new Suite('set', {
  onStart: (ev: any) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev: any) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev: any) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#node-tagged-cache', () => {
    nodeTaggedCache.set(getKey(), storeVal);
  })
  .add('#node-cache', () => {
    nodeCache.set(getKey(), storeVal);
  })
  .add('#lru-cache', () => {
    lruCache.set(getKey(), storeVal);
  })
  .run();

new Suite('mset', {
  onStart: (ev: any) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev: any) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev: any) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#node-tagged-cache', () => {
    nodeTaggedCache.mset([
      {key: getKey(), value: storeVal},
      {key: getKey(), value: storeVal},
      {key: getKey(), value: storeVal},
      {key: getKey(), value: storeVal},
    ]);
  })
  .add('#node-cache', () => {
    nodeCache.mset([
      {key: getKey(), val: storeVal},
      {key: getKey(), val: storeVal},
      {key: getKey(), val: storeVal},
      {key: getKey(), val: storeVal},
    ]);
  })
  .add('#node-tagged-cache (consequtive calls)', () => {
    nodeTaggedCache.set(getKey(), storeVal);
    nodeTaggedCache.set(getKey(), storeVal);
    nodeTaggedCache.set(getKey(), storeVal);
    nodeTaggedCache.set(getKey(), storeVal);
  })
  .add('#node-cache (consequtive calls)', () => {
    nodeCache.set(getKey(), storeVal);
    nodeCache.set(getKey(), storeVal);
    nodeCache.set(getKey(), storeVal);
    nodeCache.set(getKey(), storeVal);
  })
  .add('#lru-cache (consequtive calls)', () => {
    lruCache.set(getKey(), storeVal);
    lruCache.set(getKey(), storeVal);
    lruCache.set(getKey(), storeVal);
    lruCache.set(getKey(), storeVal);
  })
  .run();

new Suite('get', {
  onStart: (ev: any) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev: any) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev: any) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#node-tagged-cache', async () => {
    nodeTaggedCache.get(getKey());
    nodeTaggedCache.get('someNonexistentKey');
  })
  .add('#node-cache', async () => {
    nodeCache.get(getKey());
    nodeCache.get('someNonexistentKey');
  })
  .add('#lru-cache', async () => {
    lruCache.get(getKey());
    lruCache.get('someNonexistentKey');
  })
  .run({async: true});

new Suite('mget', {
  onStart: (ev: any) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev: any) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev: any) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#node-tagged-cache', () => {
    nodeTaggedCache.mget([getKey(), getKey(), 'someNonexistentKey', getKey(), getKey()]);
  })
  .add('#node-cache', () => {
    nodeCache.mget([getKey(), getKey(), 'someNonexistentKey', getKey(), getKey()]);
  })
  .add('#node-tagged-cache (consequtive calls)', () => {
    nodeTaggedCache.get(getKey());
    nodeTaggedCache.get(getKey());
    nodeTaggedCache.get('someNonexistentKey');
    nodeTaggedCache.get(getKey());
    nodeTaggedCache.get(getKey());
  })
  .add('#node-cache (consequtive calls)', () => {
    nodeCache.get(getKey());
    nodeCache.get(getKey());
    nodeCache.get('someNonexistentKey');
    nodeCache.get(getKey());
    nodeCache.get(getKey());
  })
  .add('#node-cache (consequtive calls)', () => {
    lruCache.get(getKey());
    lruCache.get(getKey());
    lruCache.get('someNonexistentKey');
    lruCache.get(getKey());
    lruCache.get(getKey());
  })
  .run();
