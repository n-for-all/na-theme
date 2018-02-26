jQuery(document).ready(function() {
    var last = null;
    jQuery('.services-popup').click(function(event) {
        var wrapper = jQuery(this).closest('.na-services').data('wrapper');
        event.preventDefault();
        var inner = jQuery(this).closest('.service-inner');
        var clone = jQuery('.service-inner-clone');
        if(jQuery('.service-inner-clone').length == 0){
            clone = jQuery('<div class="service-inner-clone"></div>');
        }
        last = inner;
        var coor = inner.get(0).getBoundingClientRect();
        clone.css({
            height: inner.height(),
            width: inner.width(),
            top: coor.top,
            left: coor.left,
            opacity: 0.9
        });
        jQuery(wrapper).addClass("na-service-active");
        jQuery(wrapper).append(clone);
        setTimeout(function() {
            clone.addClass('fill-width');
        }, 40);
        setTimeout(function() {
            clone.addClass('fill-height');
        }, 600);
        setTimeout(function() {
            jQuery(".service-inner-clone").css({
                'overflow': 'overlay'
            });
        }, 1300);
        jQuery(".service-inner-clone").css({
            'overflow': 'hidden'
        });
        jQuery.ajax({
            url: options.ajax,
            type: 'post',
            dataType: "json",
            data: {
                action: 'service',
                id: jQuery(this).data("id")
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('service');
                    jQuery(".service-inner-clone").html("<div id='na-service-template'><a class='close' href='#'></a>" + post_template(result.post) + "</div>");
                    setTimeout(function() {
                        jQuery('#na-service-template').css('opacity', 1);
                    }, 100);
                }
            }
        });
        return false;
    });
    jQuery(document).on("click", ".close-service", function(event) {
        event.preventDefault();
        if (last) {
            var wrapper = jQuery(last).closest('.na-services').data('wrapper');
            jQuery(wrapper).removeClass('na-service-active');
            jQuery('#na-service-template').fadeOut();
            jQuery('#na-service-template').css({
                'display': 'none'
            });
            jQuery(".service-inner-clone").css({
                'opacity': 0
            });
            setTimeout(function() {
                jQuery(".service-inner-clone").remove();
            }, 1000);
        } else {
            jQuery(".service-inner-clone").remove();
        }
        return false;
    });
});
