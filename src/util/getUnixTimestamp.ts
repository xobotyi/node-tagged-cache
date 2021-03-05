import {isUndefined} from './isUndefined';

const hrtimeToTimestampOffset = Math.floor(Date.now() / 1000) - process.hrtime()[0];

export function getUnixTimestamp(referenceTimestamp?: number): number {
  return isUndefined(referenceTimestamp)
    ? hrtimeToTimestampOffset + process.hrtime()[0]
    : referenceTimestamp - hrtimeToTimestampOffset + process.hrtime()[0];
}
