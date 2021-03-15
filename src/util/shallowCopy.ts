const {isArray} = Array;

export function shallowCopy<T>(o: T): T {
  if (typeof o !== 'object' || o === null) return o;
  if (o instanceof Date) return (new Date(o) as unknown) as T;
  if (isArray(o)) return ([...o] as unknown) as T;
  return {...o};
}
