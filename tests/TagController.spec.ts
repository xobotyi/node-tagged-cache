import TagController from "../src/TagController";

describe("TagController", () => {
    describe(".drop", () => {
        const tagController = new TagController();

        it("should return a number if single tag passed", () => {
            expect(typeof tagController.drop("testTag")).toBe('number');
        });

        it("should return an object if array of tags passed", () => {
            const versions = tagController.drop(["testTag", "testTag2"]);
            expect(versions).toBeInstanceOf(Object);
            expect(typeof versions["testTag"]).toBe('number');
            expect(typeof versions["testTag2"]).toBe('number');
        });

        it("should set current timestamp each time tag dropped", () => {
            expect(Date.now() - tagController.drop("testTag")).toBeLessThanOrEqual(2);
        });

        it("should set same timestamp for all tags passed in array", () => {
            const tags         = ["testTag1", "testTag2", "testTag3"];
            const tagsVersions = tagController.drop(tags);
            expect(tags.every(tagVersion => tagsVersions[tagVersion] === tagsVersions[tags[0]])).toBeTruthy();
        })
    });

    describe(".getVersion", () => {
        const tagController = new TagController();

        it("should return a number if single tag passed", () => {
            expect(typeof tagController.getVersion("testTag")).toBe('number');
        });

        it("should return an object if array of tags passed", () => {
            const versions = tagController.getVersion(["testTag", "testTag2"]);

            expect(versions).toBeInstanceOf(Object);
            expect(typeof versions["testTag"]).toBe('number');
            expect(typeof versions["testTag2"]).toBe('number');
        });

        it("should create new version if tag does not exists", () => {
            expect(typeof tagController.getVersion("testTag1")).toBe('number');
        });

        it("should return existing version if tag already exists", () => {
            const ver = tagController.drop("testTag1");

            expect(tagController.getVersion("testTag1")).toBe(ver);
        });
    });

    describe(".validate", () => {
        const tagController = new TagController();

        it("should return false if any version is not valid", () => {
            expect(tagController.validate({"tag1": 213, "tag2": 123})).toBeFalsy();
        });

        it("should return true if every version is valid", () => {
            const versions = tagController.drop(["testTag", "testTag2"]);

            expect(tagController.validate(versions)).toBeTruthy();
        });
    });
});
