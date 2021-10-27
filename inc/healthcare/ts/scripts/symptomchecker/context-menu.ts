if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype['msMatchesSelector'];
}

export default class ContextMenu {
	options: any;
	menu: any;
	items: any;
	target: any;
	id: number;
	element: Array<HTMLElement>;
	position: { x: any; y: any };
	constructor(
		element: HTMLElement | Array<HTMLElement>,
		items,
		options?: {
			className?: string;
			minimalStyling?: boolean;
			onShow?: any;
		}
	) {
		this.element = element instanceof Array ? element : [element];
		this.items = items;
		this.options = options ? options : {};
		this.id = new Date().getTime();
		this.target = null;
		// Listen for contextmenu event to show menu

		document.addEventListener('contextmenu', (e) => {
            //@ts-ignore
			if (this.element.indexOf(e.target) >= 0) {
				e.preventDefault();
				if (this.options.onShow) {
					this.options.onShow(e, this);
				}
				this.show(e);
			}
		});
		this.element.map((elm) =>
			elm.addEventListener('click', (e) => {
				if (e.which == 3) e.stopPropagation();
			})
		);

		// Listen for click event to hide menu
		document.addEventListener('click', (e) => {
			this.hide();
		});

		this.create();
	}

	// Creates DOM elements, sets up event listeners
	create() {
		// Create root <ul>
		this.menu = document.createElement('ul');
		this.menu.className = 'context-menu';
		this.menu.setAttribute('data-contextmenu', this.id);
		this.menu.setAttribute('tabindex', -1);
		this.menu.addEventListener('keyup', (e) => {
			switch (e.which) {
				case 38:
					this.moveFocus(-1);
					break;
				case 40:
					this.moveFocus(1);
					break;
				case 27:
					this.hide();
					break;
				default:
				// do nothing
			}
		});
		if (this.options) {
			if (!this.options.minimalStyling) {
				this.menu.classList.add('context-menu--theme-default');
			}
			if (this.options.className) {
				this.options.className.split(' ').forEach((cls) => this.menu.classList.add(cls));
			}
		}

		// Create <li>'s for each menu item
		this.items.forEach((item, index) => {
			const li = document.createElement('li');

			if (!('name' in item)) {
				// Insert a divider
				li.className = 'context-menu-divider';
			} else {
				li.className = 'context-menu-item';
				li.textContent = item.name;
				li.setAttribute('data-contextmenuitem', index);
				li.setAttribute('tabindex', '0');
				li.addEventListener('click', this.select.bind(this, li));
				li.addEventListener('keyup', (e) => {
					if (e.which === 13) {
						this.select(li);
					}
				});
			}

			this.menu.appendChild(li);
		});

		// Add root element to the <body>
		document.body.appendChild(this.menu);
	}

	// Shows context menu
	show(e) {
		if (window['disableContextMenu']) {
			return;
		}
		this.position = { x: e.pageX, y: e.pageY };
		this.menu.style.left = `${e.pageX}px`;
		this.menu.style.top = `${e.pageY}px`;
		this.menu.classList.add('is-open');
		this.target = e.target;
		// Give context menu focus
		this.menu.focus();
		// Disable native context menu
		e.preventDefault();
	}

	// Hides context menu
	hide() {
		this.menu.classList.remove('is-open');
		this.target = null;
	}

	// Selects the given item and calls its handler
	select(item) {
		const itemId = item.getAttribute('data-contextmenuitem');
		if (this.items[itemId] && this.items[itemId].callback) {
			// Call item handler with target element as parameter
			this.items[itemId].callback(this.target, this);
		}
		this.hide();
	}

	// Moves focus to the next/previous menu item
	moveFocus(direction = 1) {
		const focused = this.menu.querySelector('[data-contextmenuitem]:focus');
		let next;

		if (focused) {
			next = this.getSibling(focused, '[data-contextmenuitem]', direction);
		}

		if (!next) {
			next = direction > 0 ? this.menu.querySelector('[data-contextmenuitem]:first-child') : this.menu.querySelector('[data-contextmenuitem]:last-child');
		}

		if (next) next.focus();
	}

	// Gets an element's next/previous sibling that matches the given selector
	getSibling(el, selector, direction = 1) {
		const sibling = direction > 0 ? el.nextElementSibling : el.previousElementSibling;
		if (!sibling || sibling.matches(selector)) {
			return sibling;
		}
		return this.getSibling(sibling, selector, direction);
	}
}
