"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Crawler {
    constructor(handler, crawlInterval = 1000) {
        this.timeoutID = null;
        this._active = false;
        this.step = () => {
            this._active &&
                this.handler().then(() => {
                    this.timeoutID && clearTimeout(this.timeoutID);
                    this.timeoutID = setTimeout(this.step, this.crawlInterval);
                });
        };
        this.handler = handler;
        this.setInterval(crawlInterval);
    }
    setInterval(crawlInterval) {
        if (crawlInterval <= 0) {
            throw new Error("crawl interval should be more than or equal 0");
        }
        if (this.crawlInterval !== crawlInterval) {
            this.crawlInterval = crawlInterval;
            this._active && this.start();
        }
        return this;
    }
    getInterval() {
        return this.crawlInterval;
    }
    get active() {
        return this._active;
    }
    start() {
        this._active = true;
        this.step();
        return this;
    }
    stop() {
        this._active = false;
        this.timeoutID && clearTimeout(this.timeoutID);
        this.timeoutID = null;
        return this;
    }
}
exports.Crawler = Crawler;
