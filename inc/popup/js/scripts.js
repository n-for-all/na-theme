app.ready(function () {
	var popup = null,
		popupContent;

	var stopPropagation = function (event) {
		event.stopPropagation();
	};

	var dispatchHashchange = function () {
		if (typeof HashChangeEvent !== "undefined") {
			window.dispatchEvent(new HashChangeEvent("hashchange"));
			return;
		}

		// HashChangeEvent is not available on all browsers. Use the plain Event.
		try {
			window.dispatchEvent(new Event("hashchange"));
			return;
		} catch (error) {
			// but that fails on ie
		}

		// IE workaround
		const ieEvent = document.createEvent("Event");
		ieEvent.initEvent("hashchange", true, true);
		window.dispatchEvent(ieEvent);
	};

	var onClose = function (event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		popup.classList.remove("active");
		window.location.hash = "#!";
		document.body.classList.remove("na-popup-active");
	};

	function showPopup(id) {
		popup = document.querySelector("#popup-" + id);
		popupContent = popup.querySelector(".popup-content");
		popupContent.style.maxHeight = window.innerHeight - 40 + "px";
		popup.classList.add("active");

		popup.addEventListener("scroll", stopPropagation);
		popup.addEventListener("mousewheel", stopPropagation);
		popup.addEventListener("DOMMouseScroll", stopPropagation);

		document.body.classList.add("na-popup-active");

		var close = popup.querySelector(".close-popup");
		if (close) {
			close.addEventListener("click", onClose);
		}
	}

	function showPopupAjax(id, element) {
		popup = document.querySelector("#popup-" + id);
		if (!popup) {
			var _class = "";
			if (element) {
				_class = element.getAttribute("popup-class");
			}

			popup = document.createElement("div");
			popup.setAttribute("id", "popup-" + id);
			popup.setAttribute("id", "popup " + _class);

			popup.innerHTML = '<div class="popup-content"></div>';

			var close = document.createElement("a");
			close.classList.add("close-popup");
			close.href = "#";
			close.innerHTML = "&times;";
			close.addEventListener("click", onClose);

			popup.appendChild(close);

			var popupContent = document.createElement("div");
			popupContent.classList.add("popup-content");
			popupContent.style.maxHeight = window.innerHeight - 40 + "px";

			popup.appendChild(popupContent);
			document.body.appendChild(popup);
		} else {
			popupContent = popup.querySelector(".popup-content");
			popupContent.style.maxHeight = window.innerHeight - 40 + "px";
			var close = popup.querySelector(".close-popup");
			if (close) {
				close.addEventListener("click", onClose);
			}
		}

		var formData = new FormData();

		formData.append("action", "popup");
		formData.append("id", id);

		fetch(PopupSettings.url, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((result) => {
				if (result && result.status == "success") {
					var post_template = wp.template("popup");
					if (document.querySelector("#tmpl-popup-" + result.post.type)) {
						post_template = wp.template("popup-" + result.post.type);
					}
					popupContent.html(post_template(result.post));
					document.body.classList.add("na-popup-active");
					popup.classList.add("active");
				} else {
					onClose();
				}
			})
			.catch((error) => {
				console.error(error);
				onClose();
			});

		return false;
	}

	window.addEventListener("hashchange", function (e) {
		var hash = window.location.hash.replace(/^#!/, "");
		if (hash) {
			var path = hash.split("/");
			if (path[0] == "popup") {
				if (path[1] == "load") {
					showPopupAjax(path[2], document.querySelector('a[href="' + window.location.hash + '"]'));
				} else {
					showPopup(path[1]);
				}
			}
		}
	});

	document.addEventListener("keydown", function (event) {
		if (popup && event.keyCode == 27) {
			event.preventDefault();
			event.stopPropagation();
			onClose();
		}
	});
	window.addEventListener("resize", function (event) {
		if (popupContent) {
			popupContent.style.maxHeight = window.innerHeight - 40 + "px";
		}
	});

	if (!("onhashchange" in window)) {
		dispatchHashchange();
	}
});
