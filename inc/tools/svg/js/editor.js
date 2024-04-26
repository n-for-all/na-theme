if (wp.media && wp.media.view.Attachment && wp.media.view.Attachment.Details && wp.media.view.Attachment.Details.TwoColumn) {
	wp.media.view.Attachment.Details.TwoColumn = wp.media.view.Attachment.Details.TwoColumn.extend({
		editAttachment: function (event) {
			if (event) {
				event.preventDefault();
			}
			var element = this.$el.find("img.details-image");
			if (element) {
				var ext = element.attr("src").substr(-4, 4);
				if (ext.toLowerCase() != ".svg") {
					this.controller.content.mode("edit-image");
					return;
				}
				var div = document.createElement("textarea");
				div.style.width = "100%";
				div.style.height = "100%";
				div.style.backgroundImage = "none";
				div.style.backgroundColor = "#f8f8f8";
				div.classList.add("details-image", "code-editor");
				element.hide();
				element.parent().prepend(div);
				this.$el.find("button.edit-attachment").hide();
				var actions = this.$el.find("div.attachment-actions");
				if (actions) {
					var button = document.createElement("button");
					button.classList.add("button");
					button.innerHTML = "Save SVG";
					var _this = this;
					button.addEventListener("click", function (e) {
						e.preventDefault();
						wp.apiFetch({
							method: "POST",
							path: "/wp/v2/svg/" + _this.model.id,
							data: { content: div.value },
						})
							.then(function (response) {
								alert(response.message);
							})
							.catch(function (error) {
								alert("Error: " + error.message);
							});
					});
					actions.append(button);
				}
				fetch(element.attr("src"))
					.then(function (response) {
						return response.text();
					})
					.then(function (text) {
						div.value = text;
					})
					.catch(function (error) {
						alert("Error: " + error.message);
					});
			}
		},
	});
}
if (wp.media && wp.media.view.EditImage) {
	wp.media.view.EditImage = wp.media.view.EditImage.extend({
		loadEditor: function () {
			var element = this.$el;
			if (element) {
				var ext = this.model.attributes.url.substr(-4, 4);
				if (ext.toLowerCase() != ".svg") {
					this.editor.open(this.model.get("id"), this.model.get("nonces").edit, this);
					return;
				}
				var div = document.createElement("textarea");
				div.style.width = "100%";
				div.style.height = "100%";
				div.style.backgroundImage = "none";
				div.style.backgroundColor = "#f8f8f8";
				div.classList.add("details-image", "code-editor");
				element.css({
					height: "100%",
					display: "flex",
					"flex-direction": "column",
					padding: "1rem",
					"box-sizing": "border-box",
				});
				element.append(div);
				element.append(document.createElement("hr"));

				var button = document.createElement("button");
				button.classList.add("button", "button-primary");
				button.style.marginRight = "auto";
				button.innerHTML = "Save SVG";
				var _this = this;
				button.addEventListener("click", function (e) {
					e.preventDefault();
					wp.apiFetch({
						method: "POST",
						path: "/wp/v2/svg/" + _this.model.id,
						data: { content: div.value },
					})
						.then(function (response) {
							alert(response.message);
						})
						.catch(function (error) {
							alert("Error: " + error.message);
						});
				});
				element.append(button);

				fetch(this.model.attributes.url)
					.then(function (response) {
						return response.text();
					})
					.then(function (text) {
						div.value = text;
					})
					.catch(function (error) {
						alert("Error: " + error.message);
					});
			}
		},
	});
}
