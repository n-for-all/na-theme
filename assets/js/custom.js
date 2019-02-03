(function(jQuery) {
    'use strict';

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
