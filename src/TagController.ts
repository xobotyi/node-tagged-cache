export type TagVersion = number;

export interface TagVersionList {
  [name: string]: TagVersion;
}

export default class TagController {
  private storage = Object.create(null);

  public drop(tagName: string): TagVersion;
  public drop(tagName: string[]): TagVersionList;
  public drop(tagName: string | string[]): TagVersion | TagVersionList {
    const now = Date.now();
    if (typeof tagName === "string") {
      return (this.storage[tagName] = now);
    }

    const result: TagVersionList = {};

    for (let tag of tagName) {
      result[tag] = this.storage[tag] = now;
    }

    return result;
  }

  public getVersion(tagName: string): TagVersion;
  public getVersion(tagName: string[]): TagVersionList;
  public getVersion(tagName: string | string[]): TagVersion | TagVersionList {
    const now = Date.now();

    if (typeof tagName === "string") {
      return this.storage[tagName] || (this.storage[tagName] = now);
    }

    const result: TagVersionList = {};

    for (let tag of tagName) {
      result[tag] = this.storage[tag] || (this.storage[tag] = now);
    }

    return result;
  }

  public validate(tagsVersions: TagVersionList): boolean {
    for (let tag of Object.getOwnPropertyNames(tagsVersions)) {
      if (tagsVersions[tag] !== this.storage[tag]) {
        return false;
      }
    }

    return true;
  }
}
