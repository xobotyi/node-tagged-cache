import {getSuite} from './util/getSuite';
import {runSuites} from './util/runSuites';

(async () => {
  const obj1 = {} as {[key: string]: string};
  const obj2 = Object.create(null);
  const map = new Map();

  const fn = async (key: string) => map.get(key);
  const fn2 = async (key: string) => obj2[key];

  const storeVal =
    'Voluptate nostrud aliqua ex veniam occaecat amet amet duis ullamco ex ea nostrud culpa sint. Est magna est labore eiusmod sit magna velit id pariatur. Exercitation minim est duis duis pariatur et. Commodo magna culpa eiusmod tempor enim. Cupidatat et dolor voluptate laborum veniam. Irure sint exercitation dolor quis mollit dolor commodo exercitation consequat. Ea nostrud irure irure eiusmod voluptate.\r\n';

  function getStorageKey(): string {
    return `objectKey${Math.floor(Math.random() * 10000001)}`;
  }

  await runSuites(
    [
      getSuite('set')
        .add('#object (regular)', () => (obj1[getStorageKey()] = storeVal))
        .add('#object (no proto)', () => (obj2[getStorageKey()] = storeVal))
        .add('#Map', () => map.set(getStorageKey(), storeVal)),

      getSuite('get')
        .add('#object (regular)', () => obj1[getStorageKey()])
        .add('#object (no proto)', () => obj2[getStorageKey()])
        .add('#Map', () => map.get(getStorageKey()))
        .add('#fn', () => fn(getStorageKey()))
        .add('#fn2', () => fn2(getStorageKey())),

      getSuite('has')
        .add('#object (regular)', () => typeof obj1[getStorageKey()] !== 'undefined')
        .add('#object (no proto)', () => typeof obj2[getStorageKey()] !== 'undefined')
        .add('#Map', () => map.has(getStorageKey())),

      getSuite('delete')
        .add('#object (regular)', () => delete obj1[getStorageKey()])
        .add('#object (no proto)', () => delete obj2[getStorageKey()])
        .add('#Map', () => map.delete(getStorageKey())),
    ],
    true,
  );
})();
