import {Options, Suite} from 'benchmark';

export function getSuite(name: string, options: Options = {}): Suite {
  return new Suite(name, {
    onStart: (ev: any) => {
      console.log(String(ev.currentTarget.name));
    },
    onCycle: (ev: any) => {
      console.log(' ' + String(ev.target));
    },
    onComplete: (ev: any) => {
      console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
    },
    ...options,
  });
}
