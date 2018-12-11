declare type CrawlerHandler = () => Promise<void>;
export declare class Crawler {
    private timeoutID;
    private readonly handler;
    private crawlInterval;
    private _active;
    constructor(handler: CrawlerHandler, crawlInterval?: number);
    setInterval(crawlInterval: number): Crawler;
    getInterval(): number;
    readonly active: boolean;
    start(): Crawler;
    stop(): Crawler;
    private step;
}
export {};
