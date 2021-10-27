export default class Toolbar {
	container: HTMLElement;
	list: HTMLUListElement;
	constructor() {
		this.container = document.querySelector('.form-toolbar');
	}
	update(items) {
        if(!this.container){
            return;
        }
		this.list = document.createElement('ul');
		items.map((item) => {
			let li = document.createElement('li');
			li['toolbarData'] = item;
			li.innerHTML = item.name;
			this.list.appendChild(li);
			li.addEventListener('click', (e) => {
				item.callback(li['toolbarData'], e);
			}); 
		});
		this.container.innerHTML = '';
		this.container.appendChild(this.list);
		this.show();
	} 
	show() {
        if(!this.container){
            return;
        }
		this.container.classList.add('active');
	}
	hide() {
        if(!this.container){
            return;
        }
		this.container.classList.remove('active');
	}
}