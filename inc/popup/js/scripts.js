jQuery(document).ready(function(){
    var popup = null;
    jQuery( window ).on( 'hashchange', function( e ) {
        var hash = window.location.hash.replace(/^#!/,'');
        if(hash){
            var path = hash.split('/');
            if(path[0] == 'popup'){
                showPopup(path[1]);
            }
        }
    } );

    jQuery('.popup .close-popup').on('click', function(event){
        event.preventDefault();
        event.stopPropagation();
        jQuery(this).closest('.popup').removeClass('active');
        window.location.hash = '#!';
    });

    jQuery(document).on('keydown', function(event) {
        if (popup && event.keyCode == 27) {
            event.preventDefault();
            event.stopPropagation();
            jQuery('.close-popup').trigger('click');
        }
    });

    function showPopup(id){
        popup = jQuery("#popup-"+ id);
        popup.addClass('active');
    }
    if (!("onhashchange" in window)) {
        jQuery( window ).trigger( 'hashchange' );
    }
});
