jQuery(document).ready(function($) {
    jQuery('button.na-sidebar-save').click(function(){
        var data = jQuery(this).closest('form').serialize();
        jQuery.post(ajaxurl, data, function(response) {
            alert(response);
        });
        return false;
    });
});
