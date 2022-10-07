(function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var ImageItem = /** @class */ (function (_super) {
        __extends(ImageItem, _super);
        function ImageItem(options) {
            var _this = this;
            if (!options) {
                options = {};
            }
            options = _.extend(options, { className: "attachments-browser naimage-browser" });
            options.events = {};
            _this = _super.call(this, options) || this;
            _this.onSelection = options.onSelection;
            _this.template = wp.template("naimage-details");
            window.addEventListener("paste", function (e) {
                _this.retrieveImageFromClipboardAsBase64(e, function (imageDataBase64, img, raw, type) {
                    if (imageDataBase64) {
                        _this.$el.find(".media-sidebar").html(new ImageItemDetails(imageDataBase64, img, raw, type).render().el);
                        var releaseElement = _this.$el.find("#media-image-edit");
                        releaseElement.html("<img src=".concat(imageDataBase64, " />"));
                    }
                });
            }, false);
            return _this;
        }
        ImageItem.prototype.render = function () {
            jQuery(".media-frame-content").attr("data-columns", 8);
            this.$el.html(this.template({}));
            return this;
        };
        ImageItem.prototype.retrieveImageFromClipboardAsBase64 = function (pasteEvent, callback, imageFormat) {
            if (imageFormat === void 0) { imageFormat = "image/png"; }
            if (pasteEvent.clipboardData == false) {
                if (typeof callback == "function") {
                    return callback(undefined);
                }
            }
            // retrive elements from clipboard
            var items = pasteEvent.clipboardData.items;
            if (items == undefined) {
                if (typeof callback == "function") {
                    return callback(undefined);
                }
            }
            var _loop_1 = function (i) { 
                // Skip content if not image
                if (items[i].type.indexOf("image") == -1) {
                    items[i].getAsString(function (data) {
                        if (data != "") {
                            var elm = document.createElement("div");
                            elm.innerHTML = data;
                            var svg = elm.querySelector("svg");
                            if (svg) {
                                var str = svg.outerHTML;
                                var src = "data:image/svg+xml;base64," + btoa(str);
                                var img_1 = new Image();
                                img_1.src = src;
                                callback(src, img_1, str, "svg");
                            }
                        }
                    });
                    return "continue";
                }
                var blob = items[i].getAsFile();
                var mycanvas = document.createElement("canvas");
                var ctx = mycanvas.getContext("2d");
                var img = new Image();
                img.onload = function () {
                    mycanvas.width = this.width;
                    mycanvas.height = this.height;
                    // Draw the image
                    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0);
                    if (typeof callback == "function") {
                        callback(mycanvas.toDataURL(imageFormat || "image/png"), img, blob, "png");
                    }
                };
                var URLObj = window.URL || window.webkitURL;
                img.src = URLObj.createObjectURL(blob);
            };
            // loop the elements
            for (var i = 0; i < items.length; i++) {
                _loop_1(i);
            }
        };
        return ImageItem;
    }(wp.Backbone.View));
    var ImageItemDetails = /** @class */ (function (_super) {
        __extends(ImageItemDetails, _super);
        function ImageItemDetails(base64string, item, raw, type) {
            var _this = this;
            var options = {
                tagName: "div",
                className: "attachment-details naimage-details",
                events: {
                    "click .button-save": "onSaveImage"
                }
            };
            _this = _super.call(this, options) || this;
            _this.onSelection = function (selection) {
                var attachment = new wp.media.model.Attachment({
                    id: selection.id
                });
                attachment
                    .fetch()
                    .done(function done() {
                    attachment.set(attachment.toJSON());
                    wp.media.frame.state().get("selection").add(attachment);
                    wp.media.frame.toolbar.get().refresh();
                })
                    .fail(function fail() {
                    //attachment.model.set("error", "missing_attachment");
                });
                // wp.media.frame.state().set("selection", {
                // 	toJSON: () => {
                // 		return selection;
                // 	},
                // });
            };
            _this.base64string = base64string;
            _this.item = item;
            _this.type = type;
            _this.raw = raw;
            _this.template = wp.template("naimage-details-item-details");
            return _this;
        }
        ImageItemDetails.prototype.render = function () {
            this.$el.html(this.template(this.item));
            return this;
        };
        ImageItemDetails.prototype.onSaveImage = function (e) {
            var _this = this;
            e.preventDefault();
            e.target.disabled = true;
            var titleElm = this.$el.find("#naimage-details-title");
            var title = titleElm.val();
            var nameElm = this.$el.find("#naimage-details-name");
            var name = nameElm.val();
            var heightElm = this.$el.find("#naimage-details-height");
            var widthElm = this.$el.find("#naimage-details-width");
            var urlElm = this.$el.find("#naimage-details-copy-link");
            var data = new FormData();
            data.append("action", "save_pasted_image");
            data.append("title", title);
            data.append("name", name);
            data.append("image", this.raw);
            data.append("type", this.type);
            Backbone.ajax({
                dataType: "json",
                url: ajaxurl,
                method: "POST",
                processData: false,
                contentType: false,
                data: data,
                success: function (response) {
                    if (response.status == "success") {
                        titleElm.val(response.title);
                        titleElm.attr("readonly", true);
                        nameElm.val(response.name);
                        nameElm.attr("readonly", true);
                        urlElm.val(response.url);
                        heightElm.val(response.height);
                        widthElm.val(response.width);
                        wp.media.frame.toolbar.get().refresh();
                        _this.onSelection({ id: response.id, name: response.name, url: response.url });
                    }
                    else {
                        e.target.disabled = false;
                        alert(response.message);
                    }
                },
                error: function (xhr, status, error) {
                    e.target.disabled = false;
                    alert(error);
                }
            });
        };
        return ImageItemDetails;
    }(wp.Backbone.View));

    var MediaFrame = /** @class */ (function () {
        function MediaFrame() {
            (this.frame = wp.media.view.MediaFrame), (this.l10n = wp.media.view.l10n);
            this.init();
        }
        MediaFrame.prototype.init = function () {
            /**
             * wp.media.view.MediaFrame
             *
             * The frame used to create the media modal.
             *
             * @memberOf wp.media.view
             *
             * @class
             * @augments wp.media.view.Frame
             * @augments wp.media.View
             * @augments wp.Backbone.View
             * @augments Backbone.View
             * @mixes wp.media.controller.StateMachine
             */
            var originalSelect = wp.media.view.MediaFrame.Select.extend({});
            wp.media.view.MediaFrame.Select = originalSelect.extend(
            /** @lends wp.media.view.MediaFrame.Select.prototype */ {
                initialize: function () {
                    originalSelect.prototype.initialize.apply(this, arguments);
                    this.bindNewHandlers();
                },
                /**
                 * Bind region mode event callbacks.
                 *
                 * @see media.controller.Region.render
                 */
                bindNewHandlers: function () {
                    this.on("router:render:browse", this.addBrowseRouter, this);
                    this.on("content:create:pasteimage", this.browseCustomContent, this);
                },
                /**
                 * Render callback for the router region in the `browse` mode.
                 *
                 * @param {wp.media.view.Router} routerView
                 */
                addBrowseRouter: function (routerView) {
                    routerView.set("pasteimage", {
                        text: "Paste Image",
                        priority: 80
                    });
                },
                browseCustomContent: function (contentRegion) {
                    this.$el.removeClass("hide-toolbar");
                    contentRegion.view = new ImageItem({
                        onSelection: function (selection) {
                            wp.media.frame.state().set("selection", [
                                {
                                    toJSON: function () {
                                        return selection;
                                    }
                                },
                            ]);
                            wp.media.frame.toolbar.get().refresh();
                        }
                    });
                }
            });
        };
        return MediaFrame;
    }());

    var AjaxyPasteimage = /** @class */ (function () {
        function AjaxyPasteimage() {
            var _this = this;
            this.ready(function () {
                _this.handleWpMedia();
            });
        }
        AjaxyPasteimage.prototype.closest = function (el, tag) {
            tag = tag.toUpperCase();
            do {
                if (el.nodeName === tag) {
                    return el;
                }
            } while ((el = el.parentNode));
            return null;
        };
        AjaxyPasteimage.prototype.ready = function (fn) {
            if (document.readyState != "loading") {
                fn();
            }
            else {
                document.addEventListener("DOMContentLoaded", fn);
            }
        };
        AjaxyPasteimage.prototype.on = function (eventType, className, cb) {
            document.addEventListener(eventType, function (event) {
                var el = event.target, found;
                while (el && !(found = el.id === className || el.classList.contains(className.replace(".", "")))) {
                    el = el.parentElement;
                }
                if (found) {
                    cb.call(el, event);
                }
            }, false);
        };
        AjaxyPasteimage.prototype.encodeQueryString = function (params) {
            var keys = Object.keys(params);
            return keys.length ? "?" + keys.map(function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]); }).join("&") : "";
        };
        AjaxyPasteimage.prototype.handleWpMedia = function () {
            this.MediaFrame = new MediaFrame();
        };
        return AjaxyPasteimage;
    }());
    window["AjaxyPasteimage"] = new AjaxyPasteimage();

})();
