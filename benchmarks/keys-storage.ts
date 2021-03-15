/* eslint-disable @typescript-eslint/no-explicit-any */
import {getSuite} from './util/getSuite';
import {runSuites} from './util/runSuites';
// eslint-disable-next-line node/no-unpublished-import
import {LinkedMap} from '../src/linked-map/LinkedMap';

const set = new Set<string>();
const map = new Map<string, boolean>();
const obj = Object.create(null);
const lmap = new LinkedMap();

const setAddAsync = async (key: string) => set.add(key);
const setHasAsync = async (key: string) => set.has(key);
const setReplaceAsync = async (key: string) => {
  set.delete(key);
  set.add(key);
};

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
  await runSuites(
    [
      getSuite('Key store')
        .add('#Object', () => (obj[getKey()] = true))
        .add('#Set', () => set.add(getKey()))
        .add('#Set async', () => setAddAsync(getKey()))
        .add('#Map', () => map.set(getKey(), true))
        .add('#LinkedMap', () => {
          lmap.set(getKey(), true);
        }),

      getSuite('Key check')
        .add('#Object', () => typeof obj[getKey()] !== 'undefined')
        .add('#Set', () => set.has(getKey()))
        .add('#Set async', () => setHasAsync(getKey()))
        .add('#Map', () => map.has(getKey()))
        .add('#Linked-Map', () => lmap.has(getKey())),

      getSuite('Key move to the end')
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
        .add('#Set async', () => setReplaceAsync(getKey()))
        .add('#Map', () => {
          const key = getKey();
          map.delete(key);
          map.set(key, true);
        })
        .add('#Linked-Map', () => {
          lmap.set(getKey(), true);
        }),

      getSuite('Key delete')
        .add('#Object', () => delete obj[getKey()])
        .add('#Set', () => set.delete(getKey()))
        .add('#Set async', () => setReplaceAsync(getKey()))
        .add('#Map', () => map.delete(getKey()))
        .add('#Linked-Map', () => lmap.remove(getKey())),
    ],
    true,
  );
})();
