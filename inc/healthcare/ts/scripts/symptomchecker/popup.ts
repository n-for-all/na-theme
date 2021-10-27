function dispatchHashchange() {
	if (typeof HashChangeEvent !== 'undefined') {
		window.dispatchEvent(new HashChangeEvent('hashchange'));
		return;
	}
	try {
		window.dispatchEvent(new Event('hashchange'));
	} catch (error) {
		// IE workaround
		const ieEvent = document.createEvent('Event');
		ieEvent.initEvent('hashchange', true, true);
		window.dispatchEvent(ieEvent);
	}
}

class Popup {
	element: HTMLElement;
	contentElement: HTMLElement;
	handle: HTMLElement;
	constructor(element: HTMLElement, name) {
		this.element = element;
		if (!element) {
			return;
		}
		let isClosable = false;
		if (!this.element.classList.contains('popup')) {
			this.element = this.wrap([this.element]);
			this.element.classList.add('popup');
			if (name) this.element.classList.add(`popup-${name}`);
			isClosable = this.element.getAttribute('closable') ? true : false;
			document.body.appendChild(this.element);
		}

		let innerElements = [].map.call(this.element.children, (child) => {
			if (child && child.tagName == 'A' && child.classList.contains('close-popup')) {
				this.handle = child;
			} else if (child && child.tagName == 'DIV' && child.classList.contains('content')) {
				this.contentElement = child;
			} else {
				return child;
			}
			return null;
		});
		if (!this.handle) {
			this.handle = document.createElement('a');
			this.handle.innerHTML = '&times;';
			this.handle.classList.add('close-popup');
		}
		if (!this.contentElement) {
			this.contentElement = this.wrap(innerElements);
			this.contentElement.classList.add('content');
			let wrapper = document.createElement('div');
			wrapper.classList.add('inner-content');
			wrapper.appendChild(this.contentElement);
			wrapper.appendChild(this.handle);
			this.element.appendChild(wrapper);
		}
		if (isClosable) {
			this.contentElement.addEventListener('click', this.stopPropagation);
			this.element.addEventListener('click', (e) => {
				this.hide();
				window.location.hash = '#!';
			});
		}
		this.handle.addEventListener('click', (e) => {
			e.preventDefault();
			window.location.hash = '#!';
			this.hide();
		});
	}
	allowPropagation() {
		this.contentElement.removeEventListener('click', this.stopPropagation);
	}
	stopPropagation(e) {
		e.stopPropagation();
	}

	hide() {
		this.element.classList.remove('active');
		let iframes = this.element.querySelectorAll('iframe');
		if (iframes.length) {
			[].forEach.call(iframes, (iframe) => {
				let src = iframe.src;
				iframe.src = '';
				iframe.src = src;
				// setTimeout(() => {
				// 	iframe.src = src;
				// }, 50);
			});
		}
		return this;
	}

	show() {
		this.element.classList.add('active');
		return this;
	}

	setLoading(loading) {
		if (loading) this.element.classList.add('loading');
		else this.element.classList.remove('loading');
	}

	wrap(els: Array<HTMLElement>) {
		let wrapper = document.createElement('div');
		[].forEach.call(els, (el) => {
			wrapper.appendChild(el);
		});
		return wrapper;
	}
}
class PopupCollection {
	overlay: any;
	elements: any;
	popups: object = {};
	constructor(elements: string | Array<HTMLElement>) {
		// @ts-ignore
		this.elements = this.isString(elements) ? document.querySelectorAll(elements) : elements;
		this.overlay = document.createElement('SPAN');
		this.overlay.classList.add('popup-overlay');
		if (this.elements && this.elements.length) {
			document.body.appendChild(this.overlay);
			[].forEach.call(this.elements, (child) => {
				let name = child.getAttribute('data-popup');
				if (!name) {
					console.warn('Popup must have a data-popup="_NAME_" attribute');
					return;
				}
				this.popups[name] = new Popup(child, name);
				child.removeAttribute('data-popup');
			});
		}

		window.addEventListener(
			'hashchange',
			(e) => {
				if (window.location.hash.indexOf('#!') == 0) {
					e.preventDefault();
				}
				let hash = window.location.hash ? window.location.hash.replace('#!', '').split('/') : [];
				this.hide();
				if (hash[0] == 'popup') {
					let callback = () => {
						if (hash[1] && hash[1] != '' && this.popups[hash[1]]) {
							this.showOverlay();
							return this.popups[hash[1]].show();
						}
					};
					callback();
				}
				this.hideOverlay();
			},
			false
		);
		window.addEventListener('load', (e) => {
			if (window.location.hash.indexOf('#!popup') >= 0) {
				dispatchHashchange();
			}
		});
	}

	showOverlay() {
		if (!this.overlay) {
			return;
		}
		document.body.classList.add('popup-active');
		this.overlay.classList.add('active');
		this.overlay.style.opacity = 1;
	}
	hideOverlay() {
		if (!this.overlay) {
			return;
		}
		this.overlay.addEventListener(
			'transitionend',
			(e) => {
				document.body.classList.remove('popup-active');
				this.overlay.classList.remove('active');
			},
			{
				capture: false,
				once: true,
				passive: false,
			}
		);
		this.overlay.addEventListener('click', (e) => {
			document.body.classList.remove('popup-active');
			this.overlay.classList.remove('active');
		});
		this.overlay.style.opacity = 0;
	}

	hide() {
		for (let key in this.popups) {
			if (this.popups.hasOwnProperty(key) && this.popups[key] instanceof Popup) {
				this.popups[key].hide();
			}
		}
	}
	isString(v) {
		return typeof v === 'string' || v instanceof String;
	}
}

export { PopupCollection, Popup };
