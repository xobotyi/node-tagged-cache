import {ICacheOverflowStrategy} from '../types';
import {LinkedMap} from '../linked-map/LinkedMap';

export class LRUOverflowStrategy implements ICacheOverflowStrategy {
  private readonly lmap: LinkedMap<boolean>;
  private readonly capacity: number;
  private readonly removeCacheEntry: (key: string) => boolean;

  constructor(capacity = 1000, removeCacheEntry: (key: string) => boolean) {
    this.lmap = new LinkedMap();
    this.capacity = capacity;
    this.removeCacheEntry = removeCacheEntry;
  }

  onGet = (key: string): void => {
    this.lmap.set(key, true);
  };

  onSet = (key: string): void => {
    this.lmap.set(key, true);

    const overflow = this.lmap.size - this.capacity;

    if (overflow > 0) {
      this.lmap.shrinkHead(overflow).map((key) => this.removeCacheEntry(key));
    }
  };

  onDelete = (key: string): void => {
    this.lmap.remove(key);
  };
}
