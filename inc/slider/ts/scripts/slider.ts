import { YouTube } from "youtube";

declare var window: Window & typeof globalThis, Hammer: any;

class NaSliderData {
	set(element, key, value) {
		if (!window["_storage"]) {
			window["_storage"] = [];
		}
		window["_storage"].push({ key, value, element });
	}
	get(element, key) {
		if (!window["_storage"] || window["_storage"].length == 0) {
			return false;
		}
		let i = 0;
		for (i = 0; i < window["_storage"].length; i++) {
			if (window["_storage"][i].element == element && window["_storage"][i].key == key) {
				return window["_storage"][i].value;
			}
		}
		return null;
	}
	delete(element, key) {
		if (!window["_storage"] || window["_storage"].length == 0) {
			return false;
		}
		let i = 0;
		for (i = 0; i < window["_storage"].length; i++) {
			if (window["_storage"][i].element == element && window["_storage"][i].key == key) {
				delete window["_storage"][i];
			}
		}
		return null;
	}
}

class NaSliderBullets {
	slider: NaSlider;
	bullets: any;
	constructor(slider: NaSlider, pagination = 0, columns = 1, initial = 0) {
		this.slider = slider;
		if (!this.slider) {
			return;
		}

		this.bullets = this.slider.getElement().querySelector("bullets");
		if (this.bullets) {
			this.load(pagination, columns, initial);
		}
	}

	load(pagination, columns, initial) {
		let slides = this.slider.getSlides();
		let total = slides.length;
		if (pagination == 1) {
			total = Math.ceil(slides.length / columns);
		} else {
			total = slides.length - (columns - 1);
		}
		let totalArray = new Array(total);
		[...totalArray].map((_, index) => {
			let span = document.createElement("span");
			this.bullets.appendChild(span);
			span.addEventListener("click", (e) => {
				e.preventDefault();
				this.slider.pause = true;
				this.slider.to(index);
				this.update(index);
			});
		});
		this.update(initial);
	}

	update(index) {
		if (!this.bullets) {
			return;
		}
		[].forEach.call(this.bullets.children, (item, i) => {
			if (index == i) {
				item.classList.add("active");
			} else {
				item.classList.remove("active");
			}
		});
	}

	public setActive(index) {
		this.update(index);
	}
}
class NaSliderNavigation {
	slider: NaSlider;
	current: any = 0;
	columns: number = 1;
	sliderElement: any;
	pagination: number;
	loop: boolean;
	bullets: NaSliderBullets;
    infinite: boolean;
	onCreate: (index: number) => void;
	total: number;
	constructor(slider: NaSlider, pagination = 0, columns = 1, initial = 0, loop = false, infinite = false, onCreate = (index: number) => {}) {
		this.slider = slider;
        this.onCreate = onCreate;
		if (!this.slider) {
			return;
		}
		this.loop = loop;
        this.infinite = infinite;
		this.sliderElement = this.slider.getElement();
		this.columns = columns;
		this.current = initial;
		this.pagination = pagination;
        this.total = this.slider.getTotalSlides();

		this.bullets = new NaSliderBullets(slider, pagination, columns, initial);
		let prev = this.slider.getElement().querySelector('.na-slider-actions.prev, [action="prev"]');
		let next = this.slider.getElement().querySelector('.na-slider-actions.next, [action="next"]');

		if (prev) {
			prev.addEventListener("click", (e) => {
				e.preventDefault();
				this.prev();
			});
		}
		if (next) {
			next.addEventListener("click", (e) => {
				e.preventDefault();
				this.next();
			});
		}
	}
	prev() {
		if (this.pagination == 1) {
			this.prevPage();
			return;
		}
		if (this.current > 0) {
			this.to(this.current - 1);
		}
	}
	next() {
		if (this.pagination == 1) {
			this.nextPage();
			return;
		}
		if (this.current < this.slider.getTotalSlides() - this.columns) {
			this.to(this.current + 1);
		} else if (this.infinite) {
			this.onCreate((this.current + 1) % this.total);
			this.to(this.current + 1);
		} else if (this.loop) {
			this.slider.fade = true;
			this.to(0);
		}
	}
	prevPage() {
		if (this.current > 0) {
			var index = this.current - 1;
			this.to(index);
		}
	}
	nextPage() {
		if (this.current < this.slider.getTotalSlides() - this.columns) {
			this.to(this.current + 1);
		}
	}

