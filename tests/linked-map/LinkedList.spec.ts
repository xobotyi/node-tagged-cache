import {LinkedList} from '../../src/linked-map/LinkedList';

describe('LinkedList', () => {
  it('should be defined', () => {
    expect(LinkedList).toBeDefined();
  });

  const list = new LinkedList();

  afterEach(() => {
    list.shrinkTail(list.length);
  });
  describe('.shrinkTail', () => {
    it('should remove given amount of items from the tail', () => {
      list.push('node1');
      list.push('node1');
      list.push('node1');
      list.shrinkTail(1);

      expect(list.length).toBe(2);

      list.shrinkTail(list.length);

      expect(list.length).toBe(0);
    });

    it('should unset head and tail links properly', () => {
      const node1 = list.push('node1');
      const node2 = list.push('node1');
      const node3 = list.push('node1');

      expect(list.tail).toBe(node3);
      expect(list.head).toBe(node1);

      list.shrinkTail(1);
      expect(list.tail).toBe(node2);
      expect(list.head).toBe(node1);

      list.shrinkTail(1);
      expect(list.tail).toBe(node1);
      expect(list.head).toBe(node1);

      list.shrinkTail(1);
      expect(list.tail).toBe(null);
      expect(list.head).toBe(null);
    });
  });

  describe('.push', () => {
    it('should add first element both to the head and to the tail', () => {
      const node = list.push('node1');

      expect(list.head).toBe(node);
      expect(list.tail).toBe(node);
    });

    it('should increase list length after each call', () => {
      list.push('node1');
      list.push('node1');

      expect(list.length).toBe(2);

      list.push('node1');

      expect(list.length).toBe(3);
    });
  });

  describe('.pushNode', () => {
    it('should not push nodes from foreign lists', () => {
      list.push('node2');
      const list2 = new LinkedList();
      const node = list2.push('node');
      expect(() => list.pushNode(node)).toThrow(
        new Error('Unable to push the node of foreign list'),
      );
    });

    it('properly assign next and prev values for each list item', () => {
      const node1 = list.push('node1');

      expect(node1.value).toBe('node1');
      expect(node1.next).toBe(null);
      expect(node1.prev).toBe(null);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node1);

      const node2 = list.push('node2');
      expect(node2.value).toBe('node2');
      expect(node1.next).toBe(node2);
      expect(node1.prev).toBe(null);
      expect(node2.next).toBe(null);
      expect(node2.prev).toBe(node1);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);

      const node3 = list.push('node3');
      expect(node3.value).toBe('node3');
      expect(node2.next).toBe(node3);
      expect(node2.prev).toBe(node1);
      expect(node3.next).toBe(null);
      expect(node3.prev).toBe(node2);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node3);
    });
  });

  describe('.removeNode', () => {
    it('should not remove nodes from foreign lists', () => {
      list.push('node2');
      const list2 = new LinkedList();
      const node = list2.push('node');
      expect(() => list.removeNode(node)).toThrow(
        new Error('Unable to remove the node of foreign list'),
      );
    });

    it('should remove given node and return next node', () => {
      const node1 = list.push('node1');
      const node2 = list.push('node2');

      expect(list.removeNode(node1)).toBe(node2);
      expect(list.removeNode(node2)).toBe(null);
    });

    it('should set next node for prev node and vice-versa', () => {
      const node1 = list.push('node1');
      const node2 = list.push('node2');
      const node3 = list.push('node3');

      expect(list.removeNode(node2)).toBe(node3);
      expect(node3.prev).toBe(node1);
      expect(node1.next).toBe(node3);
    });
  });
});
