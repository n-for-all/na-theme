import PositionTooltip from "./symptomchecker/position-tooltip";
window["disableContextMenu"] = false;

declare let app: any;
app.ready(() => {
	let container = document.querySelector(".symptom-checker");
	if (!container) {
		return;
	} 
	new PositionTooltip(eval(container.getAttribute("data"))); 
});
