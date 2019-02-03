function theme(options) {
	this.options = options;
	this.controller = null;
	this.scene = null;
	this.fullpage = null;
	this.sections = null;
	this.scrollHandler = null;
	this.load = function() {
		var me = this;
		this.tabs();
		if (this.options.scrolling && jQuery(window).width() > this.options.mobile) {
			// jQuery("#inner-scroll>section").height(jQuery(window).height());
			// jQuery("#inner-scroll>.inner-scroll-inner").width((100 * count + "%"));
			// jQuery("#inner-scroll>section").width((widthPercent + "%"));

			var flip = false;
			var widthPercent = 100 / count;
			// console.log(this.options.scrolling);
			switch (this.options.scrolling) {
				case '2':
					var slides = jQuery('#inner-scroll>section');
					var count = slides.length;
					if (count > 0) {
						slides.width(widthPercent + '%').css({
							height: jQuery(window).height(),
						});
						jQuery('#inner-scroll').width(100 * count + '%');
						// jQuery(".scrolling-container--2").width((100 * count + "%"));
						me.controller = new ScrollMagic.Controller({});
						var wipeAnimation = new TimelineMax();

						for (i = 0; i < count; i++) {
							wipeAnimation
								.to('#inner-scroll', 0.5, {
									z: -300,
									delay: 1,
								})
								.to('#inner-scroll', 2, {
									x: '-' + widthPercent * (i + 1) + '%',
								})
								.to('#inner-scroll', 0.5, {
									z: 0,
								});
							flip = !flip;
						}

						// create scene to pin and link animation
						var count = slides.length > 0 ? slides.length : 1;
						me.scene = new ScrollMagic.Scene({
							triggerElement: '.scrolling-container--2',
							triggerHook: 'onLeave',
							duration: '500%',
						})
							.setPin('.scrolling-container--2')
							.setTween(wipeAnimation)
							.addTo(me.controller);
						var _current = 0;
						var offset = 0.3; //offset in percentage
						me.scene.on('progress', function(event) {
							var direction = event.scrollDirection == 'FORWARD' ? 0 : 0;
							var v = event.progress * count + offset + 1;
							if (v > count) {
								v = count;
							}
							v = parseInt(v, 10);
							if (v != _current) {
								slides.each(function() {
									jQuery(this).removeClass('in');
								});
								jQuery(slides[v]).addClass('in');
								_current = v;
							}
						});
					}
					break;
				case '3':
					var slides = jQuery('#inner-scroll>section');
					var count = slides.length;
					if (count > 0) {
						slides.css({
							height: jQuery(window).height(),
						});
						me.controller = new ScrollMagic.Controller({
							globalSceneOptions: {
								triggerHook: 'onLeave',
							},
						});
						// get all slides
						// console.log(slides.get(i));
						// create scene for every slide
						for (var i = 0; i < slides.length; i++) {
							new ScrollMagic.Scene({
								triggerElement: slides.get(i),
							})
								.setPin(slides.get(i))
								.addTo(me.controller);
						}
					}
					break;
				case '4':
					var slides = jQuery('#inner-scroll>section');
					var count = slides.length;
					if (count > 0) {
						me.controller = new ScrollMagic.Controller();
						// define movement of panels
						var wipeAnimation = new TimelineMax();

						var is_x = true;
						var is_negative = true;
						// create scene for every slide
						for (var i = 0; i < slides.length; i++) {
							if (i == 0) {
								wipeAnimation.fromTo(
									slides[i],
									1,
									{
										x: '0%',
										y: 0,
									},
									{
										x: '0%',
										y: '0%',
										ease: Linear.easeNone,
									}
								);
								continue;
							}
							var dir = {};
							if (is_x) {
								if (is_negative) {
									dir['x'] = '-100%';
								} else {
									dir['x'] = '100%';
								}
								is_negative = !is_negative;
							} else {
								if (is_negative) {
									dir['y'] = '-100%';
								} else {
									dir['y'] = '100%';
								}
								is_negative = !is_negative;
							}
							is_x = !is_x;
							if (i % 2 == 0 && i != 0) {
								is_x = !is_x;
							}
							wipeAnimation.fromTo(slides[i], 1, dir, {
								x: '0%',
								y: '0%',
								ease: Linear.easeNone,
							});
							// console.log(dir);
						}
						// create scene to pin and link animation
						me.scene = new ScrollMagic.Scene({
							loglevel: 2,
							triggerElement: '#inner-scroll',
							triggerHook: 'onLeave',
							duration: 100 * count + '%',
						})
							.setPin('#inner-scroll')
							.setTween(wipeAnimation)
							.addTo(me.controller);
					}
					break;
				case '5':
					var slides = jQuery('section.section');
					var count = slides.length;
					if (count > 0) {
						slides.css({
							height: jQuery(window).height() - jQuery('.navbar').height() / 2,
						});
					}
					jQuery(document).on('scrolling-resize', function() {
						slides.css({
							height: jQuery(window).height(),
						});
					});
					break;
				default:
					var scroll_selector = '.page-template-page-home-section #wrapper';
					var section_selector = '.section, .site-footer';
					this.sections = jQuery(scroll_selector).find(section_selector);

					if (this.sections.length > 0) {
						var section_nav = jQuery('<div class="section-nav"><ul class="inner"></ul></div>')
							.appendTo('body')
							.find('.inner');
						this.sections.css('height', jQuery(window).height() + 'px');
						jQuery(document).on('scrolling-resize', function() {
							me.sections.css('height', jQuery(window).height() + 'px');
						});
						this.sections.each(function(index, section) {
							section_nav.append('<li data-index="' + index + '">' + index + '</li>');
						});
						var section_nav_handler = function(index) {
							section_nav.find('li').each(function(i, item) {
								if (i == index) {
									jQuery(item).addClass('active');
								} else {
									jQuery(item).removeClass('active');
								}
							});
						};

						var fullPage = function(selector) {
							var current_index = 0,
								direction = 'up';
							jQuery(selector).fullpage({
								sectionSelector: section_selector,
								afterLoad: function(anchorLink, index) {
									section_nav_handler(index - 1);
									jQuery(document).trigger('section-start', [jQuery(me.sections[index - 1]), index - 1]);
									current_index = index - 1;
									reach = 1;
									if (index > 1) {
										setTimeout(function() {
											jQuery('body').addClass('scrolling');
										}, 500);
									}
								},
								onLeave: function(index, nextIndex, direction) {
									// reach =
									section = jQuery(me.sections[index - 1]);
									section_nav_handler(nextIndex - 1);
									if (nextIndex > 1) {
										jQuery('body').addClass('scrolling');
									} else {
										jQuery('body').removeClass('scrolling');
									}
									section.removeClass('in');
									section = jQuery(me.sections[nextIndex - 1]);
									section.addClass('in');
									jQuery(document).trigger('section-in', [section, nextIndex - 1]);
								},
							});
							jQuery(section_nav).on('click', 'li', function() {
								var index = jQuery(this).data('index');
								jQuery.fn.fullpage.moveTo(index + 1);
							});
							jQuery(document).on('scrolling-disable', function() {
								jQuery.fn.fullpage.destroy();
							});
						};
						fullPage(scroll_selector);
						this.fullpage = true;

						break;
					}
			}
		}
		var current = null;

		var mobileHandler = function(section) {
			jQuery('html, body').animate(
				{
					scrollTop: jQuery(section).offset().top - jQuery('.navbar').height(),
				},
				1000
			);
			return true;
		};
		var desktopHandler = function(section) {
			if (me.scene) {
				var offset = me.scene.scrollOffset();
				var index = section.data('index');
				if (index) {
					jQuery('html, body').animate(
						{
							scrollTop: offset * (index + 1),
						},
						2000
					);
				}
				// me.controller.scrollTo('#section-' + hash.replace('#', ''));
				return true;
			} else if (me.fullpage && me.sections) {
				var index = jQuery(me.sections).index(jQuery(section));
				if (index >= 0) jQuery.fn.fullpage.moveTo(index + 1);
				else {
					index = jQuery(me.sections).index(
						jQuery(me.sections)
							.find(jQuery(section))
							.closest('section')
					);
					if (index > 0) jQuery.fn.fullpage.moveTo(index);
					else jQuery.fn.fullpage.moveTo(1);
				}
			} else {
				jQuery('html, body').animate(
					{
						scrollTop: jQuery(section).offset().top - jQuery('.navbar').height(),
					},
					1000
				);
			}
			return false;
		};

		var handler = jQuery(window).width() > this.options.mobile ? desktopHandler : mobileHandler;
		if (jQuery(window).width() <= this.options.mobile) {
			jQuery('body').addClass('no-scrolling-style');
		}
		this.scrollHandler = function() {
			var hash = location.hash;
			if (hash.replace('#', '').trim() == '' || hash.indexOf('#!') >= 0) {
				return false;
			}
			jQuery('.content').removeClass('active');
			var menu_item = jQuery('#menu-main-menu li a[href^="' + me.escapeRegExp(hash) + '"]');
			if (menu_item.length > 0) {
				jQuery('#menu-main-menu li a').removeClass('active');
				menu_item.addClass('active');
			} else {
				var item = jQuery('a[href^="' + me.escapeRegExp(hash) + '"]');
				if (item.length > 0 && item.get(0).hasAttribute('no-hash')) {
					location.hash = '';
				}
			}
			var section = jQuery('#section-' + hash.replace('#', ''));
			if (section.length == 0) {
				if (jQuery('#' + hash.replace('#', '')).length > 0) {
					return handler(jQuery('#' + hash.replace('#', '')));
				}
				console.warn('#section-' + hash.replace('#', '') + ' was not found, did you forget to enable permalinks?');
				return false;
			}
			return handler(section);
		};
		if ('onhashchange' in window) {
			jQuery(window).hashchange(function(event) {
				if (me.scrollHandler()) {
					event.stopPropagation();
					event.preventDefault();
				}
			});
			jQuery(window).hashchange();
		} else {
			jQuery('#menu-main-menu li a[href^=\\/\\#]').click(function(event) {
				if (me.scrollHandler()) {
					event.stopPropagation();
					event.preventDefault();
				}
			});
		}

		jQuery('.btn.btn-back').click(function() {
			jQuery('.content').removeClass('active');
			location.hash = '#home';
		});

		jQuery('a[href="#search"]').click(function() {
			jQuery('body')
				.addClass('search-active')
				.removeClass('search-closed');
			return false;
		});
		jQuery('#searchform a.search-close').click(function() {
			jQuery('body')
				.addClass('search-closed')
				.removeClass('search-active');
			setTimeout(function() {
				jQuery('body').removeClass('search-closed');
			}, 1000);
			return false;
		});
		jQuery('#main-navbar-collapse').on('shown.bs.collapse', function(e) {
			jQuery('body').addClass('menu-open');
		});
		jQuery('#main-navbar-collapse').on('hidden.bs.collapse', function(e) {
			jQuery('body').removeClass('menu-open');
		});

		var menuItems = jQuery('#navbar ul li a');
		var scrollItems = jQuery('#wrapper > section');
		jQuery(window).on('resize', function() {
			if (jQuery(window).width() <= this.options.mobile) {
				if (me.controller) {
					if (me.scene) {
						me.scene.destroy(true);
					}
					me.controller.destroy(true);
					jQuery('body').addClass('no-scrolling-style');
					jQuery(document).trigger('scrolling-disable');
				}
				handler = mobileHandler;
			} else {
				handler = desktopHandler;
				jQuery(document).trigger('scrolling-resize');
			}
		});
		jQuery(window).scroll(function() {
			// Get container scroll position
			var fromTop = jQuery(this).scrollTop() + jQuery('.navbar').outerHeight(true) + 100;

			// Get id of current scroll item
			var cur = scrollItems.map(function() {
				if (jQuery(this).offset().top < fromTop) return this;
			});
			// Get the id of the current element
			cur = cur[cur.length - 1];
			var id = cur ? jQuery(cur).attr('id') : '';
			// Set/remove active class
			menuItems.removeClass('active');
			jQuery('#navbar ul li a[section="' + id + '"]').addClass('active');

			var pos = jQuery(this).scrollTop();
			if (pos < 10) {
				jQuery('body').removeClass('scrolling');
			} else {
				jQuery('body').addClass('scrolling');
			}
		});
	};
	this.tabs = function() {
		var showTab = function(id) {
			if (jQuery('#' + id).length > 0) {
				var tab = jQuery('#' + id);
				var tabs = tab.closest('.na-tabs');
				tabs.find('.tab-content, .tab-nav').removeClass('active');
				setTimeout(function() {
					tab.addClass('active')
						.closest('li')
						.addClass('active');
					jQuery('a[href="#' + id + '"]').addClass('active');
				}, 400);
			}
		};
		jQuery(window).on('hashchange', function(e) {
			var hash = window.location.hash.replace(/^#!/, '');
			if (hash) {
				var path = hash.split('/');
				if (path[0] == 'tabs') {
					showTab(path[1]);
				}
			}
		});
	};
	this.escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	};
	this.load();
}

var threshold = 5;
var seconds = new Date().getTime() / 1000;

jQuery(window).load(function() {
	var nseconds = new Date().getTime() / 1000;
	var timeout = 10;
	if (nseconds - seconds < threshold) {
		timeout = Math.floor(threshold - (nseconds - seconds)) * 1000;
	}
	setTimeout(function() {
		jQuery('body').removeClass('loading');
		setTimeout(function() {
			jQuery('body').addClass('loaded');
			jQuery('.loading-overlay').remove();
		}, 2000);
	}, timeout);
	// setTimeout(function() {
	// 	jQuery('body').removeClass('loading');
	// setTimeout(function() {
	// 	jQuery('body').addClass('loaded');
	// }, 2000);
	// }, 2000);
	var pos = jQuery(window).scrollTop();
	if (pos > 10) {
		jQuery('body').addClass('scrolling');
	}
});
jQuery(document).ready(function() {
	var n = new theme(options);
});
