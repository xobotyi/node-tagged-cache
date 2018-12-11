const measurePerformance = require("./measurePerformance");
const CacheBase = require("cache-base");
const NodeCache = require("node-cache");
const {
  disableTimestampCache,
  enableTimestampCache,
  TaggedCache
} = require("./../dist");

function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function populateTaggedCache() {
  const taggedCache = new TaggedCache();

  for (let i = 0; i < 100000; i++) {
    taggedCache.set("someKey" + i, "someVal" + i, 2000000, [
      "tag1",
      "tag2",
      "tag3"
    ]);
  }

  return taggedCache;
}

function populateNodeCache() {
  const cache = new NodeCache();

  for (let i = 0; i < 100000; i++) {
    cache.set("someKey" + i, "someVal" + i, 2000000);
  }

  return cache;
}

function populateCacheBase() {
  const cache = new CacheBase();

  for (let i = 0; i < 100000; i++) {
    cache.set("someKey" + i, "someVal" + i);
  }

  return cache;
}

const generateKV = (asObject = false) => {
  const res = asObject ? {} : [];

  for (let i = 0; i < 5; i++) {
    let num = rand(0, 100000);
    if (asObject) {
      res["someKey" + num] = "someValue" + num;
    } else {
      res.push(["someKey" + num, "someValue" + num]);
    }
  }

  return res;
};

const benchResults = {
  "Tagged Cache (w/o timestamp)": {},
  "Tagged Cache": {},
  "cache-base": {},
  "node-cache": {}
};

Promise.resolve()
  .then(() => {
    disableTimestampCache();
    return populateTaggedCache();
  })
  .then(function taggedCacheSet(cache) {
    process.stdout.write(`\rTaggedCache [set]         `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.set(pair[0], pair[1], 2000000);
      }
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].set = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheMultiSet(cache) {
    process.stdout.write(`\rTaggedCache [multi-set]   `);
    const valuesToSet = generateKV(true);

    const results = measurePerformance(() => {
      cache.mset(valuesToSet, 2000000);
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].mset = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheGet(cache) {
    process.stdout.write(`\rTaggedCache [get]         `);
    const valuesToGet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToGet) {
        cache.get(pair[0]);
      }
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].get = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiGet(cache) {
    process.stdout.write(`\rTaggedCache [multi-get]    `);
    const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mget(valuesToGet);
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].mget = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheHas(cache) {
    process.stdout.write(`\rTaggedCache [has]          `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.has(pair[0]);
      }
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].has = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiHas(cache) {
    process.stdout.write(`\rTaggedCache [multi-has]     `);
    const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mhas(valuesToCheck);
    });

    benchResults[
      "Tagged Cache (w/o timestamp)"
    ].mhas = measurePerformance.formatOPS(results);

    cache.flush();
  })
  .then(() => {
    enableTimestampCache();
    return populateTaggedCache();
  })
  .then(function taggedCacheSet(cache) {
    process.stdout.write(`\rTaggedCache [set]         `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.set(pair[0], pair[1], 2000000);
      }
    });

    benchResults["Tagged Cache"].set = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheMultiSet(cache) {
    process.stdout.write(`\rTaggedCache [multi-set]   `);
    const valuesToSet = generateKV(true);

    const results = measurePerformance(() => {
      cache.mset(valuesToSet, 2000000);
    });

    benchResults["Tagged Cache"].mset = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheGet(cache) {
    process.stdout.write(`\rTaggedCache [get]         `);
    const valuesToGet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToGet) {
        cache.get(pair[0]);
      }
    });

    benchResults["Tagged Cache"].get = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiGet(cache) {
    process.stdout.write(`\rTaggedCache [multi-get]    `);
    const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mget(valuesToGet);
    });

    benchResults["Tagged Cache"].mget = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheHas(cache) {
    process.stdout.write(`\rTaggedCache [has]          `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.has(pair[0]);
      }
    });

    benchResults["Tagged Cache"].has = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiHas(cache) {
    process.stdout.write(`\rTaggedCache [multi-has]     `);
    const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mhas(valuesToCheck);
    });

    benchResults["Tagged Cache"].mhas = measurePerformance.formatOPS(results);

    disableTimestampCache();
    cache.flush();
  })
  .then(() => {
    return populateNodeCache();
  })
  .then(function taggedCacheSet(cache) {
    process.stdout.write(`\rnode-cache [set]         `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.set(pair[0], pair[1], 2000000);
      }
    });

    benchResults["node-cache"].set = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheMultiSet(cache) {
    benchResults["node-cache"].mset = "none";

    return cache;
  })
  .then(function taggedCacheGet(cache) {
    process.stdout.write(`\rnode-cache [get]         `);
    const valuesToGet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToGet) {
        cache.get(pair[0]);
      }
    });

    benchResults["node-cache"].get = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiGet(cache) {
    process.stdout.write(`\rnode-cache [multi-get]    `);
    const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mget(valuesToGet);
    });

    benchResults["node-cache"].mget = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheHas(cache) {
    benchResults["node-cache"].has = "none";

    return cache;
  })
  .then(function taggedCacheMultiHas(cache) {
    benchResults["node-cache"].mhas = "none";

    return cache;
  })
  .then(() => {
    return populateCacheBase();
  })
  .then(function taggedCacheSet(cache) {
    process.stdout.write(`\rcache-base [set]         `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.set(pair[0], pair[1]);
      }
    });

    benchResults["cache-base"].set = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheMultiSet(cache) {
    benchResults["cache-base"].mset = "none";

    return cache;
  })
  .then(function taggedCacheGet(cache) {
    process.stdout.write(`\rcache-base [get]         `);
    const valuesToGet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToGet) {
        cache.get(pair[0]);
      }
    });

    benchResults["cache-base"].get = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiGet(cache) {
    benchResults["cache-base"].mget = "none";
    return cache;
  })
  .then(function taggedCacheHas(cache) {
    process.stdout.write(`\rcache-base [has]          `);
    const valuesToSet = generateKV();

    const results = measurePerformance(() => {
      for (let pair of valuesToSet) {
        cache.has(pair[0]);
      }
    });

    benchResults["node-cache"].has = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiHas(cache) {
    benchResults["node-cache"].mhas = "none";

    return cache;
  })
  .then(() => {
    process.stdout.write(`\r\n`);
    console.table(benchResults);
  });