	navClass() {
		if (this.current >= this.slider.getTotalSlides() - this.columns) {
			this.sliderElement.classList.add("na-no-next");
		} else {
			this.sliderElement.classList.remove("na-no-next");
		}
		if (this.current == 0) {
			this.sliderElement.classList.add("na-no-prev");
		} else {
			this.sliderElement.classList.remove("na-no-prev");
		}
	}

	to(i) {
		let index = i;
		if (this.pagination == 1) {
			index = i * this.columns;
			if (i > this.slider.getTotalSlides() / this.columns || i < 0) {
                if (i < 0) {
					return;
				}
				return;
			}
		}

		this.slider.setCurrentSlide(index, true, true);
		this.current = i;
		this.bullets.setActive(i);
		this.navClass();
	}

	getCurrent() {
		return this.current;
	}

	getCurrentIndex() {
		return this.pagination == 1 ? this.current * this.columns : this.current;
	}
}

class NaSlider {
	inner: HTMLElement = null;
	element: HTMLElement;

	settings: any = null;
	slide: any = {
		height: 0,
		width: 0,
	};
	slider: any = {
		scroller: null,
		transform: null,
		width: 0,
		element: null,
	};
	columns: number = 1;
	cInterval: any = null;
	fade: boolean = false;
	pause: boolean = false;
	current: number = 0;
	scroll: boolean = false;
	slides = [];
	
	innerSlider: any;
	navigation: NaSliderNavigation;
	data: NaSliderData;
	animationframe: number;
	resizeObserver: ResizeObserver;
    private _stop: boolean = false;
	private _fpsTime: number = 0;
	/**
	 * __construct
	 */
	public constructor(selector, settings?) {
		this.element = this.isString(selector) ? document.querySelector(selector) : selector;
		if (this.element) {
			if (!settings) {
				settings = this.element.getAttribute("data-settings");
			}

			this.data = new NaSliderData();
			this.data.set(this.element, "na-slider", this);
			this.initialize(settings);
		}
	}

	autoplay = (autoplay, delay = 3000) => {
		let xf = () => {
			setInterval(() => {
				if (this._stop) {
					return;
				}
				if (!this.pause) {
					this.next();
				}
				this.pause = false;
			}, autoplay * 1000);
		};
		setTimeout(() => {
			xf();
		}, delay);
	};

