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
>Note: **this module does not clone stored arrays/objects and operates only with their refs.**

### Performance
As the entries store `node-tagged-cache` uses [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) due to it's total overperforming regular objects.
All below performance tests made on Win10, Intel I7 5820K, 16GB DDR4 RAM.  
All numbers are OPS (operations per second).  
500000 rounds peer test.  

storage | set | get | check | delete
--------|-----|-----|-------|-------
obj | 3,846,153 | 12,820,512 | 14,285,714 | 11,111,111
objV2 | 4,237,288 | 13,888,888 | 14,285,714 | 15,151,515
map | 3,816,793 | 55,555,555 | 50,000,000 | 7,246,376

The other thing that appeared to be a real showstopper in terms of performance - `Date.now()` calls, which been used in cache itself and in cache controller. So intermediate timestamp cache was implemented, performance impact of which you can see below.  
And, furthermore, below you can see  performance comparision with two most popular caching libs i know about.
>Note: node-cache is in `useClones: false,` mode, but cache-base always copies it's values;

module | set | mset | get | mget | has | mhas
-------|-----|------|-----|------|-----|-----
Tagged OldCache (w/o timestamp) (w/o tags) | 1,179,245 | 2,463,054 | 1,510,574 | 2,717,391 | 1,533,742 | 2,392,344 
Tagged OldCache (w/o timestamp) | 1,302,083 | 2,392,344 | 1,146,788 | 1,298,701 | 1,070,663 | 1,388,888
Tagged OldCache (w/o tags) | 2,631,578 | 3,333,333 | 5,208,333 | 2,906,976 | 5,494,505 | 3,355,704
Tagged OldCache | 2,976,190 | 3,378,378 | 1,845,018 | 1,436,781 | 1,976,284 | 1,529,051
node-cache | 284,900 | none | 1,312,335 | 1,098,901 | none | none
cache-base | 507,614 | none | 892,857 | none | 5,319,148 | none
 

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
