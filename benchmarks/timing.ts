import { Suite } from 'benchmark';

const referenceDateNow = Math.floor(Date.now() / 1000);
const referenceHRTime = process.hrtime();
const referenceHRTimeBI = process.hrtime.bigint();

new Suite('Timing', {
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
  .add('#hrtime (indirect)', () => {
    const now = process.hrtime();
    const sec = now[0] - referenceHRTime[0];
  })
  .add('#hrtime (direct)', () => {
    const sec = process.hrtime(referenceHRTime)[0];
  })
  .add('#hrtime (bigint)', () => {
    const now = process.hrtime.bigint();
    const sec = (now - referenceHRTimeBI) / 1000000n;
  })
  .add('#Date.now', () => {
    const now = Math.floor(Date.now() / 1000);
    const sec = now - referenceDateNow;
  })
  .run();
