declare let TeamSettings: any, wp: any;
import { animate, backOut } from "popmotion";

export class Team {
	last = null;
	constructor() {
		document.addEventListener("keydown", (event) => {
			if (event.key == "27") {
				event.preventDefault();
				window.location.hash = "#!";
			}
		});
		window.addEventListener("hashchange", (e) => {
			var hash = window.location.hash.replace(/^#!/, "");
			if (hash) {
				var path = hash.split("/");
				if (path[0] == "team-member") {
					this.show(path[1]);
				} else if (path[0] == "team") {
					this.filter(path[1]);
				}
			}
		});
	}
	filter(term_id) {
		let current = document.querySelector('a[href="' + window.location.hash + '"]');
		if (current) {
			current.classList.add("active");
			let closest = this.closest(current, ".na-team-wrapper");
			if (closest) {
				let listItems = closest.querySelectorAll("ul.na-team>li");

				if (listItems && listItems.length) {
					[].forEach.call(listItems, (listItem) => {
						let data = listItem.querySelector("a[data-terms]");
						if (!data) {
							return;
						}
						let terms = data.getAttribute("data-terms");
						let mterms = terms.split(",");
						if (mterms.indexOf(term_id) >= 0) {
							listItem.classList.remove("hidden");
							animate({
								from: 0,
								to: 1,
								duration: 1000,
								ease: backOut,
								onUpdate: (value) => {
									listItem.style.opacity = value;
								},
								onComplete: () => {},
							});
						} else {
							animate({
								from: 1,
								to: 0,
								duration: 100,
								ease: backOut,
								onUpdate: (value) => {
									listItem.style.opacity = value;
								},
								onComplete: () => {
									listItem.classList.add("hidden");
								},
							});
						}
					});
				}
			}
			let all = document.querySelectorAll('a[href^="#!team/"]');
			if (all && all.length) {
				[].forEach.call(all, (elm) => {
					if (current != elm) {
						elm.classList.remove("active");
					}
				});
			}
		}
	}
	show(id) {
		let data = new FormData();
		data.append("action", "team_member");
		data.append("id", id);
		document.body.classList.add("na-team-active");
		fetch(TeamSettings.url, {
			method: "POST", // or 'PUT'
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: data,
		})
			.then((response) => response.json())
			.then((result) => {
				if (result && result.status == "success") {
					var post_template = wp.template("team-member");
					let div = document.createElement("div");
					div.setAttribute("id", "na-team-member-template");

					let close = document.createElement("a");
					close.setAttribute("class", "close-team");
					close.addEventListener("click", (e) => {
						e.preventDefault();
						document.querySelector("#na-team-member-template").remove();
						document.body.classList.remove("na-team-active");

						window.location.hash = "#!";
					});
					close.href = "#";

					div.innerHTML = post_template(result.post);
					div.appendChild(close);
					div.style.display = "block";
				} else {
					document.body.classList.remove("na-team-active");
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				window.location.hash = "#!";
				document.body.classList.remove("na-team-active");
			});

		return false;
	}
	closest(el, selector) {
		var matchesFn;

		// find vendor prefix
		["matches", "webkitMatchesSelector", "mozMatchesSelector", "msMatchesSelector", "oMatchesSelector"].some(function (fn) {
			if (typeof document.body[fn] == "function") {
				matchesFn = fn;
				return true;
			}
			return false;
		});

		var parent;

		// traverse parents
		while (el) {
			parent = el.parentElement;
			if (parent && parent[matchesFn](selector)) {
				return parent;
			}
			el = parent;
		}

		return null;
	}
}
