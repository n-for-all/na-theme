import { SVG } from '@svgdotjs/svg.js';
import ContextMenu from './context-menu';
import Toolbar from './toolbar';
import { PopupCollection } from './popup';
import PositionData from './position-data';
import './svgdrag';

export default class PositionTooltip {
	container: any;
	position: any;
	// tooltip: HTMLDivElement;
	lastPosition = { x: 50, y: 50 };
	mousePosition = { x: 50, y: 50 };
	lineArray = [];
	svg: any;
	mode: any;
	toolbar: Toolbar;
	data: PositionData;
	events = {};
	popup: PopupCollection;
	department: HTMLDivElement;
	addDepartment = null;
	editMode = true;
	constructor(data = []) {
		this.container = document.querySelector('[data-tooltip-container]');
		if (!this.container) {
			this.editMode = false;
		}

		this.data = new PositionData(data);
		this.svg = SVG('.top-background');

		this.popup = new PopupCollection('.popup-department');
		this.department = document.querySelector('.popup-department');
		if (this.department) {
			this.department.querySelector('.btn-save').addEventListener('click', (e) => {
				if (this.addDepartment) {
					let select: HTMLSelectElement = this.department.querySelector('select');
					let option = select.options[select.selectedIndex];
					this.addDepartment(option.value, option.innerText, option.getAttribute('data-icon'), option.getAttribute('data-url'));
				}
			});
			this.department.querySelector('select').removeAttribute('disabled');
		}
		this.toolbar = new Toolbar();

		this.data.getAll().map((elm) => {
			switch (elm.type) {
				case 'circle':
					this.createCircle(elm, elm.id);
					break;
				case 'line':
					this.createLine(elm.points, elm.id);
					break;
				case 'department':
					this.createDepartment(elm, elm.text, elm.icon, elm.link, elm.id);
					break;
			}
		});

		this.mode = '';
		this.toolbar.hide();

		if (!this.container) {
			return;
		}
		this.container.addEventListener('mouseover', this.handleMouseOver);

		this.container['menu'] = new ContextMenu(
			this.container.querySelector('.top-background'),
			[
				{
					name: 'Add Point',
					callback: () => {
						// this.container.removeChild(elm);
						if (this.mousePosition) this.createCircle(this.mousePosition);
					},
				},
				{
					name: 'Add Line',
					callback: (cont) => {
						if (this.mousePosition) {
							let polyline = this.createLine([]);
							if (polyline) {
								this.on('container-click', (cont) => {
									this.handleLine(polyline);
								});
								window['disableContextMenu'] = true;
							}
						}
					},
				},
				{
					name: 'Add Department',
					callback: (cont) => {
						window.location.hash = '#!popup/department';
						this.addDepartment = (id, text, icon, url) => {
							this.createDepartment(
								this.mousePosition,
								{ x: this.mousePosition.x, y: this.mousePosition.y, title: text },
								{ x: this.mousePosition.x + 10, y: this.mousePosition.y + 10, url: icon },
								url
							);
						};
					},
				},
				{
					name: 'Add Department Title',
					callback: (cont) => {
						window.location.hash = '#!popup/department';
						this.addDepartment = (id, text, icon, url) => {
							this.createDepartment(
								this.mousePosition,
								{ x: this.mousePosition.x, y: this.mousePosition.y, title: text },
								null,
								url
							);
						};
					},
				},
				{},
				{ name: 'Close' },
			],
			{
				onShow: (e: any) => {
					this.mousePosition = Object.assign({}, this.lastPosition);
				},
			}
		);

		let stopPropagation = (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
		};
		this.container.addEventListener('click', (e) => {
			this.emit('container-click', this.container);
		});
		this.container.addEventListener('mousedown', stopPropagation);
		this.container.addEventListener('touchstart', stopPropagation);
		this.container.addEventListener('pointerdown', stopPropagation);
	}