	stop(): void {
		this._stop = true;
	}
	continue(): void {
		this._stop = false;
	}
	initialize(settings) {
		var defaults = {
			type: "normal",
			pagination: 0,
			initial: 0,
            loop: 1,
			infinite: 0,
			columns: 1,
			autoplay: 0,
			vertical: 0,
			minWidth: 200,
			height: "auto",
			class: "",
			sync: "",
		};
		this.settings = { ...defaults, ...settings };
		this.columns = parseInt(this.settings.columns, 10);

		this.inner = this.element.querySelector(".na-slider") || document.createElement("div");
		this.inner.classList.add("na-slider");

		if (this.settings.class != "") {
			this.inner.classList.add(...this.settings.class.split(" "));
		}

		this.innerSlider = this.inner.querySelector("ul.na-slides") || document.createElement("ul");
		this.innerSlider.classList.add("na-slides");

		let slides = this.element.querySelectorAll("slide, li.na-slide");

		if (!slides || slides.length == 0) {
			return;
		} else {
			[].forEach.call(slides, (slide) => {
				if (slide.tagName == "LI") {
					this.slides.push(slide);
					return;
				}

				this.slides.push(this.replicateSlide(slide));
				slide.parentNode.removeChild(slide);
			});
		}

		this.inner.appendChild(this.innerSlider);

		this.element.prepend(this.inner);
		if (this.settings.autoplay > 0 && this.slides.length > 1) {
			this.autoplay(this.settings.autoplay);
		}

		if (this.slides.length >= 1) {
			if (this.settings.columns > this.slides.length) {
				this.settings.columns = this.slides.length;
			}
			this.events();
			this.load();
			this.draw();
			this.visibility();
			this.to(this.settings.initial);
		}

		setTimeout(() => {
			this.element.dispatchEvent(new Event("ready"));
			let resizeElement = this.settings.height == "100%" || this.settings.height == "auto" ? window : this.element;
			this.onResizeElem(resizeElement, () => {
				this.load(true);
			});
		}, 100);
	}
	maxHeight() {
		var h = 0; 
		this.slides.forEach((slide) => {
            slide.style.minHeight = "0";
			if (slide.clientHeight > h) {
				h = slide.clientHeight;
			}
		});
		return h / this.columns + 15;
	}
	load(preserveIndex = false) {
		this.trigger(this.element, "load", [this.element, this.settings]);
		this.columns = parseInt(this.settings.columns, 10);

		const { height, width } = this.calculateDimensions();
		/////

		////
		var slider: HTMLElement = this.innerSlider;

		if (this.settings.vertical == 1) {
			this.inner.style.height = height * this.columns + "px";
			slider.style.height = Math.ceil(this.slides.length * height) + "px";
		} else {
			this.inner.style.width = width * this.columns + "px";
			slider.style.width = Math.ceil(this.slides.length * width) + "px";
		}

		slider.style.marginLeft = "0px";

		this.slider.transform = slider;
		this.slider.scroller = this.inner;
		this.slider.width = Math.ceil(this.columns * width);

		this.adjustSlide();

		if (!this.navigation) {
			this.navigation = new NaSliderNavigation(
				this,
				this.settings.pagination,
				this.columns,
				this.settings.initial,
				this.settings.loop,
				this.settings.infinite,
				(index) => {
					let slide = this.slides[index];
					this.slides.push(this.replicateSlide(slide, true));

					if (this.settings.vertical == 1) {
						slider.style.height = Math.ceil(this.slides.length * height) + "px";
					} else {
						slider.style.width = Math.ceil(this.slides.length * width) + "px";
					}
				}
			);
		}

		if (!preserveIndex) {
			this.current = 0;
			this.to(this.settings.initial);
		} else {
			this.to(this.current);
		}

		//trigger the events, this can be used to create thumbnail slider
		this.trigger(this.element, "load-slides", [this.slides, this.current]);
	}

	replicateSlide(slide, clone = false) {
		let li = document.createElement("li");
		this.cloneAttributes(slide, li);
		this.innerSlider.appendChild(li);

		let i = 0;
		while (i < slide.children.length) {
			let child = slide.children[i];
			li.appendChild(clone ? child.cloneNode(true) : child);
			if (li.hasAttribute("data-youtube-video")) {
				li["_youtube_video"] = new YouTube(li.getAttribute("data-youtube-video"), li);
			}
			i++;
		}
		return li;
	}

	calculateDimensions() {
		var height = 0;
		let offsetHeader = window["naTheme"]?.headerOffset ? (window["naTheme"]?.headerOffset ? window["naTheme"]?.headerOffset : 0) : 0;
		switch (this.settings.height) {
			case "auto":
				height = this.maxHeight();
				break;
			case "100%":
				height = window.innerHeight - offsetHeader;
				break;
			default:
				if (this.settings.height.indexOf("%") > 0) {
					if (this.settings.height.indexOf("w") == 0) {
						height = Math.floor((parseInt(this.settings.height.replace("%", "").replace("w", ""), 10) / 100) * window.outerWidth);
					} else {
						height = Math.floor((parseInt(this.settings.height.replace("%", ""), 10) / 100) * this.element.clientWidth);
					}
				} else if (this.settings.height.indexOf("vh") > 0) {
					height = Math.floor((parseInt(this.settings.height.replace("vh", ""), 10) / 100) * window.innerHeight);
				} else {
					height = this.settings.height.replace("px", "");
				}
				break;
		}
		var width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
		if (this.settings.minWidth > 0 && this.columns > 1) {
			while (width < this.settings.minWidth) {
				this.columns = this.columns - 1;
				width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
			}
			if (this.columns == 0) {
				this.columns = 1;
				width = Math.round(((this.element.clientWidth / this.columns) * 10) / 10);
			}
		}
		return { height, width };
	}

