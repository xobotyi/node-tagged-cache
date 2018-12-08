module.exports = async function measurePerformance(fn, rounds) {
  rounds = rounds || 1000000;

  const start = Date.now();
  for (let i = 0; i < rounds; i++) {
    await fn();
  }
  const end = Date.now();

  return {
    elapsed: end - start,
    ops: (rounds * 1000) / (end - start)
  };
};
