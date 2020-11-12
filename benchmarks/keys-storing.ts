/* eslint-disable @typescript-eslint/no-explicit-any */
import {Suite} from 'benchmark';

const array: string[] = [];
const set = new Set<string>();
const map = new Map<string, boolean>();
const obj = Object.create(null);

function getStorageKey(): string {
  return `objectKey${Math.floor(Math.random() * 10000000)}`;
}

function getStorageKeyLowUnique(): string {
  return `objectKey${Math.floor(Math.random() * 100000)}`;
}

new Suite('Store', {
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
  .add('#Set', () => {
    set.add(getStorageKey());
  })
  .add('#Object', () => {
    obj[getStorageKey()] = true;
  })
  .add('#Map', () => {
    map.set(getStorageKey(), true);
  })
  .add('#Array', () => {
    array.push(getStorageKey());
  })
  .run();

new Suite('Has', {
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
  .add('#Set', () => {
    set.has(getStorageKeyLowUnique());
  })
  .add('#Object', () => {
    typeof obj[getStorageKeyLowUnique()] !== 'undefined';
  })
  .add('#Map', () => {
    map.has(getStorageKeyLowUnique());
  })
  .add('#Array', () => {
    array.indexOf(getStorageKeyLowUnique()) !== -1;
  })
  .run();

new Suite('Delete', {
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
  .add('#Set', () => {
    set.delete(getStorageKeyLowUnique());
  })
  .add('#Object', () => {
    delete obj[getStorageKeyLowUnique()];
  })
  .add('#Map', () => {
    map.delete(getStorageKeyLowUnique());
  })
  .add('#Array', () => {
    const idx = array.indexOf(getStorageKeyLowUnique());

    if (idx !== -1) {
      array.splice(idx, 1);
    }
  })
  .run();

new Suite('Rewrite', {
  onStart: (ev: any) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev: any) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev: any) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
    array.splice(0, array.length);
    set.clear();
  },
})
  .add('#Set', () => {
    const key = getStorageKeyLowUnique();
    set.delete(key);
    set.add(key);
  })
  .add('#Object', () => {
    const key = getStorageKeyLowUnique();
    delete obj[key];
    obj[key] = true;
  })
  .add('#Map', () => {
    const key = getStorageKeyLowUnique();
    map.delete(key);
    map.set(key, true);
  })
  .add('#Array', () => {
    const key = getStorageKeyLowUnique();
    const idx = array.indexOf(key);

    if (idx !== -1) {
      array.splice(idx, 1);
    }

    array.push(key);
  })
  .run();