	adjustSlide() {
		const { height, width } = this.calculateDimensions();

		let styles = {};
		this.slide = {
			height: height,
			width: width,
		};
		if (this.settings.vertical) {
			styles = { ...styles, minHeight: height + "px" };
		} else {
			styles = { ...styles, width: width + "px" };
			if (this.settings.height != "auto") {
				styles = { ...styles, minHeight: height + "px" };
			}
		}

		this.css(this.slides, styles);
	}

	css(elements, css: Object) {
		elements.forEach((elm) => {
			for (let i in css) {
				elm.style[i] = css[i];
			}
		});
	}

	prev() {
		this.navigation.prev();
	}

	setCurrentSlide(index, scroll = true, pause = true) {
		this.scroll = scroll;
		this.current = index;
		this.pause = pause;
	}

	to(i) {
		this.navigation.to(i);
	}

	get = (i) => {
		return this.slides[i];
	};

	getElement = () => {
		return this.element;
	};

	getSlides = () => {
		return this.slides;
	};

	getTotalSlides() {
		return this.slides.length;
	}

	next() {
		this.navigation.next();
	}

	prevPage() {
		this.navigation.prevPage();
	}
	nextPage() {
		this.navigation.nextPage();
	}

	draw = () => {
		this.animationframe = window.requestAnimationFrame(this.draw);

		let fpsInterval = 5;
		let now = Date.now();
		let elapsed = now - this._fpsTime;

		if (elapsed > fpsInterval) {
			this._fpsTime = now - (elapsed % fpsInterval);

			if (!this.scroll) {
				return;
			}
			var transforms = {
				webkitTransform: "-webkit-transform",
				OTransform: "-o-transform",
				msTransform: "-ms-transform",
				MozTransform: "-moz-transform",
				transform: "transform",
			};

			if (this.fade) {
				this.element.classList.add("fade-slider");
				setTimeout(() => {
					setTimeout(() => {
						this.element.classList.remove("fade-slider");
					}, 300);
				}, 200);
				this.fade = false;

				return;
			}
			if (this.settings.vertical == 1) {
				for (var t in transforms) {
					this.slider.transform.style[t] = "translate3d(0px," + -1 * this.slide.height * this.current + "px,0px)";
				}
			} else {
				for (var t in transforms) {
					this.slider.transform.style[t] = "translate3d(" + -1 * this.slide.width * this.current + "px,0px,0px)";
				}
			}

			this.visibility();
			this.scroll = false;
		}
	};
	events() {
		var mousePosition = {
			clientX: 0,
			clientY: 0,
		};

		var keyhandle = false;
		this.element.addEventListener("mouseover", function (mouseMoveEvent) {
			mousePosition.clientX = mouseMoveEvent.pageX;
			mousePosition.clientY = mouseMoveEvent.pageY;
			keyhandle = true;
		});
		this.element.addEventListener("mouseout", () => {
			keyhandle = false;
		});

		document.addEventListener("keydown", (event) => {
			var divRect = this.element.getBoundingClientRect();
			if (
				mousePosition.clientX >= divRect.left &&
				mousePosition.clientX <= divRect.right &&
				mousePosition.clientY >= divRect.top &&
				mousePosition.clientY <= divRect.bottom &&
				keyhandle
			) {
				// Mouse is inside element.
				event.preventDefault();
				if (event.keyCode == 38 || event.keyCode == 37) {
					this.prev();
					return false;
				} else if (event.keyCode == 40 || event.keyCode == 39) {
					this.next();
					return false;
				}
			}
			return true;
		});

		if (typeof Hammer != undefined) {
			var hammertime = new Hammer(this.element, {});
			hammertime.on("swipe", (ev) => {
				if (ev.direction == Hammer.DIRECTION_LEFT) {
					this.pause = true;
					this.next();
				}
				if (ev.direction == Hammer.DIRECTION_RIGHT) {
					this.pause = true;
					this.prev();
				}
			});
		}

		this.slides.forEach((slide, index) => {
			slide.addEventListener("click", () => {
				this.trigger(this.element, "click-slide", [index, slide]);
			});

			slide.addEventListener("mouseover", () => {
				this.pause = true;
				return false;
			});
			slide.addEventListener("mouseleave", () => {
				this.pause = false;
				return false;
			});
		});

		if (this.settings.sync && this.settings.sync != "") {
			setTimeout(() => {
				let sync_slider = document.querySelector("#" + this.settings.sync);
				if (sync_slider) {
					var slider = this.data.get(sync_slider, "na-slider");
					if (!slider) {
						return;
					}
					//@ts-ignore
					this.element.addEventListener("active-slide", ((event: CustomEvent) => {
                        let index = event.detail[0];
						if (slider && slider.active() != index) slider.to(index);
						return false;
					}) as EventListener);
					//@ts-ignore
					sync_slider.addEventListener("active-slide", ((event: CustomEvent) => {
                        let index = event.detail[0];
						if (this.navigation.getCurrent() != index) this.to(index);
						return false;
					}) as EventListener);
					//@ts-ignore
					sync_slider.addEventListener("click-slide", ((event: CustomEvent) => {
                        let index = event.detail[0];
						if (this.navigation.getCurrent() != index) this.to(index);
						return false;
					}) as EventListener);
				}
			}, 1000);
		}
	}
	visibility() {
		let index = this.navigation.getCurrentIndex();
		var range = [index, index + this.columns - 1];
		this.slides.forEach((slide, index) => {
			slide.classList.remove("before", "after", "visible");
			slide.classList.add("na-slide");
			if (index >= range[0] && index <= range[1]) {
				slide.classList.add("visible");
			} else {
				slide.classList.remove("visible");
			}
			if (index == range[1] + 1) {
				slide.classList.add("after");
			}
			if (index == range[0] - 1) {
				slide.classList.add("before");
			}
		});
	}

