app.ready(function () {
	var selects = document.querySelectorAll(".switcher-nav select");

	var dispatchHashchange = function () {
		if (typeof HashChangeEvent !== "undefined") {
			window.dispatchEvent(new HashChangeEvent("hashchange"));
			return;
		}

		// HashChangeEvent is not available on all browsers. Use the plain Event.
		try {
			window.dispatchEvent(new Event("hashchange"));
			return;
		} catch (error) {
			// but that fails on ie
		}

		// IE workaround
		const ieEvent = document.createEvent("Event");
		ieEvent.initEvent("hashchange", true, true);
		window.dispatchEvent(ieEvent);
	};
	[].forEach.call(selects, function (select) {
		select.addEventListener("change", function (event) {
			event.preventDefault();
			window.location.hash = select.options[select.selectedIndex];
			if (!("onhashchange" in window)) {
				dispatchHashchange();
			}
		});
	});

	window.addEventListener("hashchange", function (e) {
		var hash = window.location.hash.replace(/^#!/, "");
		if (hash) {
			var switcher = hash.split("/");
			if (switcher[0] == "switch") {
				showSwitch(switcher[1], switcher[2]);
			}
		}
	});
	function showSwitch(id, index) {
		index = parseFloat(index) - 1;
		var switcher = document.querySelector("#switcher-" + id);
		var nav = switcher.querySelectorAll(".switcher-content > div");
		var select = switcher.querySelectorAll(".switcher-nav select > option");
		if (nav[index]) {
			[].forEach.call(nav, function (navItem) {
				if (navItem != index) {
					navItem.classList.remove("active");
				} else {
					navItem.classList.add("active");
				}
			});
			var tab = nav[index];
			tab.classList.add("active", "active");
			select.removeAttribute("selected");

			select[index].setAttribute("selected", "selected");
		}
	}
});
