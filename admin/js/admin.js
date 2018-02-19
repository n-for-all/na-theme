jQuery(document).ready(function($) {
    jQuery('button.na-sidebar-save').click(function(){
        var data = jQuery(this).closest('form').serialize();
        jQuery.post(ajaxurl, data, function(response) {
            alert(response);
        });
        return false;
    });
    jQuery('select.na-sidebar-columns').change(function(event){
        var form = jQuery(this).closest('form');
        var data = form.serialize();
        jQuery.post(ajaxurl, data, function(response) {
            form.closest('.widgets-sortables').addClass('saved');
            setTimeout(function(){
                form.closest('.widgets-sortables').removeClass('saved');
            }, 3000);
        }, 'json').fail(function() {
            form.closest('.widgets-sortables').addClass('error');
            setTimeout(function(){
                form.closest('.widgets-sortables').removeClass('error');
            }, 3000);
            alert( "sidebar columns couldn't be saved" );
        });
        return false;
    });
});
