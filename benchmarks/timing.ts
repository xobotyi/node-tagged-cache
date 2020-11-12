/* eslint-disable @typescript-eslint/no-explicit-any */
import {Suite} from 'benchmark';

const referenceDateNow = Math.floor(Date.now() / 1000);
const referenceHRTime = process.hrtime();
const referenceHRTimeBI = process.hrtime.bigint();

new Suite('Timing', {
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
  .add('#hrtime (indirect)', () => {
    const now = process.hrtime();
    now[0] - referenceHRTime[0];
  })
  .add('#hrtime (direct)', () => {
    process.hrtime(referenceHRTime)[0];
  })
  .add('#hrtime (bigint)', () => {
    const now = process.hrtime.bigint();
    (now - referenceHRTimeBI) / 1000000n;
  })
  .add('#Date.now', () => {
    const now = Math.floor(Date.now() / 1000);
    now - referenceDateNow;
  })
  .run();
