export default class PositionData {
	data = [];
	connections = [];

	constructor(data: any = []) {
		if (data) {
			this.data = data;
		}
		let btn = document.querySelector('.btn-data');
		if (btn)
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.printData();
			});
	}
	addDepartment(x, y, text = {}, icon = {}, link = {}) {
		let id = this.id();
		this.data.push({ type: 'department', x, y, id, text, icon, link });
		return id;
	}

	updateDepartmentText(id, text) {
		this.data = this.data.map((c) => {
			if (c.id == id) {
				c.text = text;
			}
			return c;
		});
		return this;
	}
	updateDepartmentImage(id, image) {
		this.data = this.data.map((c) => {
			if (c.id == id) {
				c.icon = image;
			}
			return c;
		});
		return this;
	}
	updateDepartmentLink(id, link) {
		this.data = this.data.map((c) => {
			if (c.id == id) {
				c.link = link;
			}
			return c;
		});
		return this;
	}

	removeDepartment(id) {
		this.data = this.data.filter((item) => id != item.id);
		this.removeConnection(id);
		return this;
	}

	addCircle(x, y) {
		let id = this.id();
		this.data.push({ type: 'circle', x: x, y: y, id: id });
		return id;
	}

	updateCircle(id, x, y) {
		this.data = this.data.map((c) => {
			if (c.id == id) {
				c.x = x;
				c.y = y;
			}
			return c;
		});
		return this;
	}

	removeCircle(id) {
		this.data = this.data.filter((item) => id != item.id);
		this.removeConnection(id);
		return this;
	}

	getCircle(id) {
		return this.get('circle', id);
	}

	get(type, id) {
		let data = this.data.filter((item) => type == item.type && id == item.id);
		return data && data.length ? data[0] : null;
	}

	getAll(type = false) {
		if (!type) {
			return this.data;
		}
		let data = this.data.filter((item) => type == item.type);
		return data;
	}

	addLine(points) {
		let id = this.id();
		this.data.push({ type: 'line', points, id: id });
		return id;
	}
	saveLine(id, points) {
		let found = false;
		this.data = this.data.map((c) => {
			if (c.id == id) {
				c.points = points;
				found = true;
			}
			return c;
		});
		if (!found) {
			this.data.push({ type: 'line', points, id: id });
		}
		return this;
	}

	removeLine(id) {
		this.data = this.data.filter((item) => id != item.id);
		this.removeConnection(id);
		return this;
	}

	getLine(id) {
		return this.get('line', id);
	}

	addConnection(id, idy) {
		this.data.push({ type: 'connection', id: id, idy });
		return this;
	}

	removeConnection(idx, idy = null) {
		this.data = this.data.filter((item) => !(idx == item.idx && (idy == null || idy == item.idy)) || !(idx == item.idy && (idy == null || idy == item.idx)));
		return this;
	}

	getConnection(id) {
		return this.get('connection', id);
	}

	id() {
		var id = Math.random().toString(36).substr(2, 9);
		return id;
	}
	printData() {
		document.querySelector('#data-json').classList.toggle('active');
		document.querySelector('#data-json').innerHTML = JSON.stringify(this.data, undefined, 2);
	}
}
