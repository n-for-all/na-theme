jQuery(document).ready(function(){
    jQuery('.switcher-nav select').on('change', function(event){
        event.preventDefault();
        window.location.hash = jQuery(this).find('option:selected').val();
        if (!("onhashchange" in window)) {
            jQuery( window ).trigger( 'hashchange' );
        }
    });

    jQuery( window ).on( 'hashchange', function( e ) {
        var hash = window.location.hash.replace(/^#!/,'');
        if(hash){
            var switcher = hash.split('/');
            if(switcher[0] == 'switch'){
                showSwitch(switcher[1], switcher[2]);
            }
        }
    } );
    function showSwitch(id, index){
        index = parseFloat(index) - 1;
        var switcher = jQuery("#switcher-"+ id);
        var nav = switcher.find('.switcher-content > div');
        var select = switcher.find('.switcher-nav select > option');
        if(nav.eq(index)){
            nav.not(switcher.eq(index)).removeClass('active');
            var tab = nav.eq(index);
            tab.addClass('active', 'active');
            select.removeAttr('selected').eq(index).attr('selected', 'selected');
        }
    }
});
