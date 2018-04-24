(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

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

    this.pause = false;
    this.slide = {
        "height": 0,
        "width": 0
    };
    this.current = {
        "index": 0
    };
    this.scroll = false;
    this.slider = {
        "scroller": null,
        "transform": null,
        "width": 0,
        "element": null
    };
    this.initialize = function() {
        this.wrapper = jQuery(this.element);
        this.settings = settings;
        this.isCircular = this.settings.type == 'circular' ? true : false;
        this.columns = parseInt(this.settings.columns, 10);
        if (this.settings.autoplay > 0 && !this.isCircular) {
            var _this = this;
            var xf = function() {
                setInterval(function() {
                    if(!_this.pause){
                        _this.next();
                    }
                    _this.pause = false;
				}, this.settings.autoplay*1000);
            };
            xf();
        }
		if(this.isCircular){
			this.settings.autoplay = this.settings.autoplay > 0 ? this.settings.autoplay: 5;
		}
        this.inner = this.wrapper.find(".na-slider");
        this.slides = this.wrapper.find('.na-slider>ul.na-slides>li.na-slide');
        this.nav = this.wrapper.find(".na-slider-nav li > a");
        if (this.slides.length >= 1) {
            this.events();
            this.load();
            this.draw();
            this.visibility();
            this.active(0);
        }
        this.navClass();
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
                    if(me.pause){
                        me.pause = false;
                        return;
                    }

                    circle.attr('transform', 'rotate(' + start*5 + ' 0 0)');
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
				}, me.settings.autoplay*1000);
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
    this.load = function() {
        if (this.settings.type == 'circular') {
			if(this.cInterval){
				clearInterval(this.cInterval);
			}
			this.circularNav();
        }
        this.columns = parseInt(this.settings.columns, 10);
        var height = 0;
        switch(this.settings.height){
            case 'auto':
                height = this.maxHeight();
                break;
            case '100%':
                height = jQuery(window).height();
                break;
            default:
                height = this.wrapper.outerHeight(true)
                break;
        }
        var width = Math.round((this.wrapper.width() / this.columns * 10) / 10);
        this.slide = {
            height: height,
            width: width
        };

        this.slides.css({
            "height": height + "px",
            "width": width + "px"
        });
        if (this.slides.eq(0).width() > width) {
            var s_width = this.slides.eq(0).width();
            var w_width = this.wrapper.width();
            var factor = Math.floor(w_width / s_width);
            var o_width = width;
            width = w_width / factor;
            // height = height*factor/this.settings.columns;

            this.columns = factor <= 0 ? 1 : factor;

            this.slide = {
                height: height,
                width: width
            };
            this.slides.css({
                "height": height + "px",
                "width": width + "px"
            });
        }

        var slider = this.wrapper.find(".na-slider>ul.na-slides");
        if (this.isCircular) {
			this.inner.css({
				"height": height + "px",
				"width": width + "px"
			});
			slider.css({
				height: height,
				marginLeft: 0
			});
        } else {
            if (this.settings.vertical == 1) {
                this.inner.css({
                    "height": height * this.columns + "px",
                    "width": width + "px"
                });
                slider.css({
                    height: Math.ceil(this.slides.length * height),
                    marginLeft: 0
                });
            } else {
                this.inner.css({
                    "height": height + "px",
                    "width": width * this.columns + "px"
                });
                slider.css({
                    width: Math.ceil(this.slides.length * width),
                    marginLeft: 0
                });
            }
        }

        this.slider.transform = slider.get(0);
        this.slider.scroller = this.inner.get(0);
        this.slider.element = slider;
        this.slider.width = Math.ceil(this.columns * width);

        // this.scroll = this.slider.scroller.scrollLeft;
        this.direction = -1;
        this.current.index = 0;
        this.to(0);
    };
    this.prev = function() {
        if (this.current.index > 0) {
            this.current.index = this.current.index - 1;
            this.scroll = true;
        }
        this.direction = 1;
        this.navClass();
    };
    this.prevPage = function() {
        if (this.current.index > 0) {
            this.current.index = this.current.index - this.columns;
            if (this.current.index < 0) {
                this.current.index = 0;
            }
            this.scroll = true;
        }
        this.direction = 1;
        this.navClass();
    };
    this.to = function(i) {
        var index = this.current.index;
        this.scroll = true;
        this.direction = 1;
        this.current.index = i;
        this.navClass();
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
    this.toPage = function(i) {
        this.scroll = true;
        this.direction = 1;
        this.current.index = i * this.columns;
        this.navClass();
    };
    this.next = function() {
        if (this.current.index < this.slides.length - this.columns) {
            this.scroll = true;
            this.current.index = this.current.index + 1;
        }
        this.direction = +1;
        this.navClass();
    };
    this.nextPage = function() {
        if (this.current.index < this.slides.length - this.columns) {
            this.scroll = true;
            this.current.index = this.current.index + this.columns;
            if (this.current.index > this.slides.length) {
                this.current.index = this.slides.length;
            }
        }else{
            this.toPage(0);
        }
        this.direction = +1;
        this.navClass();
    };
    this.active = function(i) {
        this.nav.each(function(index, item) {
            if (i == index) {
                jQuery(item).addClass('active');
            } else {
                jQuery(item).removeClass('active');
            }
        });
    };
    this.has3d = function() {
        return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
    };
    this.inform = function() {
        window.requestAnimationFrame(this.draw.bind(this));
    }
    this.draw = function() {
        var _this = this;
		if(this.isCircular){
			if(this.scroll){
				this.active(this.current.index);
				this.visibility();
				this.scroll = false;
				return;
			}
		}
        if (this.scroll) {
            if (this.has3d()) {
                var transforms = {
                    'webkitTransform': '-webkit-transform',
                    'OTransform': '-o-transform',
                    'msTransform': '-ms-transform',
                    'MozTransform': '-moz-transform',
                    'transform': 'transform'
                };
                var transitions = {
                    'webkitTransition': '-webkit-transition',
                    'OTransition': '-o-transition',
                    'msTransition': '-ms-transition',
                    'MozTransition': '-moz-transition',
                    'transition': 'transition'
                };

                if (this.settings.vertical == 1) {
                    for (var t in transforms) {
                        this.slider.transform.style[t] = "translate3d(0px," + (-1 * this.direction * this.slide.height * this.current.index) + "px,0px)";
                    }
                } else {
                    for (var t in transforms) {
                        this.slider.transform.style[t] = "translate3d(" + (-1 * this.direction * this.slide.width * this.current.index) + "px,0px,0px)";
                    }
                }
                for (var t in transitions) {
                    this.slider.transform.style[t] = "transform 1s ease";
                }
                this.slider.transform.style[t];
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
        this.wrapper.on("swiperight", function() {
            _this.prev();
            return false;
        });
        this.wrapper.on("swipeleft", function() {
            _this.next();
            return false;
        });
        if (this.settings.pagination == 1) {
            this.wrapper.find(".na-slider-actions.prev").on("click", function() {
                _this.pause = true;
                _this.prev();
                return false;
            });
            this.wrapper.find(".na-slider-actions.next").on("click", function() {
                _this.pause = true;
                _this.next();
                return false;
            });
        } else {
            this.wrapper.find(".na-slider-actions.prev").on("click", function() {
                _this.pause = true;
                _this.prevPage();
                return false;
            });
            this.wrapper.find(".na-slider-actions.next").on("click", function() {
                _this.pause = true;
                _this.nextPage();
                return false;
            });
        }
        if (this.nav.length > 0) {
            if (this.settings.pagination == 1) {
                this.nav.on("click", function() {
                    _this.pause = true;
                    _this.to(jQuery(this).data('to'));
                    return false;
                });
            } else {
                this.nav.on("click", function() {
                    _this.pause = true;
                    _this.toPage(jQuery(this).data('to'));
                    return false;
                });
            }
        }
    };
    this.visibility = function() {
        var range = [this.current.index, this.current.index + this.columns - 1];
        this.slides.each(function(index, slide) {
            jQuery(slide).removeClass('before after visible').addClass('na-slide');
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
    var _this = {
        me: this
    };
    jQuery(window).resize(function() {
        _this.me.load();
    });
    this.initialize();
}
jQuery(function() {
    if (typeof(slider_settings) != 'undefined') {
        for (var i in slider_settings) {
            var x = new Na_Slider("#" + i, slider_settings[i]);
        }
    }
});
