import {Suite} from 'benchmark';

export async function runSuites(suites: Suite[], async = false): Promise<void> {
  if (async)
    for await (const suiteItem of suites) {
      await new Promise((resolve, reject) => {
        suiteItem
          .on('complete', resolve)
          .on('error', (ev: any) => {
            reject(ev.target.error);
          })
          .run({async: true});
      });
    }
  else {
    for (const suiteItem of suites) {
      suiteItem.run();
    }
  }
}
