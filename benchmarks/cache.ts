import {Suite} from 'benchmark';
import NodeCache from 'node-cache';
import {Cache} from '../src';
import {mediumDataItem} from './fuxtures';

const storeVal = mediumDataItem;

let i = 0;
const keysPool = ['qui', 'id', 'eu', 'labore', 'dolor', 'in', 'minim'];

const nodeTaggedCache = new Cache({
  capacity: Infinity,
  defaultTTL: 3600,
  clone: true,
});
const nodeCache = new NodeCache({
  maxKeys: -1,
  stdTTL: 3600,
  useClones: true,
  deleteOnExpire: true,
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
    nodeTaggedCache.set(keysPool[i++ % 7], storeVal);
  })
  .add('#node-cache', () => {
    nodeCache.set(keysPool[i++ % 7], storeVal);
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
      {key: keysPool[i++ % 7], value: storeVal},
      {key: keysPool[i++ % 7], value: storeVal},
      {key: keysPool[i++ % 7], value: storeVal},
      {key: keysPool[i++ % 7], value: storeVal},
    ]);
  })
  .add('#node-cache', () => {
    nodeCache.mset([
      {key: keysPool[i++ % 7], val: storeVal},
      {key: keysPool[i++ % 7], val: storeVal},
      {key: keysPool[i++ % 7], val: storeVal},
      {key: keysPool[i++ % 7], val: storeVal},
    ]);
  })
  .add('#node-tagged-cache (consequtive calls)', () => {
    nodeTaggedCache.set(keysPool[i++ % 7], storeVal);
    nodeTaggedCache.set(keysPool[i++ % 7], storeVal);
    nodeTaggedCache.set(keysPool[i++ % 7], storeVal);
    nodeTaggedCache.set(keysPool[i++ % 7], storeVal);
  })
  .add('#node-cache (consequtive calls)', () => {
    nodeCache.set(keysPool[i++ % 7], storeVal);
    nodeCache.set(keysPool[i++ % 7], storeVal);
    nodeCache.set(keysPool[i++ % 7], storeVal);
    nodeCache.set(keysPool[i++ % 7], storeVal);
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
  .add('#node-tagged-cache', () => {
    nodeTaggedCache.get(keysPool[i++ % 7]);
    nodeTaggedCache.get('someNonexistentKey');
  })
  .add('#node-cache', () => {
    nodeCache.get(keysPool[i++ % 7]);
    nodeCache.get('someNonexistentKey');
  })
  .run();

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
    nodeTaggedCache.mget([
      keysPool[i++ % 7],
      keysPool[i++ % 7],
      'someNonexistentKey',
      keysPool[i++ % 7],
      keysPool[i++ % 7],
    ]);
  })
  .add('#node-cache', () => {
    nodeCache.mget([
      keysPool[i++ % 7],
      keysPool[i++ % 7],
      'someNonexistentKey',
      keysPool[i++ % 7],
      keysPool[i++ % 7],
    ]);
  })
  .add('#node-tagged-cache (consequtive calls)', () => {
    nodeTaggedCache.get(keysPool[i++ % 7]);
    nodeTaggedCache.get(keysPool[i++ % 7]);
    nodeTaggedCache.get('someNonexistentKey');
    nodeTaggedCache.get(keysPool[i++ % 7]);
    nodeTaggedCache.get(keysPool[i++ % 7]);
  })
  .add('#node-cache (consequtive calls)', () => {
    nodeCache.get(keysPool[i++ % 7]);
    nodeCache.get(keysPool[i++ % 7]);
    nodeCache.get('someNonexistentKey');
    nodeCache.get(keysPool[i++ % 7]);
    nodeCache.get(keysPool[i++ % 7]);
  })
  .run();
