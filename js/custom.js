(function(jQuery) {
    'use strict';

    var threshold = 5;
    var seconds = new Date().getTime() / 1000;
    jQuery(window).load(function() {
        var nseconds = new Date().getTime() / 1000;
        var timeout = 10;
        if (nseconds - seconds < threshold) {
            timeout = Math.floor(threshold - (nseconds - seconds)) * 1000;
        }
        setTimeout(function() {
            //jQuery(".loading-lines").css('margin-bottom', jQuery('.navbar').outerHeight(true) -5);
            jQuery(".loading-lines").removeClass('loaded');
            jQuery(".loading-logo").removeClass('loaded');
            jQuery(".loading-slogan").removeClass('loaded');
            jQuery("#loading").fadeOut(1500);
            jQuery('.slider2_container').animate({
                opacity: 1
            }, 500);
        }, timeout);
        var pos = jQuery(this).scrollTop();
        if (pos < 10) {
            jQuery('body').removeClass('scrolling');
        } else {
            jQuery('body').addClass('scrolling');
        }

    });
    /*
    menu animation
    */
    jQuery('#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').click(function() {
        jQuery(this).toggleClass('open').promise().done(function() {
            //console.log("test");
            jQuery(".menu_overlay").toggleClass("toggle");
            jQuery("#menu-header-right").toggleClass("bringToTop");
            //jQuery(".navbar-header").toggleClass("bringToTop");
        });

    });
    jQuery(".form_opener").click(function() {
        jQuery("#contact_form").toggleClass("open");
    });
    /*
    Dropdown
    =========================== */
    jQuery('ul.navbar-nav li.dropdown').on("mouseenter", function() {
        jQuery(this).addClass('active');
        jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
        return false;
    })
    jQuery('ul.navbar-nav li.dropdown').on("mouseleave", function() {
        jQuery(this).removeClass('active');
        jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
        return false;
    });

    // ======================================
    // Accordion
    // ======================================
    jQuery('.accordion').find('.accordion-toggle').click(function() {

        //Expand or collapse this panel
        var me = jQuery(this);
        jQuery('.accordion').find('.accordion-toggle').not(jQuery(this)).removeClass('active');
        jQuery(this).next().slideToggle(500, function() {
            if (jQuery(this).is(':visible')) {
                me.addClass('active');
            } else {
                me.removeClass('active');
            }
        });

        //Hide the other panels
        jQuery(".accordion-content").not(jQuery(this).next()).slideUp('fast');
    });
    /*
    Image hover
    =========================== */

    jQuery('.logo-link').on("mouseenter", function() {
        jQuery(this).find('.client-hover').stop().fadeTo(900, 1);
        jQuery(this).find('.client').stop().fadeTo(900, 0);
        return false;
    })
    jQuery('.logo-link').on("mouseleave", function() {
        jQuery(this).find('.client-hover').stop().fadeTo(900, 0);
        jQuery(this).find('.client').stop().fadeTo(900, 1);
        return false;
    });
    jQuery('#featured').on('click', function(event) {
        var target = event.target ? event.target : event.srcElement;
        if (target.tagName != 'A' && target.tagName != 'IMAGE' && target.tagName != 'LI') {
            jQuery('.content').removeClass('active');
            window.location.hash = "";
        }
    });
    jQuery(document).keyup(function(e) {
        if (e.keyCode === 27) {
            jQuery('.content').removeClass('active'); // esc
            window.location.hash = "";
        }
    });
    jQuery('a[data-toggle]').click(function() {
        var x = jQuery(this).data('toggle');
        if (jQuery(x).length == 0) {
            return true;
        }
        jQuery(x).toggleClass('expand');
        return false;
    });
    jQuery('a.video-handler').click(function() {
        jQuery('#video-div iframe').attr('src', jQuery(this).data('video'));
        jQuery('body').addClass('video-active');
        return false;
    });
    jQuery('a.video-close').click(function() {
        jQuery('#video-div iframe').attr('src', '');
        jQuery('body').removeClass('video-active');
        return false;
    });
    setTimeout(function() {
        jQuery(".zoomLens img").click(function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.cancelBubble = true;
            e.preventDefault();
        })
    }, 1000);
})(jQuery);
