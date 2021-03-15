import {getUnixTimestamp} from '../../src/util/getUnixTimestamp';

describe('getUnixTimestamp', () => {
  it('should be defined', () => {
    expect(getUnixTimestamp).toBeDefined();
  });

  it('should return number', () => {
    expect(typeof getUnixTimestamp()).toBe('number');
  });

  it('should return current timestamp in seconds', () => {
    expect(getUnixTimestamp()).toBe(Math.floor(Date.now() / 1000));
  });
});
