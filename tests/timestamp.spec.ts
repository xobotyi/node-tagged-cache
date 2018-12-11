import timestamp, {
    getTimestampCacheTTL,
    setTimestampCacheTTL,
    enableTimestampCache,
    disableTimestampCache,
} from "../src/timestamp";

describe("timestamp", () => {
    beforeEach(() => {
        setTimestampCacheTTL(101);
        enableTimestampCache();
    });

    afterAll(() => {
        disableTimestampCache();
    });

    describe("timestamp()", () => {
        it("should return a number", () => {
            expect(typeof timestamp()).toBe("number");
        });

        it("should update with given interval", (done) => {
            setTimestampCacheTTL(50);
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).not.toBe(prevTimestamp);
                done();
            }, 60);
        });
    });

    describe("getTimestampCacheTTL()", () => {
        it("should return a number", () => {
            expect(typeof getTimestampCacheTTL()).toBe("number");
        });

        it("should return current sync interval", (done) => {
            setTimestampCacheTTL(40);
            const prevTimestamp = timestamp();
            expect(getTimestampCacheTTL()).toBe(40);

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);

                setTimeout(() => {
                    expect(timestamp()).not.toBe(prevTimestamp);
                    done();
                }, 20);
            }, 30);
        });
    });

    describe("setTimestampCacheTTL()", () => {
        it("should set the sync interval", () => {
            setTimestampCacheTTL(100);
            expect(getTimestampCacheTTL()).toBe(100);
        });

        it("should throw if interval <=0", () => {
            expect(() => setTimestampCacheTTL(0)).toThrowError();
            expect(() => setTimestampCacheTTL(-1)).toThrowError();
        });

        it("should perform immediate sync if interval has changed", (done) => {
            const prevTimestamp = timestamp();
            setTimeout(() => {
                setTimestampCacheTTL(50);
                expect(timestamp()).not.toBe(prevTimestamp);
                done()
            }, 10)
        });

        it("should NOT perform immediate sync if interval not changed", () => {
            const prevTimestamp = timestamp();
            setTimestampCacheTTL(50);
            expect(timestamp()).toBe(prevTimestamp);
        });

        it("or sync is disabled", () => {
            const prevTimestamp = timestamp();
            disableTimestampCache();
            setTimestampCacheTTL(50);
            expect(timestamp() - prevTimestamp).toBeLessThanOrEqual(2);
        });
    });

    describe("disableTimestampCache()", () => {
        it("should switch timestamp() to the Date.now() alias", (done) => {
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                expect(timestamp()).not.toBe(Date.now());
                disableTimestampCache();

                setTimeout(() => {
                    expect(timestamp()).not.toBe(prevTimestamp);
                    expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);
                    done();
                }, 10);
            }, 10);
        });

        it("should not do anything if sync is already stopped", () => {
            disableTimestampCache();
            disableTimestampCache();

            expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);
        });
    });

    describe("disableTimestampCache()", () => {
        it("should switch timestamp() to the cached version", (done) => {
            disableTimestampCache();
            expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);

            enableTimestampCache();
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                done();
            }, 10);
        });

        it("should not do anything if sync is already started", (done) => {
            enableTimestampCache();

            const prevTimestamp = timestamp();
            enableTimestampCache();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                done();
            }, 10);
        });
    });
});
