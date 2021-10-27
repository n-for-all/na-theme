app.ready(function() {
    var last = null;
    function showCaseStudy(id) {
        var inner = jQuery('.case-studies-inner');
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
        document.body.classList.add("na-case-study-active");
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
                id: id
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('case-study');
                    jQuery(".case-studies-inner-clone").html("<div id='na-case-study-template'><a class='close' href='#'></a>" + post_template(result.post) + "</div>");
                    setTimeout(function() {
                        jQuery('#na-case-study-template').css('opacity', 1);
                    }, 100);
                }else{
                    jQuery('.close-case-studies').trigger('click');
                    document.body.classList.remove('na-case-study-active');
                }
            }
        }).fail(function(){
            jQuery('.close-case-studies').trigger('click');
            document.body.classList.remove('na-case-study-active');
        });
        return false;
    }
    jQuery(document).on('keydown', function(event) {
        if (last && event.keyCode == 27) {
            event.preventDefault();
            jQuery('.close-case-studies').trigger('click');
        }
    });
    jQuery(window).on('hashchange', function(e) {
        var hash = window.location.hash.replace(/^#!/, '');
        if (hash) {
            var path = hash.split('/');
            if (path[0] == 'case-study') {
                showCaseStudy(path[1]);
            }
        }
    });
    jQuery(document).on("click", ".close-case-studies", function(event) {
        event.preventDefault();
        if (last) {
            document.body.classList.remove('na-case-study-active');
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
            document.body.classList.remove('na-case-study-active');
        }
        jQuery('html, body').css('overflow', '');
        window.location.hash = '#!';
        return false;
    });
});
