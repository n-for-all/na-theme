import css from "dom-helpers/css";
import closest from "dom-helpers/closest";
import contains from "dom-helpers/contains";
import { animate, backOut } from "popmotion";
import Parallax from "./parallax";
import { counter } from "./counter";
import { Team } from "./team";

declare let ScrollMagic, TimelineMax, Linear, app, options, fullpage;

(function () {
	if (window.CustomEvent) return false;
	function CustomEvent(event, params) {
		params = params || {
			bubbles: false,
			cancelable: false,
			detail: undefined,
		};
		var evt = document.createEvent("CustomEvent");
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	//@ts-ignore
	window["CustomEvent"] = CustomEvent;
})();

class Theme {
	options: any;
	controller: any;
	scene: any;
	fullpage: any;
	sections: any;
	handler: any;
	innerScroll: any;
	headerOffset: number;
	Parallax: Parallax;
    team: Team;
	constructor(options = {}) {
		this.options = options;
		this.controller = null;
		this.scene = null;
		this.fullpage = null;
		this.sections = null;
		this.Parallax = new Parallax();
		this.team = new Team();

		let header = document.querySelector("#masthead");
		this.headerOffset = 0;
		if (header && header.classList.contains("fixed-top")) {
			this.headerOffset = header.clientHeight;
		}

		let toggles = document.querySelectorAll("[data-toggle]");
		if (toggles) {
			[].forEach.call(toggles, (toggle: HTMLAnchorElement) => {
				let elm: HTMLElement = document.querySelector(toggle.getAttribute("data-target"));
				if (elm) {
					let toggleClass = toggle.getAttribute("data-toggle") ? toggle.getAttribute("data-toggle") : "active";

					if (toggle.getAttribute("data-toggle-close")) toggle.setAttribute("data-toggle-initial", toggle.innerHTML);
					toggle.addEventListener("click", (e) => {
						e.preventDefault();
						if (elm.classList.contains(toggleClass)) {
							elm.classList.remove(toggleClass);
							toggle.setAttribute("aria-expanded", "true");
							if (toggle.getAttribute("data-toggle-close")) toggle.innerHTML = toggle.getAttribute("data-toggle-initial");
						} else {
							elm.classList.add(toggleClass);
							toggle.setAttribute("aria-expanded", "false");
							if (toggle.getAttribute("data-toggle-close")) toggle.innerHTML = toggle.getAttribute("data-toggle-close");
						}
					});
				}
			});
		}

		this.load();
	}
	load() {
		this.innerScroll = document.querySelector("#inner-scroll");
		let count: number = this.innerScroll?.children.length;

		if (this.options.scrolling && window.innerWidth > this.options.mobile) {
			var flip = false;
			var widthPercent = 100 / count;
			// console.log(this.options.scrolling);
			switch (parseInt(this.options.scrolling, 10)) {
				case 2:
					if (count > 0) {
						[].forEach.call(this.innerScroll.children, (slide) => {
							slide.style.width = widthPercent + "%";
							slide.style.height = window.innerHeight + "px";
						});

						this.innerScroll.style.width = 100 * count + "%";

						this.controller = new ScrollMagic.Controller({});
						var wipeAnimation = new TimelineMax();

						for (let i = 0; i < count; i++) {
							wipeAnimation
								.to("#inner-scroll", 0.5, {
									z: -300,
									delay: 1,
								})
								.to("#inner-scroll", 2, {
									x: "-" + widthPercent * (i + 1) + "%",
								})
								.to("#inner-scroll", 0.5, {
									z: 0,
								});
							flip = !flip;
						}

						this.scene = new ScrollMagic.Scene({
							triggerElement: ".scrolling-container--2",
							triggerHook: "onLeave",
							duration: "500%",
						})
							.setPin(".scrolling-container--2")
							.setTween(wipeAnimation)
							.addTo(this.controller);
						var _current = 0;
						var offset = 0.3; //offset in percentage
						this.scene.on("progress", function (event) {
							var v = event.progress * count + offset + 1;
							if (v > count) {
								v = count;
							}
							v = parseInt(v.toString(), 10);
							if (v != _current) {
								[].forEach.call(this.innerScroll.children, function (slide) {
									slide.classList.remove("in");
								});

								this.innerScroll.children[v].classList.add("in");
								_current = v;
							}
						});
					}
					break;
				case 3:
					if (count > 0) {
						[].forEach.call(this.innerScroll.children, (slide) => {
							slide.style.height = window.innerHeight + "px";
						});

						this.controller = new ScrollMagic.Controller({
							globalSceneOptions: {
								triggerHook: "onLeave",
							},
						});

						[].forEach.call(this.innerScroll.children, (slide) => {
							new ScrollMagic.Scene({
								triggerElement: slide,
							})
								.setPin(slide, { pushFollowers: false })
								.addTo(this.controller);
						});
					}
					break;
				case 4:
					if (count > 0) {
						this.controller = new ScrollMagic.Controller();
						// define movement of panels
						let wipeAnimation = new TimelineMax();

						let is_x = true;
						let is_negative = true;
						// create scene for every slide
						[].forEach.call(this.innerScroll.children, (slide, i) => {
							if (i == 0) {
								wipeAnimation.fromTo(
									slide,
									1,
									{
										x: "0%",
										y: 0,
									},
									{
										x: "0%",
										y: "0%",
										ease: Linear.easeNone,
									}
								);
								return;
							}
							var dir = {};
							if (is_x) {
								if (is_negative) {
									dir["x"] = "-100%";
								} else {
									dir["x"] = "100%";
								}
								is_negative = !is_negative;
							} else {
								if (is_negative) {
									dir["y"] = "-100%";
								} else {
									dir["y"] = "100%";
								}
								is_negative = !is_negative;
							}
							is_x = !is_x;
							if (i % 2 == 0 && i != 0) {
								is_x = !is_x;
							}
							wipeAnimation.fromTo(slides[i], 1, dir, {
								x: "0%",
								y: "0%",
								ease: Linear.easeNone,
							});
						});
						this.scene = new ScrollMagic.Scene({
							loglevel: 2,
							triggerElement: "#inner-scroll",
							triggerHook: "onLeave",
							duration: 100 * count + "%",
						})
							.setPin("#inner-scroll")
							.setTween(wipeAnimation)
							.addTo(this.controller);
					}
					break;
				case 5:
					var slides = document.querySelectorAll(".main-inner > section.section");
					count = slides.length;
					if (count > 0) {
						[].forEach.call(slides, function (slide) {
							slide.style.minHeight = window.innerHeight + "px";
						});
					}
					window.addEventListener("resize", function () {
						[].forEach.call(slides, function (slide) {
							slide.style.minHeight = window.innerHeight + "px";
						});
					});
					break;
				default:
					var scroll_selector = ".page-template-page-home-section #wrapper";
					var section_selector = ".section, .site-footer";

					let scrollSelector = document.querySelector(scroll_selector);
					this.sections = scrollSelector ? scrollSelector.querySelectorAll(section_selector) : null;

					if (this.sections && this.sections.length) {
						let sectionNav = document.createElement("div");
						sectionNav.classList.add("section-nav");

						let sectionInner = document.createElement("ul");
						sectionInner.classList.add("inner");

						sectionNav.appendChild(sectionInner);
						document.body.appendChild(sectionNav);

						[].forEach.call(this.sections, (section) => {
							css(section, { height: window.innerHeight + "px" });
						});

						[].forEach.call(this.sections, function (index, section) {
							let li = document.createElement("li");
							li.setAttribute("data-index", index);
							li.innerHTML = index;
							li.addEventListener("click", (e) => {
								this.fullpage?.moveTo(index + 1);
							});

							sectionInner.appendChild(li);
						});
						let sectionInnerHandler = function (index) {
							[].forEach.call(sectionInner.children, function (item, i) {
								if (i == index) {
									item.classList.add("active");
								} else {
									item.classList.remove("active");
								}
							});
						};

						var createFullPage = function (selector) {
							return new fullpage(selector, {
								sectionSelector: section_selector,
								afterLoad: function (anchorLink, index) {
									sectionInnerHandler(index - 1);
									if (index > 1) {
										setTimeout(function () {
											document.body.classList.add("scrolling");
										}, 100);
									} else {
										document.body.classList.remove("scrolling");
									}
								},
								onLeave: function (index, nextIndex, direction) {
									let section = this.sections[index - 1];
									sectionInnerHandler(nextIndex - 1);
									if (nextIndex > 1) {
										document.body.classList.add("scrolling");
									} else {
										document.body.classList.remove("scrolling");
									}
									section.classList.remove("in");
									section = this.sections[nextIndex - 1];
									section?.classList.add("in");
								},
							});
						};

						this.fullpage = createFullPage(scroll_selector);

						break;
					}
			}
		}
		this.handler = window.innerWidth > this.options.mobile ? this.desktopHandler : this.mobileHandler;
		if (window.innerWidth <= this.options.mobile) {
			document.body.classList.add("no-scrolling-style");
		}

		if ("onhashchange" in window) {
			window.addEventListener("hashchange", (event) => {
				if (this.scrollHandler()) {
					event.stopPropagation();
					event.preventDefault();
					return;
				}

				if (window.location.hash == "#!search") {
					document.body.classList.add("search-closed");
					document.body.classList.remove("search-active");

					setTimeout(function () {
						document.body.classList.remove("search-closed");
					}, 1000);

					return;
				}

				let hash = window.location.hash?.replace("#!", "").replace("#", "");
				if (hash) {
					let handler = hash.split("/");
					if (handler.length > 1) {
						if (handler[0] == "tabs") {
							this.showTab(handler[1]);
						}
						return;
					}
					let section = document.querySelector(`#${hash}`);
					if (section) {
						this.scrollIfNeeded(section);
						event.stopPropagation();
						return;
					}
				}
			});
			try {
				window.dispatchEvent(new Event("hashchange"));
			} catch (e) {}
		} else {
			var elm = document.querySelector("#menu-main-menu li a[href^=\\/\\#]");
			if (elm) {
				elm.addEventListener("click", function (event) {
					if (this.scrollHandler()) {
						event.stopPropagation();
						event.preventDefault();
					}
				});
			}
		}

		var elm = document.querySelector(".btn.btn-back");
		if (elm) {
			elm.addEventListener("click", function () {
				document.querySelector(".content").classList.remove("active");
				location.hash = "#home";
			});
		}
		var elms = document.querySelectorAll('a[href="#search"]');
		if (elms.length) {
			[].forEach.call(elms, function (elm) {
				elm.addEventListener("click", function (e) {
					e.preventDefault();
					document.body.classList.add("search-active");
					document.body.classList.remove("search-closed");
					return false;
				});
			});
		}

		var elm = document.querySelector("#searchform a.search-close");
		if (elm)
			elm.addEventListener("click", function () {
				document.body.classList.add("search-closed");
				document.body.classList.remove("search-active");
				setTimeout(function () {
					document.body.classList.remove("search-closed");
				}, 1000);
				return false;
			});

		var menuItems = document.querySelectorAll("#navbar ul li a");
		var scrollItems = document.querySelectorAll("#wrapper > section");
		window.addEventListener("resize", () => {
			if (window.innerWidth <= this.options.mobile) {
				if (this.controller) {
					if (this.scene) {
						this.scene.destroy(true);
					}
					this.controller.destroy(true);
					document.body.classList.add("no-scrolling-style");
				}
				this.handler = this.mobileHandler;
			} else {
				this.handler = this.desktopHandler;
			}
		});

		window.addEventListener("scroll", () => {
			// Get container scroll position
			var positon = this.getScrollPosition(window);
			var header = document.querySelector("#masthead");
			var offset = 0;
			if (header) {
				offset = header.clientHeight;
			}
			var fromTop = positon.y + offset + 100;

			// Get id of current scroll item
			var cur = [].map.call(scrollItems, function (item) {
				var bounds = item.getBoundingClientRect();
				if (bounds.top < fromTop) return item;
			});
			// Get the id of the current element
			cur = cur[cur.length - 1];
			var id = cur ? cur.getAttribute("id") : "";

			[].forEach.call(menuItems, function (menuItem) {
				menuItem.classList.remove("active");
			});

			var section = document.querySelector('#navbar ul li a[section="' + id + '"]');
			section && section.classList.add("active");

			if (positon.y > 100) {
				document.body.classList.add("scrolling");
			} else {
				document.body.classList.remove("scrolling");
			}
		});

		//widgets
		var elms = document.querySelectorAll(".na-posts-dropdown > a");
		if (elms.length) {
			[].forEach.call(elms, function (elm) {
				elm.addEventListener("click", function (e) {
					e.preventDefault();
					elm.parentNode.classList.remove("active");
					return false;
				});
			});
		}
		var elms = document.querySelectorAll(".wp-block-na-theme-blocks-accordion");
		if (elms.length) {
			[].forEach.call(elms, function (elm) {
				elm.addEventListener("click", function (e) {
					if (!e.target.classList.contains("block-title")) {
						return;
					}
					e.preventDefault();
					elm.classList.toggle("open");
					return false;
				});
			});
		}
		window.addEventListener("load", function () {
			document.body.classList.remove("loading");
			setTimeout(function () {
				var loadingOverlay = document.querySelector(".loading-overlay");
				document.body.classList.add("loaded");
				if (loadingOverlay && loadingOverlay.parentNode) {
					loadingOverlay.parentNode.removeChild(loadingOverlay);
				}
			}, 2000);
			var pos = window.scrollY;
			if (pos > 100) {
				document.body.classList.add("scrolling");
			}
		});

		this.sectionObserver();
		this.initCounters();

		window["naTheme"] = this;

		document.body.dispatchEvent(
			new CustomEvent("theme-ready", {
				bubbles: true,
				detail: this,
			})
		);
	}
	mobileHandler = (section) => {
		this.scrollIfNeeded(section);
		return true;
	};
	desktopHandler = (section) => {
		if (this.scene) {
			var offset = this.scene.scrollOffset();
			var index = section.getAttribute("data-index");
			if (index) {
				this.scrollTo(offset * (index + 1));
			}
			return true;
		} else if (this.fullpage && this.sections) {
			const index = [...this.sections].indexOf(section);
			if (index >= 0) this.fullpage.moveTo(index + 1);
			else {
				[].forEach.call(this.sections, (sec, index) => {
					if (contains(sec, section)) {
						this.fullpage.moveTo(index + 1);
					}
				});
			}
		} else {
			this.scrollIfNeeded(section);
		}
		return true;
	};

	scrollHandler = () => {
		var hash = location.hash;
		if (hash.replace("#!", "").trim() == "" || hash.replace("#", "").trim() == "" || hash.split("/").length > 1) {
			return false;
		}
		var newHash = hash.replace("#!", "").replace("#", "");
		if (newHash.indexOf("section-") >= 0) {
			let elm = document.querySelector("#" + newHash);
			if (elm) {
				return this.handler(elm);
			} else {
				console.warn("#" + newHash + " was not found, did you forget to enable permalinks?");
				return false;
			}
		} else {
			let section = document.querySelector("#section-" + newHash);
			if (section) {
				return this.handler(section);
			} else if (document.querySelector("#" + newHash)) {
				return this.handler(document.querySelector("#" + newHash));
			}
		}
		document.querySelector(".content")?.classList.remove("active");

		let menu_items = document.querySelector("#menu-main-menu li a");
		let menu_item = document.querySelector('#menu-main-menu li a[href^="' + this.escapeRegExp(hash) + '"]');
		if (menu_item) {
			[].forEach.call(menu_items, (item) => {
				if (item != menu_item) item.classList.remove("active");
			});
			menu_item.classList.add("active");
		} else {
			var item = document.querySelector('a[href^="' + this.escapeRegExp(hash) + '"]');
			if (item && item.hasAttribute("no-hash")) {
				location.hash = "";
			}
		}

		return null;
	};

	trigger = (element: Element | NodeListOf<Element>, eventName: string, detail: any = null) => {
		let event = null;
		if (detail) {
			event = new CustomEvent(eventName, { detail });
		} else {
			event = new Event(eventName);
		}
		if (element instanceof NodeList) {
			element.forEach((elm) => {
				elm.dispatchEvent(event);
			});
		} else {
			element.dispatchEvent(event);
		}
	};
	countDecimals = function (val) {
		if (Math.floor(val) === val) return 0;
		return val.toString().split(".")[1].length || 0;
	};

	format = (num, separator) => String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1" + separator);

	initCounters() {
		document.body.addEventListener("section.in", (e: CustomEvent) => {
			let { section } = e.detail;
			if (section) {
				let cntrs = section.querySelectorAll(".counter");
				if (!cntrs || cntrs.length == 0) {
					return;
				}
				[].forEach.call(cntrs, (cntr) => {
					if (cntr) {
						let elm = cntr.querySelector(".block-title");
						if (!elm) {
							return;
						}
						let settings = eval("(" + cntr.getAttribute("data-settings") + ")");
						let step = parseFloat(settings.step);
						let initVal = parseFloat(settings.start);
						let lastVal = parseFloat(settings.end);
						let totalDecimals = this.countDecimals(step);
						var formatOutput = (output) => {
							if (settings.seperator && settings.seperator != "") {
								output = this.format(output, settings.seperator);
							}
							return output;
						};
						var update = (progress) => {
							let output = (progress * (lastVal - initVal) + step).toFixed(totalDecimals);
							elm.innerHTML = settings.prefix + formatOutput(output) + settings.suffix;
							if (progress >= 1) {
								elm.innerHTML = settings.prefix + formatOutput(settings.end) + settings.suffix;
							}
						};

						counter(parseFloat(settings.duration), update);
					}
				});
			}
		});
		let counters = document.querySelectorAll(".counter .count");
		if (counters.length) {
			[].forEach.call(counters, (elm) => {
				let number = elm.innerHTML.match(/\d+/);
				let html = elm.innerHTML;
				if (number && number.length) {
					number.map((n) => {
						html = html.replace(n, '<span data-count="' + n + '" class="inner-counter inner-counter-' + n + '">' + n + "</span>");
					});
					elm.innerHTML = html;
				}
			});
		}
	}

	getScrollPosition = (el) => ({
		x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
		y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop,
	});

	showTab = (id) => {
		var tab: HTMLElement = document.querySelector("#" + id);
		if (tab) {
			var tabs = closest(tab, ".na-tabs");
			let tabContents = tabs.querySelectorAll(".tab-content");
			[].forEach.call(tabContents, (tabContent) => {
				tabContent.classList.remove("active");
			});
			let tabNavs = tabs.querySelectorAll(".tab-nav");
			[].forEach.call(tabNavs, (tabNav) => {
				tabNav.classList.remove("active");
			});
			setTimeout(function () {
				tab.classList.add("active");
				closest(tab, "li")?.classList.add("active");
				let nav = document.querySelector('a[href="#' + id + '"]');
				nav?.classList.add("active");
			}, 400);
		}
	};

	escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	sectionObserver = () => {
		if ("IntersectionObserver" in window) {
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.intersectionRatio > 0) {
						entry.target.classList.add("in-once");
						entry.target.classList.add("in");
						entry.target.classList.remove("out");
						this.trigger(document.body, "section.in", { section: entry.target });
						// observer.unobserve(entry.target);
					} else {
						entry.target.classList.add("out");
						entry.target.classList.remove("in");
						this.trigger(document.body, "section.out", { section: entry.target });
					}
				});
			});
			document.querySelectorAll(".section").forEach((section) => {
				if (section.getAttribute("is-observed") != "true") {
					section.setAttribute("is-observed", "true");
					observer.observe(section);
				}
			});
		}
	};

	scrollIfNeeded(elm, callback = null, offset = this.headerOffset) {
		let to = elm.offsetTop;
		this.scrollTo(to, callback, offset);
	}

	scrollTo(to, callback = null, offset = this.headerOffset) {
		let scroller = document.scrollingElement || document.body;
		if (scroller) {
			animate({
				from: scroller.scrollTop,
				to: to - offset,
				duration: 1000,
				ease: backOut,
				onUpdate: (value) => {
					scroller.scrollTop = value;
				},
				onComplete: callback,
			});
		}
	}
}

app.ready(function () {
	new Theme(options);
	try {
		var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
		if (!mac) document.body.classList.add("custom-scrollbar");
	} catch (error) {}
	setTimeout(function () {
		document.body.classList.remove("loading");
		setTimeout(function () {
			var loadingOverlay = document.querySelector(".loading-overlay");
			document.body.classList.add("loaded");
			if (loadingOverlay && loadingOverlay.parentNode) {
				loadingOverlay.parentNode.removeChild(loadingOverlay);
			}
		}, 2000);
	}, 4000);
});