	handleMouseOver = (event: Event) => {
		this.position = this.createTooltipBox();
		// if (this.tooltip && !this.tooltip.classList.contains('active')) this.tooltip.classList.add('active');
		event.target.addEventListener('mousemove', this.handleMouseMove);
		event.target.addEventListener('mouseleave', this.handleMouseLeave);
	};

	handleMouseLeave = (event) => {
		// if (this.tooltip) {
		// 	this.tooltip.classList.remove('active');
		// }
		event.target.removeEventListener('mousemove', this.handleMouseMove);
		event.target.removeEventListener('mouseleave', this.handleMouseLeave);
	};

	handleMouseMove = (e) => {
		this.position(e);
	};

	createDepartment(pos, text, icon, link, id = null) {
		let group = this.svg.link(link);
		group.x(pos.x).y(pos.y);
		let departmentId = id ? id : this.data.addDepartment(pos.x, pos.y, text, icon, link);

		let nodes = [group.node];
		if (text && text.title) {
			let svgtext = group.plain(text.title).x(text.x).y(text.y);
			svgtext.node.svgDrag(null, (el, pageX, startX, pageY, startY) => {
				svgtext.node.style.transform = 'none';
				var x = svgtext.x() + pageX - startX;
				var y = svgtext.y() + pageY - startY;
				svgtext.x(x).y(y);
				this.data.updateDepartmentText(departmentId, { x, y, title: text.title });
			});
			nodes.push(svgtext.node);
		}
		if (icon && icon.url) {
			let image = group.image(icon.url).x(icon.x).y(icon.y);
			image.addClass('department-icon');
			image.node.svgDrag(null, (el, pageX, startX, pageY, startY) => {
				image.node.style.transform = 'none';
				var x = image.x() + pageX - startX;
				var y = image.y() + pageY - startY;

				image.x(x).y(y);

				this.data.updateDepartmentImage(departmentId, { x, y, url: icon.url });
			});
			nodes.push(image.node);
		}
		if (this.editMode) {
			group.node.addEventListener('click', (e) => {
				e.preventDefault();
			});

			group['menu'] = new ContextMenu(nodes, [
				{
					name: 'Remove',
					callback: () => {
						group.remove();
						this.data.removeDepartment(departmentId);
					},
				},
				{},
				{ name: 'Close' },
			]);
		}
		this.mode = 'department';
	}
	createCircle(pos, id = null) {
		let group = this.svg.group();
		let circle = group.circle(20);
		id = id ? id : this.data.addCircle(pos.x, pos.y);
		circle.fill('#f42153c7').addClass('marker').addClass(`circle-${id}`).stroke({ color: '#ffffff9e', width: 1 }).attr('data-id', id);
		circle.cx(pos.x).cy(pos.y);
		var nCircle = circle.clone();
		nCircle.addClass('ping').fill('#f42153c7');
		group.add(nCircle);
		if (this.editMode) {
			group['menu'] = new ContextMenu(
				[group.node, nCircle.node, circle.node],
				[
					{
						name: 'Remove',
						callback: () => {
							this.data.removeCircle(circle.attr('data-id'));
							group.remove();
						},
					},
					{},
					{ name: 'Close' },
				]
			);

			group.node.addEventListener('click', (e) => {
				this.emit('click-circle', e.target);
			});

			group.node.svgDrag(null, () => {
				circle.cx(this.lastPosition.x).cy(this.lastPosition.y);
				nCircle.cx(this.lastPosition.x).cy(this.lastPosition.y);
				this.data.updateCircle(id, this.lastPosition.x, this.lastPosition.y);
				group.node.style.transform = 'none';
			});
		}
		this.mode = 'circle';
	}
	createLine(lineArray = [], id = null) {
		if (this.mode != 'line') {
			this.lineArray = lineArray;
			let polyline = this.svg.polyline(this.lineArray);
			id = id ? id : this.data.id();
			polyline.stroke({ color: '#ffffff9e', width: 2 }).attr('class', 'line').addClass(`line-${id}`).attr('data-id', id);
			if (this.editMode) {
				polyline['menu'] = new ContextMenu(polyline.node, [
					{
						name: 'Connect To...',
						callback: () => {
							this.toolbar.update([
								{
									name: 'Cancel Connection',
									callback: () => {
										this.off('click-circle');
										this.toolbar.hide();
									},
								},
							]);
							this.on('click-circle', (el) => {
								let circle = this.data.getCircle(el.getAttribute('data-id'));
								if (circle) {
									this.data.addConnection(circle['id'], id);
								}
								this.toolbar.hide();
								this.off('click-circle');
							});
						},
					},
					{
						name: 'Remove',
						callback: () => {
							this.data.removeLine(id);
							polyline.remove();
						},
					},
					{},
					{ name: 'Close' },
				]);

				var handleUndo = (e) => {
					if ((e.which === 90 && e.ctrlKey) || (e.metaKey && e.which === 91)) {
						this.lineArray.pop();
						polyline.plot(this.lineArray);
					}
				};
				let clearEvents = () => {
					this.mode = '';
					this.lineArray = [];
					window['disableContextMenu'] = false;
					this.off('container-click');
					document.removeEventListener('keydown', handleUndo);
					this.toolbar.hide();
				};
				document.addEventListener('keydown', handleUndo);
				this.toolbar.update([
					{
						name: 'Save',
						callback: () => {
							this.data.saveLine(id, this.lineArray);
							clearEvents();
						},
					},
					{
						name: 'Cancel',
						callback: () => {
							this.data.removeLine(id);
							polyline.remove();
							clearEvents();
						},
					},
				]);
			}
			this.mode = 'line';
			return polyline;
		}
	}

