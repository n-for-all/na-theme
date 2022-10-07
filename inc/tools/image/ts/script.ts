import "whatwg-fetch";
import { MediaFrame } from "./media";

class AjaxyPasteimage {
	tippy: any;
    MediaFrame: MediaFrame;
	constructor() {
		this.ready(() => {
            this.handleWpMedia();
		});
	}

	closest(el, tag) {
		tag = tag.toUpperCase();
		do {
			if (el.nodeName === tag) {
				return el;
			}
		} while ((el = el.parentNode));

		return null;
	}

	ready(fn) {
		if (document.readyState != "loading") {
			fn();
		} else {
			document.addEventListener("DOMContentLoaded", fn);
		}
	}

	on(eventType, className, cb) {
		document.addEventListener(
			eventType,
			function (event) {
				var el = event.target,
					found;

				while (el && !(found = el.id === className || el.classList.contains(className.replace(".", "")))) {
					el = el.parentElement;
				}

				if (found) {
					cb.call(el, event);
				}
			},
			false
		);
	}

	encodeQueryString(params) {
		const keys = Object.keys(params);
		return keys.length ? "?" + keys.map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])).join("&") : "";
	}

	handleWpMedia() {
		this.MediaFrame = new MediaFrame();
	}
}

window["AjaxyPasteimage"] = new AjaxyPasteimage();
