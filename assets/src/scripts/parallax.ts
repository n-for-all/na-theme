class ParallaxElement {
	isScroll: boolean;
	latestScroll: number;
	currentScroll: number;
	element: any;
	constructor(element) {
		if (!element) {
			return;
		}

		this.element = element;
		this.isScroll = false;

		this.latestScroll = 0;
		this.init();
	}

	init() {
		window.addEventListener(
			"scroll",
			() => {
				this.latestScroll = window.scrollY;
				this.checkScroll();
			},
			false
		);
	}
	checkScroll() {
		if (!this.isScroll) {
			window.requestAnimationFrame(this.update);
		}
		this.isScroll = true;
	}

	update = () => {
		this.currentScroll = this.latestScroll;
		this.isScroll = false;
		var helloScroll = this.currentScroll / 4;

		this.element.style.transform = "translate3d(0, " + helloScroll + "px, 0)";
	};

	getOffsetTop(elem) {
		var top = 0;

		do {
			top += elem.offsetTop - elem.scrollTop;
		} while ((elem = elem.offsetParent));

		return top;
	}
}

export default class Parallax {
	isScroll: boolean;
	latestScroll: number;
	currentScroll: any;
	elements: any;
	parallaxElements: any = [];
	constructor() {
		this.elements = document.querySelectorAll(".entry-header figure.entry-image");
		if (!this.elements || this.elements.length == 0) {  
			return;
		}
		this.isScroll = false;

		this.latestScroll = 0;
		var requestAnimationFrame = window.requestAnimationFrame || window["mozRequestAnimationFrame"] || window['webkitRequestAnimationFrame'] || window["msRequestAnimationFrame"];

		window.requestAnimationFrame = requestAnimationFrame;
		[].forEach.call(this.elements, (elm) => {
			this.parallaxElements.push(new ParallaxElement(elm));
		});
	}
}
