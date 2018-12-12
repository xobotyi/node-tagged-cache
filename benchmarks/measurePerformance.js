module.exports = function measurePerformance(fn, rounds) {
    rounds = rounds || 500000;

    const start = Date.now();
    for (let i = 0; i < rounds; i++) {
        fn();
    }
    const end = Date.now();

    return {
        elapsed: end - start,
        ops: (rounds * 1000) / (end - start),
    };
};

module.exports.formatOPS = function formatOPS(results) {
    return String(~~results.ops).replace(/\d(?=(\d{3})+$)/g, "$&,");
};
