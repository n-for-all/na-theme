jQuery(document).ready(function() {
    var last = null;
    jQuery('.case-studies-button').click(function(event) {
        event.preventDefault();
        var inner = jQuery(this).closest('.case-studies-inner');
        var clone = jQuery('<div class="case-studies-inner-clone"></div>');
        last = inner;
        var coor = inner.get(0).getBoundingClientRect();
        clone.css({
            height: inner.height(),
            width: inner.width(),
            top: coor.top,
            left: coor.left,
            opacity: 0.9
        });
        jQuery("body").addClass("na-case-study-active");
        jQuery('body').append(clone);
        setTimeout(function() {
            clone.addClass('fill-width');
        }, 40);
        setTimeout(function() {
            clone.addClass('fill-height');
            jQuery('html, body').css('overflow', 'hidden');
        }, 600);
        setTimeout(function() {
            jQuery(".case-studies-inner-clone").css({
                'overflow': 'overlay'
            });
        }, 1300);
        jQuery(".case-studies-inner-clone").css({
            'overflow': 'hidden'
        });
        jQuery.ajax({
            url: CaseStudiesSettings.url,
            type: 'post',
            dataType: "json",
            data: {
                action: 'case_study',
                id: jQuery(this).data("id")
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('case-study');
                    jQuery(".case-studies-inner-clone").html("<div id='na-case-study-template'><a class='close' href='#'></a>" + post_template(result.post) + "</div>");
                    setTimeout(function() {
                    jQuery('#na-case-study-template').css('opacity', 1);
                }, 100);
                }
            }
        });
        return false;
    });
    jQuery(document).on("click", ".close-case-studies", function(event) {
        event.preventDefault();
        if (last) {
            jQuery("body").removeClass('na-case-study-active');
            jQuery('#na-case-study-template').fadeOut();
            jQuery('#na-case-study-template').css({
                'display': 'none'
            });
            jQuery(".case-studies-inner-clone").css({
                'opacity': 0
            });
            setTimeout(function() {
                jQuery(".case-studies-inner-clone").remove();
            }, 1000);
        } else {
            jQuery(".case-studies-inner-clone").remove();
        }
        jQuery('html, body').css('overflow', '');
        return false;
    });
    jQuery(document).on("click", ".close-team", function() {
        event.preventDefault();
        jQuery('#na-team-member-template').fadeOut(function() {
            jQuery(this).remove();
            jQuery("body").removeClass("na-team-overlay");
        });
    });
});
