"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ViewportHelper = (function () {
    function ViewportHelper() {
    }
    return ViewportHelper;
}());
exports.ViewportHelper = ViewportHelper;
var BrowserViewportHelper = (function (_super) {
    __extends(BrowserViewportHelper, _super);
    function BrowserViewportHelper() {
        _super.apply(this, arguments);
    }
    BrowserViewportHelper.prototype.getDocumentNativeElement = function () {
        return window.document;
    };
    BrowserViewportHelper.prototype.requestFrame = function (fn) {
        return window.requestAnimationFrame(fn);
    };
    BrowserViewportHelper.prototype.matchMedia = function (query) {
        return window.matchMedia(query);
    };
    BrowserViewportHelper.prototype.scrollTop = function () {
        return window.pageYOffset || document.documentElement.scrollTop;
    };
    return BrowserViewportHelper;
}(ViewportHelper));
exports.BrowserViewportHelper = BrowserViewportHelper;
var NodeViewportMediaMatch = (function () {
    function NodeViewportMediaMatch(matches, media) {
        if (matches === void 0) { matches = false; }
        if (media === void 0) { media = ''; }
        this.matches = matches;
        this.media = media;
    }
    NodeViewportMediaMatch.prototype.addListener = function (listener) {
    };
    NodeViewportMediaMatch.prototype.removeListener = function (listener) {
    };
    return NodeViewportMediaMatch;
}());
exports.NodeViewportMediaMatch = NodeViewportMediaMatch;
var NodeViewportHelper = (function (_super) {
    __extends(NodeViewportHelper, _super);
    function NodeViewportHelper() {
        _super.apply(this, arguments);
    }
    NodeViewportHelper.prototype.getDocumentNativeElement = function () {
        return {};
    };
    NodeViewportHelper.prototype.requestFrame = function (fn) {
        return process.nextTick(fn);
    };
    NodeViewportHelper.prototype.matchMedia = function (query) {
        return new NodeViewportMediaMatch(false, query);
    };
    NodeViewportHelper.prototype.scrollTop = function () {
        return 0;
    };
    return NodeViewportHelper;
}(ViewportHelper));
exports.NodeViewportHelper = NodeViewportHelper;
//# sourceMappingURL=viewport.js.map