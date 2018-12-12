const measurePerformance = require("./measurePerformance");
const CacheBase = require("cache-base");
const NodeCache = require("node-cache");
const {disableTimestampCache, enableTimestampCache, TaggedCache} = require("./../dist");

const testValue = {
    _id: "5c116ead24732fff90b21d03",
    index: 0,
    guid: "ca353682-6dcd-4a90-8ec7-654f373f9d70",
    isActive: true,
    balance: "$3,868.24",
    picture: "http://placehold.it/32x32",
    age: 30,
    eyeColor: "green",
    name: {
        first: "Teresa",
        last: "Robles",
    },
    company: "PHORMULA",
    email: "teresa.robles@phormula.us",
    phone: "+1 (926) 593-2411",
    address: "149 Schaefer Street, Lindisfarne, New Mexico, 9175",
    about:
        "Do eu dolore adipisicing ullamco nostrud. Quis excepteur excepteur reprehenderit in ipsum dolor et veniam incididunt Lorem ad occaecat ea laboris. Nulla ex adipisicing nisi fugiat aute laboris cillum nisi est anim. Velit non amet pariatur aliquip eiusmod eu officia do qui Lorem.",
    registered: "Wednesday, April 26, 2017 12:28 AM",
    latitude: 21.927994,
    longitude: 69.491456,
    tags: ["dolor", "officia", "dolore", "eiusmod", "dolore"],
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    friends: [
        {
            id: 0,
            name: "Doyle Patton",
        },
        {
            id: 1,
            name: "Alana Rowe",
        },
        {
            id: 2,
            name: "Dollie Velasquez",
        },
    ],
    greeting: "Hello, Teresa! You have 10 unread messages.",
    favoriteFruit: "apple",
};

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function populateTaggedCache(tags = false) {
    const taggedCache = new TaggedCache();

    for (let i = 0; i < 100000; i++) {
        tags
            ? taggedCache.set("someKey" + i, testValue, 2000000, ["tag1", "tag2", "tag3"])
            : taggedCache.set("someKey" + i, testValue, 2000000);
    }

    return taggedCache;
}

function populateNodeCache() {
    const cache = new NodeCache({
        useClones: false,
    });

    for (let i = 0; i < 100000; i++) {
        cache.set("someKey" + i, testValue, 2000000);
    }

    return cache;
}

function populateCacheBase() {
    const cache = new CacheBase();

    for (let i = 0; i < 100000; i++) {
        cache.set("someKey" + i, testValue);
    }

    return cache;
}

const generateKV = (asObject = false) => {
    const res = asObject ? {} : [];

    for (let i = 0; i < 5; i++) {
        let num = rand(0, 100000);
        if (asObject) {
            res["someKey" + num] = testValue;
        } else {
            res.push(["someKey" + num, testValue]);
        }
    }

    return res;
};

const benchResults = {
    "Tagged Cache (w/o timestamp) (w/o tags)": {},
    "Tagged Cache (w/o timestamp)": {},
    "Tagged Cache (w/o tags)": {},
    "Tagged Cache": {},
    "node-cache": {},
    "cache-base": {},
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

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].set = measurePerformance.formatOPS(results);
        return cache;
    })
    .then(function taggedCacheMultiSet(cache) {
        process.stdout.write(`\rTaggedCache [multi-set]   `);
        const valuesToSet = generateKV(true);

        const results = measurePerformance(() => {
            cache.mset(valuesToSet, 2000000);
        });

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].mset = measurePerformance.formatOPS(results);

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

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].get = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiGet(cache) {
        process.stdout.write(`\rTaggedCache [multi-get]    `);
        const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mget(valuesToGet);
        });

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].mget = measurePerformance.formatOPS(results);
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

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].has = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiHas(cache) {
        process.stdout.write(`\rTaggedCache [multi-has]     `);
        const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mhas(valuesToCheck);
        });

        benchResults["Tagged Cache (w/o timestamp) (w/o tags)"].mhas = measurePerformance.formatOPS(results);

        cache.flush();
    })
    .then(() => {
        disableTimestampCache();
        return populateTaggedCache(true);
    })
    .then(function taggedCacheSet(cache) {
        process.stdout.write(`\rTaggedCache [set]         `);
        const valuesToSet = generateKV();

        const results = measurePerformance(() => {
            for (let pair of valuesToSet) {
                cache.set(pair[0], pair[1], 2000000);
            }
        });

        benchResults["Tagged Cache (w/o timestamp)"].set = measurePerformance.formatOPS(results);
        return cache;
    })
    .then(function taggedCacheMultiSet(cache) {
        process.stdout.write(`\rTaggedCache [multi-set]   `);
        const valuesToSet = generateKV(true);

        const results = measurePerformance(() => {
            cache.mset(valuesToSet, 2000000);
        });

        benchResults["Tagged Cache (w/o timestamp)"].mset = measurePerformance.formatOPS(results);

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

        benchResults["Tagged Cache (w/o timestamp)"].get = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiGet(cache) {
        process.stdout.write(`\rTaggedCache [multi-get]    `);
        const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mget(valuesToGet);
        });

        benchResults["Tagged Cache (w/o timestamp)"].mget = measurePerformance.formatOPS(results);
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

        benchResults["Tagged Cache (w/o timestamp)"].has = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiHas(cache) {
        process.stdout.write(`\rTaggedCache [multi-has]     `);
        const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mhas(valuesToCheck);
        });

        benchResults["Tagged Cache (w/o timestamp)"].mhas = measurePerformance.formatOPS(results);

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

        benchResults["Tagged Cache (w/o tags)"].set = measurePerformance.formatOPS(results);
        return cache;
    })
    .then(function taggedCacheMultiSet(cache) {
        process.stdout.write(`\rTaggedCache [multi-set]   `);
        const valuesToSet = generateKV(true);

        const results = measurePerformance(() => {
            cache.mset(valuesToSet, 2000000);
        });

        benchResults["Tagged Cache (w/o tags)"].mset = measurePerformance.formatOPS(results);

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

        benchResults["Tagged Cache (w/o tags)"].get = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiGet(cache) {
        process.stdout.write(`\rTaggedCache [multi-get]    `);
        const valuesToGet = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mget(valuesToGet);
        });

        benchResults["Tagged Cache (w/o tags)"].mget = measurePerformance.formatOPS(results);
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

        benchResults["Tagged Cache (w/o tags)"].has = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiHas(cache) {
        process.stdout.write(`\rTaggedCache [multi-has]     `);
        const valuesToCheck = Object.getOwnPropertyNames(generateKV(true));

        const results = measurePerformance(() => {
            cache.mhas(valuesToCheck);
        });

        benchResults["Tagged Cache (w/o tags)"].mhas = measurePerformance.formatOPS(results);

        disableTimestampCache();
        cache.flush();
    })
    .then(() => {
        enableTimestampCache();
        return populateTaggedCache(true);
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

        benchResults["cache-base"].has = measurePerformance.formatOPS(results);

        return cache;
    })
    .then(function taggedCacheMultiHas(cache) {
        benchResults["cache-base"].mhas = "none";

        return cache;
    })
    .then(() => {
        process.stdout.write(`\r\n`);
        console.table(benchResults);
    });
