import { ImageItem } from "./image";

declare let wp: any;

export class MediaFrame {
	l10n: any;
	frame: any;
	MediaFrame: any;
	constructor() {
		(this.frame = wp.media.view.MediaFrame), (this.l10n = wp.media.view.l10n);
		this.init();
	}
	init() {
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

		let originalSelect = wp.media.view.MediaFrame.Select.extend({});

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
						priority: 80,
					});
				},
				browseCustomContent: function (contentRegion) {
					this.$el.removeClass("hide-toolbar");
					contentRegion.view = new ImageItem({
						onSelection: (selection) => {
							wp.media.frame.state().set("selection", [
								{
									toJSON: () => {
										return selection;
									},
								},
							]);
							wp.media.frame.toolbar.get().refresh();
						},
					});
				},
			}
		);
	}
}
