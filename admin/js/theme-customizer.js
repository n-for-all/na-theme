/**
 * This file adds some LIVE to the Theme Customizer live preview. To leverage
 * this, set your custom settings to 'postMessage' and then add your handling
 * here. Your javascript should grab settings from customizer controls, and
 * then make any necessary changes to the page using jQuery.
 */
( function( $ ) {
	jQuery("body").on( 'font-control-ready', function() {
		console.log("ready");
	var controls = window.na_settings;
	for(var i = 0; i < controls.length; i ++){
		function na_font_control(control, index){
			this.index = index;
			this.init = function(){
				wp.customize( this.control.select[0], function( value ) {
					value.bind( function( newval ) {
						me.variant(newval);
					});
				} );
			};
			this.variant = function (newval){
				var font_variants = false;
				jQuery('#' + this.control.select[0] + ' option:selected').each(function(){
					if(jQuery(this).val() == newval){
						font_variants = jQuery(this).attr("variants").split(",");
						return;
					}
				});
				jQuery('#' + this.control.select[1] + ' option').remove();
				for(var i = 0; i < font_variants.length; i ++){
					jQuery('#' + this.control.select[1]).append('<option value="' + font_variants[i] + '">' + font_variants[i] + '</option>');
				}
			};
			this.control = control;
			var me = this;
			this.init();
		}
		var a = new na_font_control(controls[i], i);
	}
		 /* your code here */ } );
} )( jQuery );


function api_authorize(redirect_uri){
	var key = jQuery('#customize-control-instagram_key textarea').val();
	var type = jQuery('#insta-publish option:selected').val();
	var url = 'https://api.instagram.com/oauth/authorize/?client_id='+key+'&redirect_uri='+encodeURIComponent(redirect_uri)+'&response_type='+type+'&scope=basic+public_content+follower_list';
	return window.open(url,"", "width=610,height=530");
}
