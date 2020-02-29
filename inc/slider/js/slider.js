(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
})();

function Na_Slider(element, settings) {
	this.inner = null;

	this.direction = 1;
	this.threshold = 50;
	this.element = element;
	this.settings = null;
	this.slides = null;
	this.columns = 1;

	//for circular menu
	this.titles = [];
	this.isCircular = false;
	this.cInterval = null;
	this.fade = false;

	this.nav = null;
	this.bullet_nav = null;
	this.pause = false;
	this.slide = {
		height: 0,
		width: 0,
	};
	this.current = {
		index: 0,
	};
	this.scroll = false;
	this.slider = {
		scroller: null,
		transform: null,
		width: 0,
		element: null,
	};
	this.initialize = function() {
		var defaults = {
			type: 'normal',
			pagination: 0,
			initial: 0,
			columns: 1,
			autoplay: 0,
			vertical: 0,
			minWidth: 200,
			height: '100%',
			sync: '',
		};
		this.settings = jQuery.extend(defaults, settings);
		this.wrapper = jQuery(this.element);
		this.isCircular = this.settings.type == 'circular' ? true : false;
		this.columns = parseInt(this.settings.columns, 10);
		if (this.settings.autoplay > 0 && !this.isCircular) {
			var _this = this;
			var xf = function() {
				setInterval(function() {
					if (!_this.pause) {
						_this.next();
					}
					_this.pause = false;
				}, _this.settings.autoplay * 1000);
			};
			setTimeout(function() {
				xf();
			}, 3000);

			_this.settings.loop = true;
		}
		if (this.isCircular) {
			this.settings.autoplay = this.settings.autoplay > 0 ? this.settings.autoplay : 5;
		}
		this.inner = this.wrapper.find('.na-slider');
		this.slides = this.wrapper.find('.na-slider>ul>li');
		this.nav = this.wrapper.find('.na-slider-nav li > a');
		this.bullet_nav = this.wrapper.find('.na-slider-bullets li > a');
		this.check3d();
		if (this.slides.length >= 1) {
			if (this.settings.columns > this.slides.length) {
				this.settings.columns = this.slides.length;
			}
			this.events();
			this.load();
			this.draw();
			this.visibility();
			this.active(0);
		}
		this.navClass();
		var _this = this;
		setTimeout(function() {
			_this.wrapper.trigger('ready');
			_this.onResizeElem(_this.wrapper.get(0), function() {
				// _this.fade = true;
				_this.load();
			});
		}, 100);
	};
	this.circularNav = function() {
		var nav = this.wrapper.find('#circular-nav');
		if (nav.length > 0) {
			var me = this;
			var start = 0,
				i = 0;
			var reverse = true; //reverse or continue
			this.titles = this.wrapper.find('ul.na-slides-title>li');
			var step = 360 / this.titles.length;
			var count = this.titles.length;
			step = step > 1 ? step : 0;

			var circle = nav.find('.circular-wrap');
			if (step > 0) {
				var rotation_slider = function() {
					if (me.pause) {
						me.pause = false;
						return;
					}

					circle.attr('transform', 'rotate(' + start * 5 + ' 0 0)');
					setTimeout(function() {
						circle.attr('transform', 'rotate(' + start + ' 0 0)');
					}, 400);
					me.titles.removeClass('active');
					jQuery(me.titles[i]).addClass('active');
					me.to(i);
					start = start + step;
					i++;

					if (start % 360 == 0) {
						i = 0;
					}
					if (start >= 360 && reverse) {
						start = start - 360;
					}
				};
				this.cInterval = setInterval(function() {
					rotation_slider();
				}, me.settings.autoplay * 1000);
			}
		}
	};
	this.maxHeight = function() {
		var h = 0;
		this.slides.each(function(index, slide) {
			if (jQuery(slide).height() > h) {
				h = jQuery(slide).height();
			}
		});
		return h / this.columns + 15;
	};
	this.load = function(preserveIndex) {
		if (this.settings.type == 'circular') {
			if (this.cInterval) {
				clearInterval(this.cInterval);
			}
			this.circularNav();
		}
		this.columns = parseInt(this.settings.columns, 10);
		var height = 0;
		switch (this.settings.height) {
			case 'auto':
				height = this.maxHeight();
				break;
			case '100%':
				height = jQuery(window).height();
				break;
			default:
				if (this.settings.height.indexOf('%') > 0) {
					if (this.settings.height.indexOf('w') == 0) {
						height = Math.floor((parseInt(this.settings.height.replace('%', '').replace('w', ''), 10) / 100) * jQuery(window).width());
					} else {
						height = Math.floor((parseInt(this.settings.height.replace('%', ''), 10) / 100) * jQuery(this.wrapper).width());
					}
				} else if (this.settings.height.indexOf('vh') > 0){
					height = Math.floor((parseInt(this.settings.height.replace('vh', ''), 10) / 100) * jQuery(this.wrapper).height());
				} else {
					height = this.settings.height.replace('px', '');
				}
				break;
		}
		var width = Math.round(((this.wrapper.width() / this.columns) * 10) / 10);
		if (this.settings.minWidth > 0 && this.columns > 1) {
			while (width < this.settings.minWidth) {
				this.columns = this.columns - 1;
				width = Math.round(((this.wrapper.width() / this.columns) * 10) / 10);
			}
			if (this.columns == 0) {
				this.columns = 1;
				width = Math.round(((this.wrapper.width() / this.columns) * 10) / 10);
			}
		}
		this.slide = {
			height: height,
			width: width,
		};
		if (this.settings.vertical) {
			this.slides.css({
				height: height + 'px',
			});
		} else {
			this.slides.css({
				width: width + 'px',
			});
			if (this.settings.height != 'auto') {
				this.slides.css({
					height: height + 'px',
				});
			}
		}

		if (this.slides.eq(0).width() > width) {
			var s_width = this.slides.eq(0).width();
			var w_width = this.wrapper.width();
			var factor = Math.floor(w_width / s_width);
			width = w_width / factor;

			this.columns = factor <= 0 ? 1 : factor;

			this.slide = {
				height: height,
				width: width,
			};
			if (this.settings.vertical) {
				this.slides.css({
					height: height + 'px',
				});
			} else {
				this.slides.css({
					width: width + 'px',
				});
				if (this.settings.height != 'auto') {
					this.slides.css({
						height: height + 'px',
					});
				}
			}
		}

		var slider = this.wrapper.find('.na-slider>ul');
		if (this.isCircular) {
			this.inner.css({
				height: height + 'px',
				width: width + 'px',
			});
			slider.css({
				height: height,
				marginLeft: 0,
			});
		} else {
			if (this.settings.vertical == 1) {
				this.inner.css({
					height: height * this.columns + 'px',
				});
				slider.css({
					height: Math.ceil(this.slides.length * height),
					marginLeft: 0,
				});
			} else {
				this.inner.css({
					width: width * this.columns + 'px',
				});
				slider.css({
					width: Math.ceil(this.slides.length * width),
					marginLeft: 0,
				});
			}
		}

		this.slider.transform = slider.get(0);
		this.slider.scroller = this.inner.get(0);
		this.slider.element = slider;
		this.slider.width = Math.ceil(this.columns * width);

		// this.scroll = this.slider.scroller.scrollLeft;
		if (!preserveIndex) {
			this.direction = -1;
            this.current.index = 0;
            this.to(this.settings.initial);
		}
		
		//trigger the events, this can be used to create thubnail slider
		this.wrapper.trigger('load-slides', [this.slides, this.current.index]);
	};

	this.navClass = function() {
		var index = this.current.index;
		if (this.current.index >= this.slides.length - this.columns) {
			this.wrapper.addClass('na-no-next');
		} else {
			this.wrapper.removeClass('na-no-next');
		}
		if (this.current.index == 0) {
			this.wrapper.addClass('na-no-prev');
		} else {
			this.wrapper.removeClass('na-no-prev');
		}
		this.inform();
	};

	this.prev = function() {
		if (this.settings.pagination == 1) {
			this.prevPage();
			return;
		}
		if (this.current.index > 0) {
			this.to(this.current.index - 1);
		}
	};

	this.to = function(i) {
		if (this.settings.pagination == 1) {
			this.toPage(i);
			return;
		}
		var index = this.current.index;
		this.scroll = true;
		this.direction = this.current.index >= i ? -1 : 1;
		this.current.index = i;
		this.pause = true;
		this.navClass();
	};

	this.next = function() {
		if (this.settings.pagination == 1) {
			this.nextPage();
			return;
		}
		if (this.current.index < this.slides.length - this.columns) {
			this.to(this.current.index + 1);
		} else if (this.settings.loop) {
			this.fade = true;
			this.to(this.settings.initial);
		}
	};
	this.prevPage = function() {
		if (this.current.index > 0) {
			var index = this.current.index / this.columns - 1;
			this.toPage(index);
		}
	};
	this.nextPage = function() {
		if (this.current.index < this.slides.length - this.columns) {
			var index = this.current.index / this.columns + 1;
			this.toPage(index);
		}
	};
	this.toPage = function(i) {
		if (i > this.slides.length / this.columns || i < 0) {
			return;
		}
		this.scroll = true;
		this.direction = this.current.index / this.columns > i ? -1 : 1;
		this.current.index = i * this.columns;
		this.navClass();
	};
	this.active = function(i) {
		if (typeof i == 'undefined') {
			return this.current.index;
		}
		var _this = this;
		_this.wrapper.trigger('active-slide', [i, _this.slides[i]]);
		var columns = this.columns;
		this.nav.each(function(index, item) {
			if (index == Math.floor(i / columns)) {
				jQuery(item).addClass('active');
			} else {
				jQuery(item).removeClass('active');
			}
		});
		if (this.bullet_nav) {
			this.bullet_nav
				.removeClass('active')
				.eq(Math.floor(i / columns))
				.addClass('active');
		}
	};
	this.has3d = function() {
		return this._has3d;
	};
	this.check3d = function() {
		var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
		var div = document.createElement('div');
		for (var i = 0; i < prefixes.length; i++) {
			if (div && div.style[prefixes[i]] !== undefined) {
				this._has3d = true;
				return;
			}
		}
		this._has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
	};
	this.inform = function() {
		window.requestAnimationFrame(this.draw.bind(this));
	};
	this.draw = function() {
		var _this = this;
		if (this.isCircular) {
			if (this.scroll) {
				this.active(this.current.index);
				this.visibility();
				this.scroll = false;
				return;
			}
		}
		if (this.scroll) {
			if (this.has3d()) {
				var transforms = {
					webkitTransform: '-webkit-transform',
					OTransform: '-o-transform',
					msTransform: '-ms-transform',
					MozTransform: '-moz-transform',
					transform: 'transform',
				};
				var transitions = {
					webkitTransition: '-webkit-transition',
					OTransition: '-o-transition',
					msTransition: '-ms-transition',
					MozTransition: '-moz-transition',
					transition: 'transition',
				};
				if (!this.slider || !this.slider.transform) {
					return;
				}
				if (this.fade) {
					this.wrapper.addClass('fade-slider');
					setTimeout(function() {
						_this.inform();
						setTimeout(function() {
							_this.wrapper.removeClass('fade-slider');
						}, 300);
					}, 200);
					this.fade = false;

					return;
				}
				this.fade = false;
				if (this.settings.vertical == 1) {
					for (var t in transforms) {
						this.slider.transform.style[t] = 'translate3d(0px,' + -1 * this.slide.height * this.current.index + 'px,0px)';
					}
				} else {
					for (var t in transforms) {
						this.slider.transform.style[t] = 'translate3d(' + -1 * this.slide.width * this.current.index + 'px,0px,0px)';
					}
				}
				this.visibility();
			} else {
				if (this.slide.width - this.threshold > 0) {
					this.slider.scroller.scrollLeft += this.direction * this.threshold;
				} else {
					this.slider.scroller.scrollLeft += this.direction * Math.abs(this.current.index);
					this.visibility();
				}
			}
			this.active(this.current.index);
			this.scroll = false;
		}
	};
	this.events = function() {
		var _this = this;
		var mousePosition = {
			clientX: 0,
			clientY: 0,
		};
		jQuery(document).ready(function() {
			var keyhandle = false;
			_this.wrapper.mouseover(function(mouseMoveEvent) {
				mousePosition.clientX = mouseMoveEvent.pageX;
				mousePosition.clientY = mouseMoveEvent.pageY;
				keyhandle = true;
			});
			jQuery(document).on('keydown', function(event) {
				var divRect = _this.wrapper.get(0).getBoundingClientRect();
				if (mousePosition.clientX >= divRect.left && mousePosition.clientX <= divRect.right && mousePosition.clientY >= divRect.top && mousePosition.clientY <= divRect.bottom && keyhandle) {
					// Mouse is inside element.
					event.preventDefault();
					if (event.keyCode == 38 || event.keyCode == 37) {
						_this.prev();
						return false;
					} else if (event.keyCode == 40 || event.keyCode == 39) {
						_this.next();
						return false;
					}
				}
				return true;
			});
			_this.wrapper.mouseout(function(mouseMoveEvent) {
				keyhandle = false;
			});
		});
		var hammertime = new Hammer(this.wrapper.get(0), {});
		hammertime.on('swipe', function(ev) {
			if (ev.direction == Hammer.DIRECTION_LEFT) {
				_this.pause = true;
				_this.next();
			}
			if (ev.direction == Hammer.DIRECTION_RIGHT) {
				_this.pause = true;
				_this.prev();
			}
		});
		this.wrapper.find('.na-slider-actions.prev').on('click', function() {
			_this.pause = true;
			_this.prev();
			return false;
		});
		this.wrapper.find('.na-slider-actions.next').on('click', function() {
			_this.pause = true;
			_this.next();
			return false;
		});
		this.wrapper.find('.na-slide .inner-image, .na-slide .na-slide-inner').on('mouseover', function() {
			_this.pause = true;
			return false;
		});
		this.wrapper.find('.na-slide .inner-image, .na-slide .na-slide-inner').on('mouseleave', function() {
			_this.pause = false;
			return false;
		});
		this.wrapper.find('.na-slider-bullets li a').on('click', function() {
			_this.pause = true;
			_this.to(jQuery(this).data('index'));
			_this.wrapper
				.find('.na-slider-bullets li a')
				.removeClass('active')
				.filter(this)
				.addClass('active');
			return false;
		});

		this.wrapper.find('>.na-slider>ul>li').on('click', function() {
			_this.wrapper.trigger('click-slide', [jQuery(this).index()]);
		});

		if (this.settings.sync && this.settings.sync != '') {
			jQuery('#' + _this.settings.sync).on('ready', function() {
				var slider = jQuery('#' + _this.settings.sync).data('na-slider');
				_this.wrapper.on('active-slide', function(event, index) {
					if (slider && slider.active() != index) slider.to(index);
					return false;
				});
				jQuery(this).on('active-slide', function(event, index) {
					if (_this.active() != index) _this.to(index);
					return false;
				});
				jQuery(this).on('click-slide', function(event, index) {
					if (_this.active() != index) _this.to(index);
					return false;
				});
			});
		}

		if (this.nav.length > 0) {
			this.nav.on('click', function() {
				_this.pause = true;
				_this.to(jQuery(this).data('to'));
				return false;
			});
		}
	};
	this.visibility = function() {
		var range = [this.current.index, this.current.index + this.columns - 1];
		this.slides.each(function(index, slide) {
			jQuery(slide)
				.removeClass('before after visible')
				.addClass('na-slide');
			if (index >= range[0] && index <= range[1]) {
				jQuery(slide).addClass('visible');
			} else {
				jQuery(slide).removeClass('visible');
			}
			if (index == range[1] + 1) {
				jQuery(slide).addClass('after');
			}
			if (index == range[0] - 1) {
				jQuery(slide).addClass('before');
			}
		});
	};

	this.onResizeElem = function(element, callback) {
		if (!element) {
			return;
		}
		var onResizeElem = {};
		// Save the element we are watching
		onResizeElem.watchedElementData = {
			element: element,
			offsetWidth: element.offsetWidth,
			offsetHeight: element.offsetHeight,
			callback: callback,
		};

		onResizeElem.checkForChanges = function() {
			const data = onResizeElem.watchedElementData;
			if (data.element.offsetWidth !== data.offsetWidth || data.element.offsetHeight !== data.offsetHeight) {
				data.offsetWidth = data.element.offsetWidth;
				data.offsetHeight = data.element.offsetHeight;
				data.callback();
			}
		};

		// Listen to the window resize event
		window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', onResizeElem.checkForChanges);
	};
	var _this = {
		me: this,
	};
	this.initialize();
}
jQuery(function() {
	if (typeof slider_settings != 'undefined') {
		for (var i in slider_settings) {
			var slider = new Na_Slider('#' + i, slider_settings[i]);
			jQuery('#' + i).data('na-slider', slider);
		}
	}
});
