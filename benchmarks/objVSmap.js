const measurePerformance = require("./measurePerformance");

process.stdout.write("====\nObject vs Map\n====\n\n");

const populateObject = () => {
  const obj = {};
  for (let i = 0; i < 100000; i++) {
    obj["someKey" + i] = "someValue" + i;
  }
  return obj;
};
const populateObjectV2 = () => {
  const obj = Object.create(null);
  for (let i = 0; i < 100000; i++) {
    obj["someKey" + i] = "someValue" + i;
  }
  return obj;
};
const populateMap = () => {
  const map = new Map();
  for (let i = 0; i < 100000; i++) {
    map.set("someKey" + i, "someValue" + i);
  }
  return map;
};

const generateKV = () => {
  const res = [];

  for (let i = 0; i < 5; i++) {
    let num = Math.random() * 100000;
    res.push(["someKey" + num, "someValue" + num]);
  }

  return res;
};

Promise.resolve()
  .then(() => {
    process.stdout.write("`set` (1M rounds)\n");
  })
  .then(() => {
    process.stdout.write(`\tObject:`);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        obj[pair[0]] = pair[1];
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tObject v2:`);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        obj[pair[0]] = pair[1];
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject v2:\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tMap:`);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        map.set(pair[0], pair[1]);
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tMap:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write("\n`get` (1M rounds)\n");
  })
  .then(() => {
    process.stdout.write(`\tObject:`);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        obj[pair[0]];
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tObject v2:`);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        obj[pair[0]];
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject v2:\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tMap:`);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        map.get(pair[0]);
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tMap:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write("\n`entry existence check` (1M rounds)\n");
  })
  .then(() => {
    process.stdout.write(`\tObject:`);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        typeof obj[pair[0]] !== "undefined";
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tObject v2:`);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        Boolean(obj[pair[0]]);
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject v2:\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tMap:`);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        map.has(pair[0]);
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tMap:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write("\n`delete` (1M rounds)\n");
  })
  .then(() => {
    process.stdout.write(`\tObject:`);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        delete obj[pair[0]];
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tObject v2:`);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        obj[pair[0]] = null;
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tObject v2:\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    process.stdout.write(`\tMap:`);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      valuesToSet.map(pair => {
        map.delete(pair[0]);
      });
    });
  })
  .then(results => {
    process.stdout.write(
      `\r\tMap:\t\t${results.elapsed}ms (${~~results.ops} OPS)\n`
    );
  })
  .then(() => {
    console.log("All tests are done!");
  });