	onResizeElem(element, callback) {
		if (!element) {
			return;
		}
		var onResizeElem = {};
		// Save the element we are watching
		onResizeElem["watchedElementData"] = {
			element: element,
			offsetWidth: element.offsetWidth || element.innerWidth,
			offsetHeight: element.offsetHeight || element.innerHeight,
			callback: callback,
		};

		onResizeElem["checkForChanges"] = function () {
			const data = onResizeElem["watchedElementData"];
			let width = data.element.offsetWidth || data.element.innerWidth;
			let elmWidth = data.offsetWidth || data.innerWidth;
			let height = data.element.offsetHeight || data.element.innerHeight;
			let elmHeight = data.offsetHeight || data.innerHeight;

			if (width !== elmWidth || height !== elmHeight) {
				data.offsetWidth = width;
				data.offsetHeight = height;
				data.callback();
			}
		};

		if ("ResizeObserver" in window) { 
			let prevWidth = 0;
			this.resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const width = entry.borderBoxSize?.[0].inlineSize;
					if (typeof width === "number" && width !== prevWidth) {
						prevWidth = width; 
						callback();
					}
				}
			});

			this.resizeObserver.observe(this.element);
		}

		// Listen to the window resize event
		window.addEventListener("resize", onResizeElem["checkForChanges"]);
	}

	trigger(element: Element | NodeListOf<Element>, eventName: string, detail: any = null) {
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
	}

	isString(obj) {
		const type = typeof obj;
		return (
			type == "string" || (type == "object" && obj != null && !Array.isArray(obj) && Object.prototype.toString.call(obj) === "[object String]")
		);
	}

	cloneAttributes(from: HTMLElement, to: HTMLElement) {
		let attr;
		let attributes = Array.prototype.slice.call(from.attributes);
		while ((attr = attributes.pop())) {
			to.setAttribute(attr.nodeName, attr.nodeValue);
		}
	}
}

window["NaSlider"] = NaSlider;
