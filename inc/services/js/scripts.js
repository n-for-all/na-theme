jQuery(document).ready(function() {
    var last = null;

    function showService(element, id) {
        var wrapper = jQuery('.na-services').data('wrapper');
        if (wrapper == '' || jQuery(wrapper).prop('tagName').toLowerCase() == 'body') {
            wrapper = jQuery('body');
        }else{
            wrapper = jQuery(wrapper).parent();
        }
        jQuery('html').css('overflow', 'hidden');
        var inner = jQuery('a[data-id="'+id+'"]').closest('.service-inner');
        var clone = jQuery('.service-inner-clone');
        if (jQuery('.service-inner-clone').length == 0) {
            clone = jQuery('<div class="service-inner-clone"></div>');
        }
        last = inner;
        var coor = wrapper.get(0).getBoundingClientRect();
        clone.css({
            height: inner.height(),
            width: inner.width(),
            top: coor.top,
            left: coor.left,
            opacity: 0.9
        });
        jQuery('body').addClass("na-service-active");
        wrapper.append(clone);

        setTimeout(function() {
            clone.addClass('fill-width');
        }, 40);
        setTimeout(function() {
            clone.addClass('fill-height');
        }, 600);
        // setTimeout(function() {
        //     jQuery(".service-inner-clone").css({
        //         'overflow': 'overlay'
        //     });
        // }, 1300);
        // jQuery(".service-inner-clone").css({
        //     'overflow': 'hidden'
        // });
        jQuery.ajax({
            url: options.ajax,
            type: 'post',
            dataType: "json",
            data: {
                action: 'service',
                id: id
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('service');
                    jQuery(".service-inner-clone").html("<div id='na-service-template'>" + post_template(result.post) + "</div>");
                    setTimeout(function() {
                        jQuery('#na-service-template').css('opacity', 1);
                    }, 100);
                }else{
                    jQuery('.close-service').trigger('click');
                    jQuery('body').removeClass('na-service-active');
                }
            }
        }).fail(function(){
            jQuery('.close-service').trigger('click');
            jQuery('body').removeClass('na-service-active');
        });
        return false;
    }
    jQuery(document).on('keydown', function(event) {
        if (last && event.keyCode == 27) {
            event.preventDefault();
            jQuery('.close-service').trigger('click');
        }
    });
    jQuery(window).on('hashchange', function(e) {
        var hash = window.location.hash.replace(/^#!/, '');
        if (hash) {
            var path = hash.split('/');
            if (path[0] == 'service') {
                showService(this, path[1]);
            }
        }
    });

    jQuery(document).on("click", ".close-service", function(event) {
        event.preventDefault();
        jQuery('html').css('overflow', '');
        if (last) {
            jQuery('body').removeClass('na-service-active');
            jQuery('#na-service-template').fadeOut();
            jQuery('#na-service-template').css({
                'display': 'none'
            });
            jQuery(".service-inner-clone").css({
                'opacity': 0
            });
        } else {
            jQuery('body').removeClass('na-service-active');
        }
        window.location.hash = '#!';
        return false;
    });
    if (!("onhashchange" in window)) {
        jQuery(window).trigger('hashchange');
    }
});
