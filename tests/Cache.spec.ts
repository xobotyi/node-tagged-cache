jest.useFakeTimers();

import {Cache} from '../src';

describe('Cache', () => {
  it('should be defined', () => {
    expect(Cache).toBeDefined();
  });

  it('should be constructable via new', () => {
    const cache = new Cache();

    expect(cache instanceof Cache).toBe(true);
  });

  describe('finite capacity cache', () => {
    const cache = new Cache({capacity: 5, garbageCollectInterval: 0});

    it('.set should store value by key', () => {
      cache.set('someKey', 'someValue', 20);

      expect(cache.get('someKey')).toBe('someValue');
    });
  });
});
