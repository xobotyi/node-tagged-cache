import {Crawler} from "../src/Crawler";

const createSpy = () => {
    const spy     = function () {
        spy.callCount++;
        return Promise.resolve();
    };
    spy.callCount = 0;

    return spy;
};

describe("Crawler", () => {
    const crawler = new Crawler(createSpy(), 50);

    it("should be created disabled", (done) => {
        setTimeout(() => {
            expect(crawler.active).toBeFalsy();
            done();
        }, 100);
    });

    it("should apply constructor's interval", () => {
        expect(crawler.getInterval()).toBe(50);
    });

    describe(".getInterval()", () => {
        const crawler = new Crawler(createSpy(), 50);

        it("should return number", () => {
            expect(typeof crawler.getInterval()).toBe('number');
        });

        it("should return current interval", () => {
            expect(crawler.getInterval()).toBe(50);
        });
    });

    describe(".setInterval()", () => {
        const spy     = createSpy();
        const crawler = new Crawler(spy, 50);

        it("should apply interval", () => {
            crawler.setInterval(20);
            expect(crawler.getInterval()).toBe(20);
        });

        it("should throw if interval <=0", () => {
            expect(() => {crawler.setInterval(0)}).toThrowError();
            expect(() => {crawler.setInterval(-1)}).toThrowError();
        });

        it("should immediately call the handler if crawler is active and interval has changed", (done) => {
            spy.callCount = 0;
            crawler.setInterval(1000);
            crawler.start()
                   .setInterval(2000);
            expect(spy.callCount).toBe(2);
            crawler.stop();
            done();
        });
    });

    describe(".active", () => {
        const crawler = new Crawler(createSpy(), 50);

        it("should return actual state", () => {
            expect(crawler.active).toBeFalsy();
            crawler.start();
            expect(crawler.active).toBeTruthy();
            crawler.stop();
            expect(crawler.active).toBeFalsy();
        });
    });

    describe(".start()", () => {
        const spy     = createSpy();
        const crawler = new Crawler(spy, 50);

        it("should enable the crawler", () => {
            crawler.setInterval(1000);
            expect(crawler.active).toBeFalsy();
            crawler.start();
            expect(crawler.active).toBeTruthy();
            crawler.stop();
        });

        it("should immediately call the handler", () => {
            spy.callCount = 0;
            crawler.start();
            expect(spy.callCount).toBe(1);
            crawler.stop();
        });
    });

    describe(".stop()", () => {
        const spy     = createSpy();
        const crawler = new Crawler(spy, 50);

        it("should disable the crawler", () => {
            crawler.setInterval(1000);
            expect(crawler.active).toBeFalsy();
            crawler.start();
            expect(crawler.active).toBeTruthy();
            crawler.stop();
        });

        it("should prevent future handler call", (done) => {
            crawler.setInterval(100);
            spy.callCount = 0;
            crawler.start();
            expect(spy.callCount).toBe(1);
            crawler.stop();

            setTimeout(() => {
                expect(spy.callCount).toBe(1);
                done();
            }, 200);
        });
    });
});
