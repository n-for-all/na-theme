;(function ( jQuery, window, document, undefined ) {

	"use strict";

	var NA_IMAGE_METABOX_SLUG = "image_metabox", defaults = {
		title : "Attachment",
		multiple : false,
		library : { type : 'image' },
		button : { text : "Select Image" }
	};

	function NA_IMAGE_METABOX ( element, options ) {
		this.element = element;
		this.options = jQuery.extend( {}, defaults, options );
		if(this.element.attr("data-multiple")){
			this.options.multiple = parseInt(this.element.attr("data-multiple"));
		}
		this._defaults = defaults;
	}

	jQuery.extend(NA_IMAGE_METABOX.prototype, {
		setAttachment: function ( ) {
			this.element.find(".na-meta-msg").hide();
			var frame = wp.media(jQuery.extend(true, {}, this.options));

			// Handle results from media manager.
			var me = this;
			frame.on('close',function( ) {
				var attachments = frame.state().get('selection').toJSON();
				me.showImages( attachments );
			});

			frame.open();
			return false;
		},
		showError:function(error){
			var me = this.element.find(".na-meta-msg");
			me.html(error);
			me.css({opacity:1});
			me.show();
		},
		hideError:function(){
			var me = this.element.find(".na-meta-msg");
			setTimeout(function(){
				me.animate({opacity:0}, 500, function() {me.hide();});
			}, 2000);
		},
		showImages:function (attachments) {
			if(attachments && attachments.length > 0) {
				for(var i = 0; i< attachments.length; i++){
					var attachment = attachments[i];
					var text_values = this.element.find(".na-meta-input").map(function() {
					   return parseInt(jQuery(this).val(), 10);
					}).get();
					if(jQuery.inArray(attachment.id, text_values) >= 0){
						this.showError("One or more selected images already exist.");
						if(!this.options.multiple){
							break;
						}
						continue;
					}
					var name = this.element.attr("data-name");
					var timestamp = new Date().getUTCMilliseconds()+ "" + Math.floor(Math.random()*10);
					var html = '<li class="na-meta-image-item"><a class="na-meta-image-remove" href="#" onclick="jQuery(this).parent().remove();return false;">x</a><div class="na-meta-image-thumb"><div class="na-centered"><img src="' + attachment.url + '" /></div><input type="hidden" name="' + name + '" class="na-meta-input" value="'+attachment.id+'" /></div></li>';
					var k = this.element.find(".na-meta-inner ul");
					if(k.length == 0){
						this.element.find(".na-meta-inner").html("<ul></ul>");
						k = this.element.find(".na-meta-inner ul");
					}
					if(!this.options.multiple){
						k.html(html);
						break;
					}
					k.append(html);
				}
				this.hideError();
			}
		}
	});

	jQuery.fn.metaboxFile = function ( options ) {
		return this.each(function() {
			var obj = jQuery.data( this, "na_" + NA_IMAGE_METABOX_SLUG );
			if ( !obj ) {
				obj = new NA_IMAGE_METABOX( jQuery(this), options );
				jQuery.data( this, "na_" + NA_IMAGE_METABOX_SLUG, obj);
			}
			var button = jQuery(this).find('button');
			button.removeAttr('disabled');
			button.click(function(){
				obj.setAttachment();
				return false;
			});
		});
	};
})( jQuery, window, document );
;(function ( jQuery, window, document, undefined ) {

	"use strict";

	var NA_REPEATER_METABOX_SLUG = "repeater_metabox", defaults = {
		button : { add : "Add", remove: "Remove" }
	};

	function NA_REPEATER_METABOX ( element, id, options ) {
		this.element = element;
		this.repeaterFields = jQuery(element).find('.repeater-fields');
		this._id = id;
		this.index = 0;
		this.options = jQuery.extend( {}, defaults, options );
		this._defaults = defaults;
	}
	jQuery(document).on('click', '.delete-repeater', function(event){
		event.preventDefault();
		jQuery(this).closest('li').remove();
		return false;
	})
	jQuery.extend(NA_REPEATER_METABOX.prototype, {
		add: function ( ) {
			var template = wp.template('repeater-' + this._id);
			this.repeaterFields.append('<li>' + template({index: this.index}) + '<a class="delete-repeater" href="#">&times;</a></li>');
			this.index ++;
			return false;
		},load: function ( repeater_values ) {
			if(repeater_values){
				var template = wp.template('repeater-' + this._id);
				for(var i = 0; i < repeater_values.length; i ++){
					if(repeater_values[i].id == this._id){
						for(var j = 0; j < repeater_values[i].values.length; j ++){
							repeater_values[i].values[j].index = this.index;
							this.repeaterFields.append('<li>' + template(repeater_values[i].values[j]) + '<a class="delete-repeater" href="#">&times;</a></li>');
							this.index ++;
						}
					}
				}
			}
			return false;
		}
	});

	jQuery.fn.metaboxRepeater = function ( options ) {
		return this.each(function() {
			var obj = jQuery.data( this, "na_" + NA_REPEATER_METABOX_SLUG );
			if ( !obj ) {
				obj = new NA_REPEATER_METABOX( jQuery(this), jQuery(this).data( 'repeater' ), options );
				jQuery.data( this, "na_" + NA_REPEATER_METABOX_SLUG, obj);
				obj.load(repeater_values);
			}
			var button = jQuery('<a href="#" class="add-repeater button button-secondary">'+obj.options.button.add+'</a>');
			button.appendTo(this);
			button.click(function(){
				obj.add();
				return false;
			});
		});
	};
})( jQuery, window, document );
jQuery(document).ready(function(){
	jQuery(".na-meta-image").metaboxFile();
	jQuery(".na-meta-repeater").metaboxRepeater();
});
