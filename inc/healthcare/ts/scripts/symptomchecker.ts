import PositionTooltip from "./symptomchecker/position-tooltip";
window["disableContextMenu"] = false;

declare let app: any;
app.ready(() => {
    let container = document.querySelector('[data-tooltip-container]');
	new PositionTooltip(eval(container.getAttribute('data'))); 
});
