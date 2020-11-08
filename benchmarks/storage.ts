import { Suite } from 'benchmark';

const obj1 = {};
const obj2 = Object.create(null);
const map = new Map();

const storeVal = 'Voluptate nostrud aliqua ex veniam occaecat amet amet duis ullamco ex ea nostrud culpa sint. Est magna est labore eiusmod sit magna velit id pariatur. Exercitation minim est duis duis pariatur et. Commodo magna culpa eiusmod tempor enim. Cupidatat et dolor voluptate laborum veniam. Irure sint exercitation dolor quis mollit dolor commodo exercitation consequat. Ea nostrud irure irure eiusmod voluptate.\r\n';

function getStorageKey(): string {
  return `objectKey${Math.floor(Math.random() * 10000001)}`;
}

new Suite('storage set', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#object (regular)', () => {
    obj1[getStorageKey()] = storeVal;
  })
  .add('#object (no proto)', () => {
    obj2[getStorageKey()] = storeVal;
  })
  .add('#Map', () => {
    map.set(getStorageKey(), storeVal);
  })
  .run();

new Suite('storage get', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#object (regular)', () => {
    const val = obj1[getStorageKey()];
  })
  .add('#object (no proto)', () => {
    const val = obj2[getStorageKey()];
  })
  .add('#Map', () => {
    const val = map.get(getStorageKey());
  })
  .run();

new Suite('storage delete', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#object (regular)', () => {
    delete obj1[getStorageKey()];
  })
  .add('#object (no proto)', () => {
    delete obj2[getStorageKey()];
  })
  .add('#Map', () => {
    map.delete(getStorageKey());
  })
  .run();

new Suite('storage has', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#object (regular)', () => {
    const res = typeof obj1[getStorageKey()] !== 'undefined';
  })
  .add('#object (no proto)', () => {
    const res = typeof obj2[getStorageKey()] !== 'undefined';
  })
  .add('#Map', () => {
    const res = map.has(getStorageKey());
  })
  .run();
