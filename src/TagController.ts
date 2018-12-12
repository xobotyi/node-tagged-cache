import timestamp from "./timestamp";

export type TagVersion = number;

export type TagsList = string[];

export interface TagsVersionsList {
    [name: string]: TagVersion;
}

export class TagController {
    private storage: Map<string, TagVersion> = new Map();

    public drop(tagName: string): TagVersion {
        const now = timestamp();
        this.storage.set(tagName, now);
        return now;
    }

    public mdrop(tagNames: string[]): TagsVersionsList {
        const result: TagsVersionsList = {};
        const now = timestamp();

        for (let tagName of tagNames) {
            this.storage.set(tagName, now);
            result[tagName] = now;
        }

        return result;
    }

    public get(tagName: string): TagVersion {
        let version = this.storage.get(tagName);

        !version && (version = timestamp()) && this.storage.set(tagName, version);

        return version;
    }

    public mget(tagNames: string[]): TagsVersionsList {
        const result: TagsVersionsList = {};
        const now = timestamp();

        for (let tagName of tagNames) {
            let version = this.storage.get(tagName);

            !version && (version = now) && this.storage.set(tagName, version);

            result[tagName] = version;
        }

        return result;
    }

    public validate(tagsVersions: TagsVersionsList): boolean {
        for (const tagName in tagsVersions) {
            if (tagsVersions[tagName] !== this.storage.get(tagName)) {
                return false;
            }
        }

        return true;
    }
}
