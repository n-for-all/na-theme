function theme(options) {
    this.options = options;
    this.controller = null;
    this.scene = null;
    this.load = function() {
        var me = this;
        if (this.options.scrolling) {
            var slides = jQuery("#inner-scroll>section");
            var count = slides.length;
            if (count > 0) {
                // jQuery("#inner-scroll>section").height(jQuery(window).height());
                // jQuery("#inner-scroll>.inner-scroll-inner").width((100 * count + "%"));
                // jQuery("#inner-scroll>section").width((widthPercent + "%"));

                var flip = false;
                var widthPercent = 100 / count;
                // console.log(this.options.scrolling);
                switch (this.options.scrolling) {
                    case "2":
                        slides.width((widthPercent + "%")).css({
                            'min-height': jQuery(window).height()
                        });
                        jQuery("#inner-scroll").width((100 * count + "%"));
                        // jQuery(".scrolling-container--2").width((100 * count + "%"));
                        me.controller = new ScrollMagic.Controller({});
                        var wipeAnimation = new TimelineMax();

                        for (i = 0; i < count; i++) {
                            wipeAnimation.to("#inner-scroll", 0.5, {
                                    z: -300,
                                    delay: 1
                                })
                                .to("#inner-scroll", 2, {
                                    x: "-" + (widthPercent * (i + 1)) + "%"
                                })
                                .to("#inner-scroll", 0.5, {
                                    z: 0
                                });
                            flip = !flip;
                        }

                        // create scene to pin and link animation
                        var count = slides.length > 0 ? slides.length : 1;
                        me.scene = new ScrollMagic.Scene({
                                triggerElement: ".scrolling-container--2",
                                triggerHook: "onLeave",
                                duration: "500%"
                            })
                            .setPin(".scrolling-container--2")
                            .setTween(wipeAnimation)
                            .addTo(me.controller);
                        var _current = 0;
                        var offset = 0.3; //offset in percentage
                        met.scene.on("progress", function(event) {
                            var direction = event.scrollDirection == 'FORWARD' ? 0 : 0;
                            var v = (event.progress * count) + offset + 1;
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

                        break;
                    case "3":
                        slides.css({
                            'height': jQuery(window).height()
                        });
                        me.controller = new ScrollMagic.Controller({
                            globalSceneOptions: {
                                triggerHook: 'onLeave'
                            }
                        });
                        // get all slides
                        // console.log(slides.get(i));
                        // create scene for every slide
                        for (var i = 0; i < slides.length; i++) {
                            new ScrollMagic.Scene({
                                    triggerElement: slides.get(i)
                                })
                                .setPin(slides.get(i))
                                .addTo(me.controller);
                        }
                        break;
                    case "4":
                        me.controller = new ScrollMagic.Controller();
                        // define movement of panels
                        var wipeAnimation = new TimelineMax();

                        var is_x = true;
                        var is_negative = true;
                        // create scene for every slide
                        for (var i = 0; i < slides.length; i++) {
                            if (i == 0) {
                                wipeAnimation.fromTo(slides[i], 1, {
                                    x: "0%",
                                    y: 0
                                }, {
                                    x: "0%",
                                    y: "0%",
                                    ease: Linear.easeNone
                                });
                                continue;
                            }
                            var dir = {};
                            if (is_x) {
                                if (is_negative) {
                                    dir["x"] = "-100%";
                                } else {
                                    dir["x"] = "100%";
                                }
                                is_negative = !is_negative;
                            } else {
                                if (is_negative) {
                                    dir["y"] = "-100%";
                                } else {
                                    dir["y"] = "100%";
                                }
                                is_negative = !is_negative;
                            }
                            is_x = !is_x;
                            if (i % 2 == 0 && i != 0) {
                                is_x = !is_x;
                            }
                            wipeAnimation.fromTo(slides[i], 1, dir, {
                                x: "0%",
                                y: "0%",
                                ease: Linear.easeNone
                            });
                            // console.log(dir);
                        }
                        // create scene to pin and link animation
                        me.scene = new ScrollMagic.Scene({
                                loglevel: 2,
                                triggerElement: "#inner-scroll",
                                triggerHook: "onLeave",
                                duration: (100 * count) + "%"
                            })
                            .setPin("#inner-scroll")
                            .setTween(wipeAnimation)
                            .addTo(me.controller);
                        break;
                    default:
                        var sections = jQuery('section.section-scroll');

                        if (sections.length > 0) {
                            var section_nav = jQuery('<div class="section-nav"><ul class="inner"></ul></div>').appendTo('body').find('.inner');
                            sections.each(function(index, section) {
                                section_nav.append('<li data-index="' + index + '">' + index + '</li>');
                            });
                            jQuery(section_nav).on('click', 'li', function() {
                                var index = jQuery(this).data('index');
                                jQuery('html,body').animate({
                                        scrollTop: jQuery(sections[index]).offset().top
                                    },
                                    'slow'
                                );
                            });
                            var section_nav_handler = function(index) {
                                section_nav.find('li').each(function(i, item) {
                                    if (i == index) {
                                        jQuery(item).addClass('active');
                                    } else {
                                        jQuery(item).removeClass('active');
                                    }
                                });
                            }
                            let offset = -20; //in percentage
                            jQuery(window).on('scroll', function() {
                                sections.each(function(index, section) {
                                    section = jQuery(section);
                                    var height = section.outerHeight(true);
                                    var top = section.position().top + offset * height / 100;
                                    if (jQuery(window).scrollTop() >= top) {
                                        section.addClass('in-once');
                                        if (jQuery(window).scrollTop() <= top + height) {
                                            section_nav_handler(index);
                                            section.addClass('in');
                                        } else {
                                            section.removeClass('in');
                                        }
                                    } else {
                                        section.removeClass('in');
                                    }
                                })

                            });
                        }
                        break;
                }
            }
        }
        var current = null;
        // me.controller.scrollTo(function(newScrollPos) {
        //     console.log('pos', newScrollPos);
        //     jQuery("html, body").animate({
        //         scrollTop: newScrollPos
        //     });
        // });
        if ("onhashchange" in window) {
            jQuery(window).hashchange(function(event) {
                event.stopPropagation();
                event.preventDefault();
                var hash = location.hash;
                if(hash.replace('#', '').trim() == '' || hash.indexOf('#!') >= 0){
                    return false;
                }
                jQuery(".content").removeClass('active');
                var menu_item = jQuery('#menu-main-menu li a[href^="' + me.escapeRegExp(hash) + '"]');
                if (menu_item.length > 0) {
                    jQuery("#menu-main-menu li a").removeClass('active');
                    menu_item.addClass('active');
                }
                var section = jQuery('#section-' + hash.replace('#', ''));
                if (section.length == 0) {
                    console.warn('#section-' + hash.replace('#', '') + ' was not found, did you forget to enable permalinks?');
                    return;
                }
                if (me.scene) {
                    var offset = me.scene.scrollOffset();
                    var index = section.data('index');
                    if(index){
                        jQuery("html, body").animate({
                            scrollTop: offset*(index+1)
                        }, 2000);
                    }
                    // me.controller.scrollTo('#section-' + hash.replace('#', ''));
                    return;
                }
                jQuery('html, body').animate({
                    scrollTop: jQuery(section).offset().top - jQuery('.navbar').height()
                }, 1000);
            });
            // Since the event is only triggered when the hash changes, we need to trigger
            // the event now, to handle the hash the page may have loaded with.
            jQuery(window).hashchange();
        } else {
            jQuery('#menu-main-menu li a[href^=\\/\\#]').click(function(event) {
                var hash = location.hash;
                jQuery(".content").removeClass('active');
                var menu_item = jQuery('#menu-main-menu li a[href^="' + me.escapeRegExp(hash) + '"]');
                if (menu_item.length > 0) {
                    jQuery("#menu-main-menu li a").removeClass('active');
                    menu_item.addClass('active');
                }
                jQuery('html, body').animate({
                    scrollTop: jQuery(jQuery(this).attr("href").replace('/', '')).offset().top - jQuery('.navbar').height()
                }, 1000);
            });
        }

        jQuery(".btn.btn-back").click(function() {
            jQuery(".content").removeClass('active');
            location.hash = "#home";
        });

        jQuery('a[href="#search"]').click(function() {
            jQuery('body').addClass('search-active').removeClass('search-closed');
            return false;
        });
        jQuery('#searchform a.search-close').click(function() {
            jQuery('body').addClass('search-closed').removeClass('search-active');
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
        jQuery(window).scroll(function() {
            // Get container scroll position
            var fromTop = jQuery(this).scrollTop() + jQuery('.navbar').outerHeight(true) + 100;

            // Get id of current scroll item
            var cur = scrollItems.map(function() {
                if (jQuery(this).offset().top < fromTop)
                    return this;
            });
            // Get the id of the current element
            cur = cur[cur.length - 1];
            var id = cur ? jQuery(cur).attr('id') : "";
            // Set/remove active class
            menuItems.removeClass("active");
            jQuery('#navbar ul li a[section="' + id + '"]').addClass("active");

            var pos = jQuery(this).scrollTop();
            if (pos < 10) {
                jQuery('body').removeClass('scrolling');
            } else {
                jQuery('body').addClass('scrolling');
            }
        });
    };
    this.escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    this.load();
}
jQuery(window).load(function() {
    setTimeout(function() {
        jQuery('body').removeClass('loading');
        setTimeout(function() {
            jQuery('body').addClass('loaded');
        }, 2000);
    }, 2000);
});
jQuery(document).ready(function() {
    var n = new theme(options);
});
