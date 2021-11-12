import { LiveSearch } from "livesearch";

declare let app: any;

class Healthcare {
	constructor() {
		let elms = document.querySelectorAll("[data-live-search]");
		[].forEach.call(elms, (item) => {
			LiveSearch.renderInline(item);
		});
	}
}

app.ready(() => {
	new Healthcare();
});