	handleLine = (polyline) => {
		this.lineArray.push([this.lastPosition.x, this.lastPosition.y]);
		polyline.plot(this.lineArray);
	};

	createTooltipBox() {
		// if (!this.tooltip) {
		// 	this.tooltip = document.createCircle('div');
		// 	this.tooltip.classList.add('mouse-tooltip');
		// 	this.container.appendChild(this.tooltip);
		// }

		return (e) => {
			let pos = this.recursivePosition(e, this.container);
			// this.tooltip.style.top = pos.y + 15 + 'px';
			// this.tooltip.style.left = pos.x + 8 + 'px';
			let percentx = ((pos.x / this.container.clientHeight) * 100).toFixed(1);
			let percenty = ((pos.y / this.container.clientWidth) * 100).toFixed(1);
			// this.tooltip.innerHTML = `<span>${pos.y}px ${pos.x}px</span><br/><span>${percenty}% ${percentx}%</span>`;
			this.lastPosition = { x: pos.x, y: pos.y };
			return { x: percentx, y: percenty };
		};
	}
	recursivePosition(e, obj) {
		var m_posx = 0,
			m_posy = 0,
			e_posx = 0,
			e_posy = 0;
		//get mouse position on document crossbrowser
		if (!e) {
			e = window.event;
		}
		if (e.pageX || e.pageY) {
			m_posx = e.pageX;
			m_posy = e.pageY;
		} else if (e.clientX || e.clientY) {
			m_posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			m_posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		//get parent element position in document
		if (obj.offsetParent) {
			do {
				e_posx += obj.offsetLeft;
				e_posy += obj.offsetTop;
			} while ((obj = obj.offsetParent));
		}
		// mouse position minus elm position is mouseposition relative to element:
		return { x: m_posx - e_posx, y: m_posy - e_posy };
	}

	emit(type, el, data = {}) {
		if (this.events[type]) {
			this.events[type](el, data);
		}
	}

	on(type, fn) {
		this.events[type] = fn;
	}

	off(type) {
		this.events[type] = null;
	}
}
