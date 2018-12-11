export declare type TagVersion = number;
export declare type TagsList = string[];
export interface TagsVersionsList {
    [name: string]: TagVersion;
}
export declare class TagController {
    private storage;
    drop(tagName: string): TagVersion;
    mdrop(tagNames: string[]): TagsVersionsList;
    get(tagName: string): TagVersion;
    mget(tagNames: string[]): TagsVersionsList;
    validate(tagsVersions: TagsVersionsList): boolean;
}
