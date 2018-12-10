const measurePerformance = require("./measurePerformance");
const TaggedCache = require("./../dist/TaggedCache").TaggedCache;

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
  taggedCache: {}
};

Promise.resolve()
  .then(() => {
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

    benchResults.taggedCache.set = measurePerformance.formatOPS(results);
    return cache;
  })
  .then(function taggedCacheMultiSet(cache) {
    process.stdout.write(`\rTaggedCache [multi-set]   `);
    const valuesToSet = generateKV(true);

    const results = measurePerformance(() => {
      cache.mset(valuesToSet, 2000000);
    });

    benchResults.taggedCache.mset = measurePerformance.formatOPS(results);

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

    benchResults.taggedCache.get = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiGet(cache) {
    process.stdout.write(`\rTaggedCache [multi-get]    `);
    const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mget(valuesToGet);
    });

    benchResults.taggedCache.mget = measurePerformance.formatOPS(results);
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

    benchResults.taggedCache.has = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(function taggedCacheMultiHas(cache) {
    process.stdout.write(`\rTaggedCache [multi-has]     `);
    const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

    const results = measurePerformance(() => {
      cache.mhas(valuesToCheck);
    });

    benchResults.taggedCache.mhas = measurePerformance.formatOPS(results);

    return cache;
  })
  .then(() => {
    process.stdout.write(`\r\n`);
    console.table(benchResults);
  });
