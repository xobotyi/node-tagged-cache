import timestamp, {
    getTimestampSyncInterval,
    setTimestampSyncInterval,
    startTimestampSync,
    stopTimestampSync,
} from "../src/timestamp";

describe("timestamp", () => {
    beforeEach(() => {
        setTimestampSyncInterval(101);
        startTimestampSync();
    });

    describe("timestamp()", () => {
        it("should return a number", () => {
            expect(typeof timestamp()).toBe("number");
        });

        it("should update with given interval", (done) => {
            setTimestampSyncInterval(50);
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).not.toBe(prevTimestamp);
                done();
            }, 60);
        });
    });

    describe("getTimestampSyncInterval()", () => {
        it("should return a number", () => {
            expect(typeof getTimestampSyncInterval()).toBe("number");
        });

        it("should return current sync interval", (done) => {
            setTimestampSyncInterval(40);
            const prevTimestamp = timestamp();
            expect(getTimestampSyncInterval()).toBe(40);

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);

                setTimeout(() => {
                    expect(timestamp()).not.toBe(prevTimestamp);
                    done();
                }, 20);
            }, 30);
        });
    });

    describe("setTimestampSyncInterval()", () => {
        it("should set the sync interval", () => {
            setTimestampSyncInterval(100);
            expect(getTimestampSyncInterval()).toBe(100);
        });

        it("should throw if interval <=0", () => {
            expect(() => setTimestampSyncInterval(0)).toThrowError();
            expect(() => setTimestampSyncInterval(-1)).toThrowError();
        });

        it("should perform immediate sync if interval has changed", (done) => {
            const prevTimestamp = timestamp();
            setTimeout(() => {
                setTimestampSyncInterval(50);
                expect(timestamp()).not.toBe(prevTimestamp);
                done()
            }, 10)
        });

        it("should NOT perform immediate sync if interval not changed", () => {
            const prevTimestamp = timestamp();
            setTimestampSyncInterval(50);
            expect(timestamp()).toBe(prevTimestamp);
        });

        it("or sync is disabled", () => {
            const prevTimestamp = timestamp();
            stopTimestampSync();
            setTimestampSyncInterval(50);
            expect(timestamp() - prevTimestamp).toBeLessThanOrEqual(2);
        });
    });

    describe("stopTimestampSync()", () => {
        it("should switch timestamp() to the Date.now() alias", (done) => {
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                expect(timestamp()).not.toBe(Date.now());
                stopTimestampSync();

                setTimeout(() => {
                    expect(timestamp()).not.toBe(prevTimestamp);
                    expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);
                    done();
                }, 10);
            }, 10);
        });

        it("should not do anything if sync is already stopped", () => {
            stopTimestampSync();
            stopTimestampSync();

            expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);
        });
    });

    describe("stopTimestampSync()", () => {
        it("should switch timestamp() to the cached version", (done) => {
            stopTimestampSync();
            expect(timestamp() - Date.now()).toBeLessThanOrEqual(2);

            startTimestampSync();
            const prevTimestamp = timestamp();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                done();
            }, 10);
        });

        it("should not do anything if sync is already started", (done) => {
            startTimestampSync();

            const prevTimestamp = timestamp();
            startTimestampSync();

            setTimeout(() => {
                expect(timestamp()).toBe(prevTimestamp);
                done();
            }, 10);
        });
    });
});
