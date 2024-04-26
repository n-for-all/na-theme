declare var window: Window & typeof globalThis, google: any, NATHEME_MAP: any;
class GoogleMap {
	gmarkers = [];
	cur = 0;
	dcur = 0;
	map;
	directionsDisplay = [];
	directionsService = [];
	stepDisplay;

	placeMarkers = [];
	jplace = {
		location: "",
		radius: 30000,
		types: [],
	};
	mapIsReady: any;

	place_types = [
		["university", "Universities", "الجامعات"],
		["grocery_or_supermarket", "Supermarkets", "السوبر ماركت"],
		["park", "Parks", "الحدائق"],
		["restaurant", "Restaurants", "المطاعم"],
		["shopping_mall", "Shopping malls", "مراكز التسوق"],
		["school", "Schools", "مدارس"],
	];
	mapElement: any;
	callback: any;
	constructor() {
		// this.observeDOM()(document.body, (m) => {
		// 	if (!this.mapIsReady) this.initMap();
		// });

		document.body.addEventListener("map", function (e) {
			this.initMap();
		});
	}

	observeDOM() {
		var MutationObserver = window.MutationObserver || window["WebKitMutationObserver"];

		return function (obj, callback) {
			if (!obj || obj.nodeType !== 1) return;

			if (MutationObserver) {
				// define a new observer
				var mutationObserver = new MutationObserver(callback);

				// have the observer observe for changes in children
				mutationObserver.observe(obj, { childList: true, subtree: true });
				return mutationObserver;
			}

			// browser support fallback
			else if (window.addEventListener) {
				obj.addEventListener("DOMNodeInserted", callback, false);
				obj.addEventListener("DOMNodeRemoved", callback, false);
			}
		};
	}

	initMap = () => {
		this.mapElement = document.querySelector("#map-canvas");
		let data = this.mapElement?.getAttribute("data-map");
		if (!data) {
			return;
		}
		data = JSON.parse(data);
		let settings = this.mapElement?.getAttribute("data-settings");
        settings = JSON.parse(settings);
		let mapCont: HTMLDivElement = document.querySelector("#map-cont");
		if (settings.height?.indexOf("%") > 0) {
			let cheight = settings.height.replace("%", "");
			var viewport = window.innerHeight;
			let masthead = document.querySelector("#masthead");
			mapCont.style.height = viewport - (masthead.clientHeight * cheight) / 100 + "px";
			window.addEventListener("resize", () => {
				mapCont.style.height = viewport - (masthead.clientHeight * cheight) / 100 + "px";
			});
		}
		this.mapIsReady = true;
		var roadAtlasStyles = [
			{
				featureType: "all",
				stylers: [
					{
						saturation: 0,
					},
					{
						hue: "#e7ecf0",
					},
				],
			},
			{
				featureType: "road",
				stylers: [
					{
						saturation: -70,
					},
				],
			},
			{
				featureType: "transit",
				stylers: [
					{
						visibility: "off",
					},
				],
			},
			{
				featureType: "poi",
				stylers: [
					{
						visibility: "off",
					},
				],
			},
			{
				featureType: "water",
				stylers: [
					{
						visibility: "simplified",
					},
					{
						saturation: -60,
					},
				],
			},
		];

		if (typeof data.markers != "undefined" && data.markers != null && data.markers.length) {
			var mapOptions = data.map;
			mapOptions.styles = NATHEME_MAP.styles;

			let mapContList: HTMLDivElement = document.querySelector("#cont-place-list");
            let oldSelected = null;
			this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			if (mapContList && settings.allow_places) {
				this.place_types.forEach((place_type) => {
					let li = document.createElement("li");
					let a = document.createElement("a");
					a.href = "#";
					a.setAttribute("loc", place_type[0] + ":" + data.markers[0].lat + "," + data.markers[0].lng);
					a.innerHTML = NATHEME_MAP.dir == "rtl" ? place_type[2] : place_type[1];

					a.addEventListener("click", (e: Event) => {
						e.preventDefault();
						var optionSelected = a.getAttribute("loc");
						var dlocation = optionSelected.split(":");
						this.removePlaceMarkers();
						if (dlocation.length == 2) {
							var service = new google.maps.places.PlacesService(this.map);
							var request = this.jplace;
							var mlocation = dlocation[1].split(",");
							request.location = new google.maps.LatLng(mlocation[0], mlocation[1]);
							request.types = [dlocation[0]];
							service.nearbySearch(request, this.listPlaces.bind(this));
						}
                        if(oldSelected){
                            oldSelected.classList.remove('active');
                        }
                        a.classList.add('active');
                        oldSelected = a;
					});

					li.appendChild(a);
					mapContList.appendChild(li);
				});
			}

			let mapContPlace = document.querySelectorAll("#cont-place li>span");
			if (mapContPlace) {
				[].forEach.call(mapContPlace, (item: HTMLSpanElement) => {
					item.parentElement?.classList.toggle("gm-show-active");
					return false;
				});
			}
			var icon = {
				url: NATHEME_MAP.icon, // url
				scaledSize: new google.maps.Size(50, 50), // scaled size
				origin: new google.maps.Point(0, 0), // origin
				anchor: new google.maps.Point(0, 0), // anchor
			};
			for (var i = 0; i < data.markers.length; i++) {
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(data.markers[i].lat, data.markers[i].lng),
					map: this.map,
					animation: google.maps.Animation.DROP,
					title: data.markers[i].title,
					label: data.markers[i].label,
					callback: data.markers[i].callback,
					icon: icon,
				});
				marker.infowindow = new google.maps.InfoWindow({
					content: data.markers[i].info,
				});
				this.gmarkers.push(marker);
				if (typeof data.markers[i].oinfo != "undefined") {
					marker.infowindow.open(map, marker);
				}
				google.maps.event.addListener(marker, "click", function (marker) {
					if (this.getAnimation() != null) {
						this.setAnimation(null);
					} else {
						this.setAnimation(google.maps.Animation.BOUNCE);
						setTimeout(() => {
							this.setAnimation(null);
						}, 1000);
					}
					if (this.callback) {
						this.callback(this);
					} else {
						this.infowindow.open(map, this);
					}
				});
			}

