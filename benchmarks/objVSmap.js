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

const benchResults = {
  obj: {},
  objV2: {},
  map: {}
};

Promise.resolve()
  // Object v1
  .then(() => {
    process.stdout.write(`\rObject [set]`);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        obj[pair[0]] = pair[1];
      }
    });
  })
  .then(results => {
    benchResults.obj.set = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject [get]    `);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        obj[pair[0]];
      }
    });
  })
  .then(results => {
    benchResults.obj.get = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject [check]    `);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        typeof obj[pair[0]] !== "undefined";
      }
    });
  })
  .then(results => {
    benchResults.obj.check = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject [delete]    `);
    const obj = populateObject();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        delete obj[pair[0]];
      }
    });
  })
  .then(results => {
    benchResults.obj.delete = ~~results.ops;
  })
  // Object v2
  .then(() => {
    process.stdout.write(`\rObject Ver.2 [set]    `);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        obj[pair[0]] = pair[1];
      }
    });
  })
  .then(results => {
    benchResults.objV2.set = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Ver.2 [get]    `);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        obj[pair[0]];
      }
    });
  })
  .then(results => {
    benchResults.objV2.get = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Ver.2 [check]    `);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        !!obj[pair[0]];
      }
    });
  })
  .then(results => {
    benchResults.objV2.check = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Ver.2 [delete]    `);
    const obj = populateObjectV2();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        delete obj[pair[0]];
      }
    });
  })
  .then(results => {
    benchResults.objV2.delete = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Map [set]    `);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        map.set(pair[0], pair[1]);
      }
    });
  })
  .then(results => {
    benchResults.map.set = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Map [get]    `);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        map.get(pair[0]);
      }
    });
  })
  .then(results => {
    benchResults.map.get = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Map [check]    `);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        map.has(pair[0]);
      }
    });
  })
  .then(results => {
    benchResults.map.check = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\rObject Map [delete]    `);
    const map = populateMap();
    const valuesToSet = generateKV();

    return measurePerformance(() => {
      for (let pair of valuesToSet) {
        map.delete(pair[0]);
      }
    });
  })
  .then(results => {
    benchResults.map.delete = ~~results.ops;
  })
  .then(() => {
    process.stdout.write(`\r\n`);
    console.table(benchResults);
  });
