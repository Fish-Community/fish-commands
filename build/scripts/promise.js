"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a custom polyfill for promises with slightly different behavior.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promise = void 0;
exports.queueMicrotask = queueMicrotask;
function queueMicrotask(callback, errorHandler) {
    if (errorHandler === void 0) { errorHandler = function (err) {
        Log.err("Uncaught (in promise)");
        Log.err(err);
    }; }
    Core.app.post(function () {
        try {
            callback();
        }
        catch (err) {
            errorHandler(err);
        }
    });
}
var Promise = /** @class */ (function () {
    function Promise(initializer, skipMicrotask) {
        if (skipMicrotask === void 0) { skipMicrotask = false; }
        var _this = this;
        this.state = ["pending"];
        this.resolveHandlers = [];
        this.rejectHandlers = [];
        initializer(function (value) {
            _this.state = ["resolved", value];
            if (skipMicrotask)
                _this.resolve();
            else
                queueMicrotask(function () { return _this.resolve(); });
        }, function (error) {
            _this.state = ["rejected", error];
            if (skipMicrotask)
                _this.reject();
            else
                queueMicrotask(function () { return _this.reject(); });
        });
    }
    Promise.prototype.resolve = function () {
        var state = this.state;
        this.resolveHandlers.forEach(function (h) { return h(state[1]); });
    };
    Promise.prototype.reject = function () {
        var state = this.state;
        this.rejectHandlers.forEach(function (h) { return h(state[1]); });
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _a = Promise.withResolvers(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
        if (onFulfilled) {
            this.resolveHandlers.push(function (value) {
                var result = onFulfilled(value);
                if (result instanceof Promise) {
                    result.then(function (nextResult) { return resolve(nextResult); });
                }
                else {
                    resolve(result);
                }
            });
        }
        if (onRejected) {
            this.rejectHandlers.push(function (value) {
                var result = onRejected(value);
                if (result instanceof Promise) {
                    result.then(function (nextResult) { return resolve(nextResult); });
                }
                else {
                    resolve(result);
                }
            });
        }
        else {
            this.rejectHandlers.push(function (value) {
                reject(value);
            });
        }
        return promise;
    };
    Promise.prototype.catch = function (onRejected) {
        var _a = Promise.withResolvers(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
        this.rejectHandlers.push(function (value) {
            var result = onRejected(value);
            if (result instanceof Promise) {
                result.then(function (nextResult) { return resolve(nextResult); });
            }
            else {
                resolve(result);
            }
        });
        //If the original promise resolves successfully, the new one also needs to resolve
        this.resolveHandlers.push(function (value) { return resolve(value); });
        return promise;
    };
    Promise.withResolvers = function (skipMicrotask) {
        if (skipMicrotask === void 0) { skipMicrotask = false; }
        var resolve;
        var reject;
        var promise = new Promise(function (r, j) {
            resolve = r;
            reject = j;
        }, skipMicrotask);
        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };
    };
    Promise.all = function (promises) {
        var _a = Promise.withResolvers(), promise = _a.promise, resolve = _a.resolve, reject = _a.reject;
        var outputs = new Array(promises.length);
        var resolutions = 0;
        promises.map(function (p, i) {
            p.then(function (v) {
                outputs[i] = v;
                resolutions++;
                if (resolutions == promises.length)
                    resolve(outputs);
            });
            p.catch(function (err) {
                resolutions = -Infinity;
                reject(err);
            });
        });
        return promise;
    };
    Promise.resolve = function (value) {
        return new Promise(function (resolve) { return resolve(value); });
    };
    return Promise;
}());
exports.Promise = Promise;
