const hrtimeToTimestampOffset = Math.floor(Date.now() / 1000) - process.hrtime()[0];

export function getUnixTimestamp(): number {
  return hrtimeToTimestampOffset + process.hrtime()[0];
}
