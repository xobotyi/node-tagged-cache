// If you need to build a caching system with performance up to 2m ops - you have to cache damned Date.now()
// because it has appeared a real showstopper.
//
// Even caching for 100ms brought 10x speedup but added the need to stop the sync process manually
// or script will never exit itself.
//
// I don't see any obvious reason to make a ttl < 1s, but it is still configurable if needed.

import Timeout = NodeJS.Timeout;

export default function(): number {
  return _timestampSyncEnabled ? _timestamp : Date.now();
}

let _timestamp: number = 0;
let _timestampSyncInterval: number = 1000;
let _timestampSyncEnabled: boolean = true;
let _timestampSyncTimeout: Timeout | undefined;

function timestampSync() {
  _timestamp = Date.now();
  if (_timestampSyncEnabled) {
    _timestampSyncTimeout = setTimeout(timestampSync, _timestampSyncInterval);
  }
}

timestampSync();

export function stopTimestampSync() {
  if (!_timestampSyncEnabled) {
    return;
  }

  _timestampSyncEnabled = false;
  _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);
  _timestampSyncTimeout = undefined;
}

export function startTimestampSync() {
  if (_timestampSyncEnabled) {
    return;
  }

  _timestampSyncEnabled = true;
  _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);

  timestampSync();
}

export function setTimestampSyncInterval(interval: number) {
  if (interval <= 0) {
    throw new Error("interval has to be greater than 0");
  }

  if (interval === _timestampSyncInterval || !_timestampSyncEnabled) {
    return;
  }

  _timestampSyncInterval = interval;
  _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);
  timestampSync();
}