			if (this.map) {
				setTimeout(() => {
					this.map.setCenter(new google.maps.LatLng(data.markers[0].lat, data.markers[0].lng));
				}, 500);
			}
		} else {
			console.warn("Please add at least one marker");
		}

		if (typeof data.routes != "undefined" && data.routes != null) {
			for (var i = 0; i < data.routes.length; i++) {
				var lt = data.routes[i].orig.split(",");
				var origin = new google.maps.LatLng(lt[0], lt[1]);
				lt = data.routes[i].dest.split(",");
				var destination = new google.maps.LatLng(lt[0], lt[1]);
				this.calcRoute(origin, destination, "DRIVING", { strokeColor: data.routes[i].col });
			}
		}
	};

	listPlaces(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK && map != null) {
			for (var i = 0; i < results.length; i++) {
				var place = results[i];
				this.createPlaceMarker(place);
			}
		}
	}

	createPlaceMarker(place) {
		var icon = {
			url: place.icon, // url
			scaledSize: new google.maps.Size(16, 16), // scaled size
			origin: new google.maps.Point(0, 0), // origin
			anchor: new google.maps.Point(0, 0), // anchor
		};
		var marker = new google.maps.Marker({
			map: this.map,
			position: place.geometry.location,
			title: place.name,
			icon: icon,
		});
		this.placeMarkers.push(marker);

		const sinfowindow = new google.maps.InfoWindow({
			content: "",
		});

		google.maps.event.addListener(marker, "click", function () {
			var photos = place.photos;
			if (!photos) {
				sinfowindow.setContent("<b>" + place.name + "</b><br/>" + place.vicinity);
			} else {
				sinfowindow.setContent('<div style="text-align:left"><b>' + place.name + "</b><br/>" + place.vicinity + "</div>");
			}

			sinfowindow.open(map, this);
		});
	}

	removePlaceMarkers() {
		for (var i = 0; i < this.placeMarkers.length; i++) {
			this.placeMarkers[i].setMap(null);
		}
		this.placeMarkers = [];
	}

	calcRoute(origin, destination, selectedMode, options) {
		this.directionsService[this.dcur] = new google.maps.DirectionsService();
		var request = {
			origin: origin,
			destination: destination,
			travelMode: google.maps.TravelMode[selectedMode],
		};
		this.directionsService[this.dcur].route(request, (response, status) => {
			if (status == google.maps.DirectionsStatus.OK) {
				this.directionsDisplay[this.cur] = new google.maps.DirectionsRenderer();
				this.directionsDisplay[this.cur].setOptions({
					polylineOptions: options,
					suppressMarkers: true,
				});
				this.directionsDisplay[this.cur].setMap(map);
				this.directionsDisplay[this.cur].setDirections(response);
				this.cur++;
			}
		});
		this.dcur++;
	}
}

let map = new GoogleMap();

window["initMap"] = map.initMap;
