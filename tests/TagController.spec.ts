import {TagController} from "../src/TagController";
import {timestamp} from "../src/index";

describe("TagController", () => {
    describe(".drop", () => {
        const tagController = new TagController();

        it("should return a number", () => {
            expect(typeof tagController.drop("testTag")).toBe('number');
        });

        it("should set current timestamp0 each time tag dropped", () => {
            expect(timestamp() - tagController.drop("testTag")).toBeLessThanOrEqual(2);
        });
    });
    describe(".mdrop", () => {
        const tagController = new TagController();

        it("should return an object", () => {
            const versions = tagController.mdrop(["testTag", "testTag2"]);
            expect(versions).toBeInstanceOf(Object);
            expect(typeof versions["testTag"]).toBe('number');
            expect(typeof versions["testTag2"]).toBe('number');
        });

        it("should set current timestamp0 each time tags dropped", () => {
            const versions = tagController.mdrop(["testTag", "testTag2"]);
            expect(timestamp() - versions["testTag"]).toBeLessThanOrEqual(2);
            expect(timestamp() - versions["testTag2"]).toBeLessThanOrEqual(2);
        });

        it("should set same timestamp0 for all tags passed", () => {
            const tags         = ["testTag1", "testTag2", "testTag3"];
            const tagsVersions = tagController.mdrop(tags);
            expect(tags.every(tagVersion => tagsVersions[tagVersion] === tagsVersions[tags[0]])).toBeTruthy();
        })
    });

    describe(".get", () => {
        const tagController = new TagController();

        it("should return a number", () => {
            expect(typeof tagController.get("testTag")).toBe('number');
        });

        it("should create new version if tag does not exists", () => {
            expect(typeof tagController.get("testTag1")).toBe('number');
        });

        it("should return existing version if tag already exists", () => {
            const ver = tagController.drop("testTag1");

            expect(tagController.get("testTag1")).toBe(ver);
        });
    });

    describe(".mget", () => {
        const tagController = new TagController();

        it("should return an object if array of tags passed", () => {
            const versions = tagController.mget(["testTag", "testTag2"]);

            expect(versions).toBeInstanceOf(Object);
            expect(typeof versions["testTag"]).toBe('number');
            expect(typeof versions["testTag2"]).toBe('number');
        });

        it("should create new version if tag does not exists", () => {
            expect(typeof tagController.mget(["testTag1"])["testTag1"]).toBe('number');
        });

        it("should return existing version if tag already exists", () => {
            const ver = tagController.drop("testTag1");

            expect(tagController.mget(["testTag1"])["testTag1"]).toBe(ver);
        });
    });

    describe(".validate", () => {
        const tagController = new TagController();

        it("should return false if any version is not valid", () => {
            expect(tagController.validate({"tag1": 213, "tag2": 123})).toBeFalsy();
        });

        it("should return true if every version is valid", () => {
            const versions = tagController.mdrop(["testTag", "testTag2"]);

            expect(tagController.validate(versions)).toBeTruthy();
        });
    });
});
