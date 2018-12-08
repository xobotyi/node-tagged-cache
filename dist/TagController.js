"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TagController = (function () {
    function TagController() {
        this.storage = Object.create(null);
    }
    TagController.prototype.drop = function (tagName) {
        var now = Date.now();
        if (typeof tagName === "string") {
            return (this.storage[tagName] = now);
        }
        var result = {};
        for (var _i = 0, tagName_1 = tagName; _i < tagName_1.length; _i++) {
            var tag = tagName_1[_i];
            result[tag] = this.storage[tag] = now;
        }
        return result;
    };
    TagController.prototype.getVersion = function (tagName) {
        var now = Date.now();
        if (typeof tagName === "string") {
            return this.storage[tagName] || (this.storage[tagName] = now);
        }
        var result = {};
        for (var _i = 0, tagName_2 = tagName; _i < tagName_2.length; _i++) {
            var tag = tagName_2[_i];
            result[tag] = this.storage[tag] || (this.storage[tag] = now);
        }
        return result;
    };
    TagController.prototype.validate = function (tagsVersions) {
        for (var _i = 0, _a = Object.getOwnPropertyNames(tagsVersions); _i < _a.length; _i++) {
            var tag = _a[_i];
            if (tagsVersions[tag] !== this.storage[tag]) {
                return false;
            }
        }
        return true;
    };
    return TagController;
}());
exports.default = TagController;
