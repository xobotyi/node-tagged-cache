import Timeout = NodeJS.Timeout;

type CrawlerHandler = () => Promise<void>;

export class Crawler {
  private timeoutID: Timeout | null = null;

  private readonly handler: CrawlerHandler;
  private crawlInterval: number;

  private _active: boolean = false;

  constructor(handler: CrawlerHandler, crawlInterval: number = 1000) {
    this.handler = handler;
    this.setInterval(crawlInterval);
  }

  public setInterval(crawlInterval: number): Crawler {
    if (crawlInterval <= 0) {
      throw new Error("crawl interval should be more than or equal 0");
    }

    if (this.crawlInterval !== crawlInterval) {
      this.crawlInterval = crawlInterval;
      this._active && this.start();
    }

    return this;
  }

  public getInterval(): number {
    return this.crawlInterval;
  }

  get active(): boolean {
    return this._active;
  }

  public start(): Crawler {
    this._active = true;

    this.step();

    return this;
  }

  public stop(): Crawler {
    this._active = false;

    this.timeoutID && clearTimeout(this.timeoutID);
    this.timeoutID = null;

    return this;
  }

  private step = (): void => {
    this._active &&
      this.handler().then(() => {
        this.timeoutID && clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.step, this.crawlInterval);
      });
  };
}
