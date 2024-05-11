(function () {
	function svgDrag(onDrag, onStop, direction) {
		var startX: any = 0;
		var startY: any = 0;
		var el = this;
		var dragging = false;
		var fix = {};
		function move(e) {
			onDrag && onDrag(el, e.pageX, startX, e.pageY, startY, fix);
			if ("vertical" !== direction) {
				var pageX = "pageX" in fix ? fix["pageX"] : e.pageX;
				if ("startX" in fix) {
					startX = fix["startX"];
				}
				if (false === "skipX" in fix) {
					el.style.transform = `translate(${pageX - startX}px, ${pageY - startY}px)`;
				}
			}
			if ("horizontal" !== direction) {
				var pageY = "pageY" in fix ? fix["pageY"] : e.pageY;
				if ("startY" in fix) {
					startY = fix["startY"];
				}
				if (false === "skipY" in fix) {
					// el.style.top = (pageY - startY) + 'px';
					el.style.transform = `translate(${pageX - startX}px, ${pageY - startY}px)`;
				}
			}
		}

		function startDragging(e) {
			if (e.which == 3) {
				return;
			}
			if (e.currentTarget instanceof HTMLElement || e.currentTarget instanceof SVGElement) {
				dragging = true;
				var left = el.style.left ? parseInt(el.style.left) : 0;
				var top = el.style.top ? parseInt(el.style.top) : 0;
				startX = e.pageX - left;
				startY = e.pageY - top;

				window.addEventListener("mousemove", move);
			} else {
				throw new Error("Your target must be an html element");
			}
		}

		this.addEventListener("mousedown", startDragging);
		window.addEventListener("mouseup", function (e) {
			if (true === dragging) {
				dragging = false;
				window.removeEventListener("mousemove", move);
				onStop && onStop(el, e.pageX, startX, e.pageY, startY);
			}
		});
	}

	Element.prototype["svgDrag"] = svgDrag;
})();
