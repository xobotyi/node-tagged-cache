import {ILinkedListNode, LinkedList} from './LinkedList';

export class LinkedMap<V = any> {
  private readonly map: Map<string, ILinkedListNode<{key: string; value: V}>>;
  private readonly list: LinkedList<{key: string; value: V}>;

  constructor() {
    this.map = new Map();
    this.list = new LinkedList();
  }

  get size() {
    return this.map.size;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  set(key: string, value: V): boolean {
    if (this.map.has(key)) {
      this.list.pushNode(this.map.get(key)!);

      return false;
    }

    this.map.set(key, this.list.push({key, value}));

    return true;
  }

  remove(key: string): boolean {
    if (!!this.map.size && this.map.has(key)) {
      this.list.removeNode(this.map.get(key)!);
      this.map.delete(key);

      return true;
    }

    return false;
  }

  shrinkHead(count: number): string[] {
    const keys: string[] = [];

    for (const {key} of this.list.shrinkHead(count)) {
      this.map.delete(key);
      keys.push(key);
    }

    return keys;
  }

  shrinkTail(count: number): string[] {
    const keys: string[] = [];

    for (const {key} of this.list.shrinkTail(count)) {
      this.map.delete(key);
      keys.push(key);
    }

    return keys;
  }
}
