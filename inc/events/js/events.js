(function() {
    function showEvent(post_id){
        jQuery("body").addClass("na-events-overlay");
        jQuery.ajax({
            url: events_ajax,
            type: 'post',
            cache: false,
            dataType: "json",
            data: {
                action: 'event',
                id: post_id
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('event');
                    jQuery("body").append("<div id='na-event-template'><div><a class='close-events' href='#'></a>" + post_template(result.post) + "</div></div>");
                    jQuery('#na-event-template').fadeIn();
                }
            },
            error: function() {
                jQuery("body").removeClass("na-events-overlay");
            }
        })
    }
    jQuery(document).on("click", ".events-button", function() {
        event.preventDefault();
        showEvent(jQuery(this).data("id"));
        window.location.hash = '!event/' + jQuery(this).data("id");
        return false;
    });
    jQuery(document).on("click", ".close-events", function() {
        event.preventDefault();
        jQuery('#na-event-template').fadeOut(function() {
            jQuery(this).remove();
            jQuery("body").removeClass("na-events-overlay");
        });

    });
    jQuery('.events-tabs').on('click', 'a', function(event){
        event.preventDefault();
        jQuery(event.delegateTarget).find('a').removeClass('active');
        var id = jQuery(this).addClass('active').attr('href');
        var events = jQuery(this).closest('.events');
        events.find('.na-event-tab').removeClass('active');
        events.find(id).addClass('active');
    });
    jQuery( window ).on( 'hashchange', function( e ) {
        var hash = window.location.hash.replace(/^#!/,'');
        if(hash){
            var event = hash.split('/');
            if(event[0] == 'event'){
                showEvent(event[1]);
            }
        }
    } );
})();
