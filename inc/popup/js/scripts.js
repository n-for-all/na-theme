jQuery(document).ready(function(){
    var popup = null;
    function showPopup(id){
        popup = jQuery("#popup-"+ id);
        popup.find('.popup-content').css('max-height', jQuery(window).height() - 40 + "px");
        popup.addClass('active');
        jQuery('body').addClass('na-popup-active');
    }

    function showPopupAjax(id, element) {
        if(jQuery("#popup-"+ id).length == 0){
            var _class= '';
            if(element && element.length > 0){
                _class = element.attr('popup-class');
            }
            jQuery('body').append('<div id="popup-'+ id + '" class="popup '+_class+'"><a class="close-popup" href="#">&times;</a><div class="popup-content"></div></div>')
        }
        popup = jQuery("#popup-"+ id);
        popup.find('.popup-content').css('max-height', jQuery(window).height() - 40 + "px");
        jQuery.ajax({
            url: PopupSettings.url,
            type: 'post',
            dataType: "json",
            data: {
                action: 'popup',
                id: id
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('popup');
                    if(jQuery('#tmpl-popup-' + result.post.type).length > 0){
                        post_template = wp.template('popup-'+ result.post.type);
                    }
                    popup.find('.popup-content').html(post_template(result.post));
                    jQuery('body').addClass('na-popup-active');
                    popup.addClass('active');
                }else{
                    jQuery('.popup .close-popup').trigger('click');
                }
            }
        }).fail(function() {
            jQuery('.popup .close-popup').trigger('click');
        });
        return false;
    }

    jQuery( window ).on( 'hashchange', function( e ) {
        var hash = window.location.hash.replace(/^#!/,'');
        if(hash){
            var path = hash.split('/');
            if(path[0] == 'popup'){
                if(path[1] == 'load'){
                    showPopupAjax(path[2], jQuery('a[href="'+window.location.hash+'"]'));
                }else{
                    showPopup(path[1]);
                }
            }
        }
    } );

    jQuery(document).on('click', '.popup .close-popup', function(event){
        event.preventDefault();
        event.stopPropagation();
        jQuery(this).closest('.popup').removeClass('active');
        window.location.hash = '#!';
        jQuery('body').removeClass('na-popup-active');
    });

    jQuery('.popup').on('scroll mousewheel DOMMouseScroll', function(event){
        event.stopPropagation();
    });

    jQuery(document).on('keydown', function(event) {
        if (popup && event.keyCode == 27) {
            event.preventDefault();
            event.stopPropagation();
            jQuery('.close-popup').trigger('click');
        }
    });
    jQuery(window).on('resize', function(event) {
        if(popup){
            popup.find('.popup-content').css('max-height', jQuery(window).height() - 40 + "px");
        }
    });

    if (!("onhashchange" in window)) {
        jQuery( window ).trigger( 'hashchange' );
    }
});
