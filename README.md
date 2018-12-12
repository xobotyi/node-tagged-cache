<h1 align="center">node-tagged-cache</h1>
<p align="center">
<a href="https://www.npmjs.com/package/node-tagged-cache"><img src="https://img.shields.io/badge/npm-node--tagged--cache-brightgreen.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/node-tagged-cache"><img src="https://img.shields.io/npm/v/node-tagged-cache.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/node-tagged-cache"><img src="https://img.shields.io/travis/xobotyi/node-tagged-cache.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/node-tagged-cache"><img src="https://img.shields.io/npm/l/node-tagged-cache.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/node-tagged-cache"><img src="https://img.shields.io/npm/dt/node-tagged-cache.svg?style=flat-square"></a>
</p>

### Fast NodeJS in-memory caching with tagging
Probably the fastest NodeJS caching system yet.  
It is much like memcached or redis but provides you with ability to set tags for cache entries and drop them all together when you need it.  

### Performance
As the entries store `node-tagged-cache` uses [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) due to it's total overperforming regular objects.
All below performance tests made on Win10, Intel I7 5820K, 16GB DDR4 RAM, all numbers are OPS (operations per second)

storage | set | get | check | delete
--------|-----|-----|-------|-------
obj | 3,846,153 | 12,820,512 | 14,285,714 | 11,111,111
objV2 | 4,237,288 | 13,888,888 | 14,285,714 | 15,151,515
map | 3,816,793 | 55,555,555 | 50,000,000 | 7,246,376

The other thing that appeared to be a real showstopper in terms of performance - `Date.now()` calls.

You can simply run performance tests on your own machine.
```bash
node benchmarks/storage.js
node benchmarks/cache.js
```

### Install
```bash
npm i node-tagged-cache
```

### Usage
```javascript
import TaggedCache, {enableTimestampCache, disableTimestampCache} from "node-tagged-cache";
// default module's export is already created instance of cache with default options
// {
//  defaultTTL: 600000, // 10m
//  cleanupInterval: 60000, // 1m
// }

enableTimestampCache(); // this is not straight requirement but needed for performance improvement
                        // read more about timestamp caching below

TaggedCache.mset({
                    foo: "bar",
                    baz: "bax"
                },
                3600000, // 1h
                ["awesomeTag", "moreAwesomeTag"]);
TaggedCache.mget(["foo", "baz"]); // { foo: "bar", baz: "bax" }

TaggedCache.tags.drop("awesomeTag");
TaggedCache.mhas(["foo", "baz"]); // { foo: false, baz: false }

disableTimestampCache(); // before the script should exit;
```
