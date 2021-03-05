/* eslint-disable @typescript-eslint/no-explicit-any */
import {getSuite} from './util/getSuite';
import {runSuites} from './util/runSuites';

const set = new Set<string>();
const map = new Map<string, boolean>();
const obj = Object.create(null);

const keys = Array(10000)
  .fill(1)
  .map(() => String(Math.floor(Math.random() * 10000000)));
const keysAmount = keys.length;
let keysIndex = 0;

function getKey(): string {
  keysIndex = keysIndex++ % keysAmount;
  return keys[keysIndex];
}

(async () => {
  await runSuites([
    getSuite('Key store')
      .add('#Object', () => (obj[getKey()] = true))
      .add('#Set', () => set.add(getKey()))
      .add('#Map', () => map.set(getKey(), true)),

    getSuite('Key check')
      .add('#Object', () => typeof obj[getKey()] !== 'undefined')
      .add('#Set', () => set.has(getKey()))
      .add('#Map', () => map.has(getKey())),

    getSuite('Key delete')
      .add('#Object', () => delete obj[getKey()])
      .add('#Set', () => set.delete(getKey()))
      .add('#Map', () => map.delete(getKey())),

    getSuite('Key replace to the end')
      .add('#Object', () => {
        const key = getKey();
        delete obj[key];
        obj[key] = true;
      })
      .add('#Set', () => {
        const key = getKey();
        set.delete(key);
        set.add(key);
      })
      .add('#Map', () => {
        const key = getKey();
        map.delete(key);
        map.set(key, true);
      }),
  ]);
})();
