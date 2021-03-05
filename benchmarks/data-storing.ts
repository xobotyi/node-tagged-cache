/* eslint-disable @typescript-eslint/no-explicit-any */
import v8 from 'v8';
import clone from 'clone';
import cloneDeep from 'clone-deep';
import rfdc from 'rfdc';
import {getSuite} from './util/getSuite';
import {runSuites} from './util/runSuites';
import {mediumDataItem} from './fuxtures';

const rfdcProto = rfdc({proto: true, circles: false});
const rfdcNoProto = rfdc({proto: false, circles: false});

const v8serialized = v8.serialize(mediumDataItem);
const jsonStringified = JSON.stringify(mediumDataItem);

(async () => {
  await runSuites([
    getSuite('Store data')
      .add('#v8.serialize', async () => v8.serialize(mediumDataItem))
      .add('#JSON.stringify', async () => JSON.stringify(mediumDataItem))
      .add('#clone', async () => clone(mediumDataItem))
      .add('#clone-deep', async () => cloneDeep(mediumDataItem))
      .add('#rfdc no proto', async () => rfdcNoProto(mediumDataItem))
      .add('#rfdc proto', async () => rfdcProto(mediumDataItem))
      .add('#Object.assign', async () => Object.assign({}, mediumDataItem))
      .add('#Object spread', async () => ({...mediumDataItem})),

    getSuite('Fetch data')
      .add('#v8.deserialize', async () => v8.deserialize(v8serialized))
      .add('#JSON.stringify', async () => JSON.parse(jsonStringified))
      .add('#clone', async () => clone(mediumDataItem))
      .add('#clone-deep', async () => cloneDeep(mediumDataItem))
      .add('#rfdc no proto', async () => rfdcNoProto(mediumDataItem))
      .add('#rfdc proto', async () => rfdcProto(mediumDataItem))
      .add('#Object.assign', async () => Object.assign({}, mediumDataItem))
      .add('#Object spread', async () => ({...mediumDataItem})),
  ]);
})();
