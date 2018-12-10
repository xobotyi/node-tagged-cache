"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    return _timestampSyncEnabled ? _timestamp : Date.now();
}
exports.default = default_1;
let _timestamp = 0;
let _timestampSyncInterval = 1000;
let _timestampSyncEnabled = true;
let _timestampSyncTimeout;
function timestampSync() {
    _timestamp = Date.now();
    if (_timestampSyncEnabled) {
        _timestampSyncTimeout = setTimeout(timestampSync, _timestampSyncInterval);
    }
}
timestampSync();
function stopTimestampSync() {
    if (!_timestampSyncEnabled) {
        return;
    }
    _timestampSyncEnabled = false;
    _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);
    _timestampSyncTimeout = undefined;
}
exports.stopTimestampSync = stopTimestampSync;
function startTimestampSync() {
    if (_timestampSyncEnabled) {
        return;
    }
    _timestampSyncEnabled = true;
    _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);
    timestampSync();
}
exports.startTimestampSync = startTimestampSync;
function setTimestampSyncInterval(interval) {
    if (interval <= 0) {
        throw new Error("interval has to be greater than 0");
    }
    if (interval === _timestampSyncInterval || !_timestampSyncEnabled) {
        return;
    }
    _timestampSyncInterval = interval;
    _timestampSyncTimeout && clearTimeout(_timestampSyncTimeout);
    timestampSync();
}
exports.setTimestampSyncInterval = setTimestampSyncInterval;
