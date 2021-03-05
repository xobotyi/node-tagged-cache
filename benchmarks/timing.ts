// eslint-disable-next-line node/no-unpublished-import
import {getUnixTimestamp} from '../src/util/getUnixTimestamp';
import {getSuite} from './util/getSuite';

const referenceDateNow = Math.floor(Date.now() / 1000);
const referenceHRTime = process.hrtime();
const referenceHRTimeBI = process.hrtime.bigint();
const referenceTimestamp = getUnixTimestamp();

getSuite('Time stamp distance')
  .add('#hrtime (indirect)', () => process.hrtime()[0] - referenceHRTime[0])
  .add('#hrtime (direct)', () => process.hrtime(referenceHRTime)[0])
  .add('#hrtime (bigint)', () => (process.hrtime.bigint() - referenceHRTimeBI) / 1000000n)
  .add('#Date.now', () => Math.floor(Date.now() / 1000) - referenceDateNow)
  .add('#getUnixTimestamp', () => getUnixTimestamp() - referenceTimestamp)
  .run();
