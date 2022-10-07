declare let wp: any, jQuery: any, _: any, ajaxurl: any, Backbone: any, __: any;

export class ImageItem extends wp.Backbone.View {
	template: (properties?: any) => string;
	items: [];
	constructor(options?: any) {
		if (!options) {
			options = {};
		}
		options = _.extend(options, { className: "attachments-browser naimage-browser" });
		options.events = {};

		super(options);
		this.onSelection = options.onSelection;
		this.template = wp.template("naimage-details");

		window.addEventListener(
			"paste",
			(e) => {
				this.retrieveImageFromClipboardAsBase64(e, (imageDataBase64, img, raw, type) => {
					if (imageDataBase64) {
						this.$el.find(".media-sidebar").html(new ImageItemDetails(imageDataBase64, img, raw, type).render().el);
						let releaseElement = this.$el.find("#media-image-edit");
						releaseElement.html(`<img src=${imageDataBase64} />`);
					}
				});
			},
			false
		);
	}

	render() {
		jQuery(".media-frame-content").attr("data-columns", 8);
		this.$el.html(this.template({}));
		return this;
	}

	retrieveImageFromClipboardAsBase64(pasteEvent, callback, imageFormat = "image/png") {
		if (pasteEvent.clipboardData == false) {
			if (typeof callback == "function") {
				return callback(undefined);
			}
		}

		// retrive elements from clipboard
		let items = pasteEvent.clipboardData.items;

		if (items == undefined) {
			if (typeof callback == "function") {
				return callback(undefined);
			}
		}
		// loop the elements
		for (let i = 0; i < items.length; i++) {
			// Skip content if not image
			if (items[i].type.indexOf("image") == -1) {
				items[i].getAsString((data) => {
					if (data != "") {
						let elm = document.createElement("div");
						elm.innerHTML = data;
						let svg = elm.querySelector("svg");
						if (svg) {
							let str = svg.outerHTML;
							let src = "data:image/svg+xml;base64," + btoa(str);
							let img = new Image();
							img.src = src;
							callback(src, img, str, "svg");
						}
					}
				});
				continue;
			}

			let blob = items[i].getAsFile();
			let mycanvas = document.createElement("canvas");
			let ctx = mycanvas.getContext("2d");
			let img = new Image();
			img.onload = function () {
				mycanvas.width = (this as HTMLImageElement).width;
				mycanvas.height = (this as HTMLImageElement).height;

				// Draw the image
				ctx?.drawImage(img, 0, 0);
				if (typeof callback == "function") {
					callback(mycanvas.toDataURL(imageFormat || "image/png"), img, blob, "png");
				}
			};

			let URLObj = window.URL || window.webkitURL;
			img.src = URLObj.createObjectURL(blob);
		}
	}
}
class ImageItemDetails extends wp.Backbone.View {
	template: (properties?: any) => string;

	constructor(base64string: string, item: any, raw: any, type: "png" | "svg") {
		let options = {
			tagName: "div",
			className: "attachment-details naimage-details",
			events: {
				"click .button-save": "onSaveImage",
			},
		};
		super(options);

		this.base64string = base64string;
		this.item = item;
		this.type = type;
		this.raw = raw;
		this.template = wp.template("naimage-details-item-details");
	}

	render() {
		this.$el.html(this.template(this.item));
		return this;
	}

	onSelection = (selection) => {
		let attachment = new wp.media.model.Attachment({
			id: selection.id,
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

	onSaveImage(e) {
		e.preventDefault();
		e.target.disabled = true;
		let titleElm = this.$el.find("#naimage-details-title");
		let title = titleElm.val();
		let nameElm = this.$el.find("#naimage-details-name");
		let name = nameElm.val();
		let heightElm = this.$el.find("#naimage-details-height");
		let widthElm = this.$el.find("#naimage-details-width");
		let urlElm = this.$el.find("#naimage-details-copy-link");

		let data = new FormData();
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
			success: (response) => {
				if (response.status == "success") {
					titleElm.val(response.title);
					titleElm.attr("readonly", true);
					nameElm.val(response.name);
					nameElm.attr("readonly", true);
					urlElm.val(response.url);
					heightElm.val(response.height);
					widthElm.val(response.width);
					wp.media.frame.toolbar.get().refresh();
					this.onSelection({ id: response.id, name: response.name, url: response.url });
				} else {
					e.target.disabled = false;
					alert(response.message);
				}
			},
			error: function (xhr, status, error) {
				e.target.disabled = false;
				alert(error);
			},
		});
	}
}
