// ajaxyTooltip, facebook style tooltips for jquery
// version 1.0.0
// (c) 2012 Naji amer [icu090@gmail.com]
// released under the MIT license

(function(jQuery) {

    function AjaxyCall(func, param) {
        return (typeof func == 'function' ? (func(param)): (typeof window[func] == 'function') ? (window[func](param)) : func);
    };

    function AjaxyToolTip(element, options) {
        this.AjaxyElement = jQuery(element);
        this.options = options;
        this.enabled = true;
        this.removeTitle();
    };

    AjaxyToolTip.prototype = {
		ajaxCalled: false,
        show: function() {
			window.ajaxy_ref = this.AjaxyElement.attr('ajaxy-ref');
            var title = this.getTitle();
            if (title && this.enabled) {
                var AjaxyTip = this.tip();
				if(this.options.ajax && this.options.ajax.url){
					if(this.options.ajax.indicator){
						AjaxyTip.find('.ajaxyTooltip-content')[this.options.html ? 'html' : 'text'](AjaxyCall(this.options.ajax.indicator, [this]));
					}
					AjaxyTip.find('.ajaxyTooltip-content')[this.options.html ? 'html' : 'text']('<div class="ajaxyTooltip-indicator">&nbsp;</div>');
					jQuery.fn.ajaxyTooltip.ajaxCall(AjaxyTip, this);
				}
				else{
					AjaxyTip.find('.ajaxyTooltip-content')[this.options.html ? 'html' : 'text'](title);
				}
                AjaxyTip[0].className = 'ajaxyTooltip'; // reset classname in case of dynamic position
                AjaxyTip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);

				this._position();

                if (this.options.fade) {
                    AjaxyTip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    AjaxyTip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        _position: function(){
			var AjaxyTip = this.tip();
			var position = false;
			if(this.options.position){
				position = AjaxyCall(this.options.position, this);
			}
			else{
				position = AjaxyCall(jQuery.fn.ajaxyTooltip.auto, this);
			}
			var pos = jQuery.extend({}, this.AjaxyElement.offset(), {
				width: this.AjaxyElement[0].offsetWidth,
				height: this.AjaxyElement[0].offsetHeight
			});
			AjaxyTip.find('.ajaxyTooltip-arrow')[0].className = 'ajaxyTooltip-arrow ajaxyTooltip-arrow-' + position.charAt(0);


			var actualWidth = AjaxyTip.innerWidth(),
				actualHeight = AjaxyTip.innerHeight();
			var tp;
			switch (position.charAt(0)) {
				case 'b':
					tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
					break;
				case 't':
					tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
					break;
				case 'r':
					tp = {top: pos.top + pos.height/2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset + 2};
					break;
				case 'l':
					tp = {top: pos.top + pos.height/2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset - 2};
					break;
			}

            AjaxyTip.addClass('ajaxyTooltip-' + position.charAt(0));
            AjaxyTip.addClass('ajaxyTooltip-' + position.charAt(1));


			if (position.length == 2) {
                if(position.charAt(0) == 't' || position.charAt(0) == 'b'){
    				if (position.charAt(1) == 'm') {
    					tp.left = (pos.left + pos.width/2) - actualWidth/2 ;
    				}else if (position.charAt(1) == 'l') {
    					tp.left = pos.left;
    				} else {
    					tp.left = pos.left + pos.width - actualWidth;
    				}
                }
                if(position.charAt(0) == 'l' || position.charAt(0) == 'r'){
    				if (position.charAt(1) == 'm') {
    					tp.top = (pos.top + pos.height/2) - actualHeight/2 ;
    				}
                }
			}

			AjaxyTip.css(tp);
		},
        hide: function() {
			if(!this.options.clickable){
				this.tip().hide();
			}
        },
        //this removes the title to disable the browser toolTip
        removeTitle: function() {
			var id = 'ajaxyTooltip-' + (new Date).getTime();
            var element = this.AjaxyElement;
            if (element.attr('title') || typeof(element.attr('ajaxy-title')) != 'string') {
                element.attr('ajaxy-title', element.attr('title') || '').removeAttr('title');
                element.attr('ajaxy-ref', id);
            }
        },

        getTitle: function() {
            var title, element = this.AjaxyElement, options = this.options;
            this.removeTitle();
            var title, options = this.options;
			if	(options.ajax && options.ajax.url){
				title = jQuery('#'+ element.attr('ajaxy-ref')).html();
			} else if (options.getTitle == false) {
                title = element.attr(options.getTitle == false ? 'ajaxy-title' : options.getTitle);
            } else if (typeof options.getTitle == 'string') {
                title = element.attr(options.getTitle);
            } else if (typeof options.getTitle == 'function') {
                title = options.getTitle.call(this, element, options);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || options.emptyTitle;
        },

        tip: function() {
			this.AjaxyTip = jQuery('.ajaxyTooltip');
            if (this.AjaxyTip.length == 0) {
                this.AjaxyTip = jQuery('<div class="ajaxyTooltip"></div>').html('<div class="ajaxyTooltip-inner"><div class="ajaxyTooltip-arrow">'+jQuery('#tooltip-arrow').html()+'</div><div class="ajaxyTooltip-content"></div></div>');
            }
            return this.AjaxyTip;
        },

        validate: function() {
            if (!this.AjaxyElement[0].parentNode) {
                this.hide();
                this.AjaxyElement = null;
                this.options = null;
            }
        },
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };



    jQuery.fn.ajaxyTooltip = function(options) {

        if (options === true) {
            return this.data('ajaxyTooltip');
        } else if (typeof options == 'string') {
            var ajaxyTooltip = get(this);
            if (ajaxyTooltip) ajaxyTooltip[options]();
            return this;
        }

        options = jQuery.extend({}, jQuery.fn.ajaxyTooltip.defaults, options);

        get(this);

        function get(ele) {
            var ajaxyTooltip = jQuery.data(ele, 'ajaxyTooltip');
            if (!ajaxyTooltip) {
                ajaxyTooltip = new AjaxyToolTip(ele, jQuery.fn.ajaxyTooltip.elementOptions(ele, options));
                jQuery.data(ele, 'ajaxyTooltip', ajaxyTooltip);
            }
            return ajaxyTooltip;
        }

        function mouseEnter() {
            var ajaxyTooltip = get(this);
			if(options.onHover){
				AjaxyCall(options.onHover, [this, 1]);
			}
			ajaxyTooltip.hoverState == 'in';
            jQuery('body').addClass('ajaxyTooltip-active');
            if (options.delayShow == 0) {
                ajaxyTooltip.show();
            }
			else {
                ajaxyTooltip.removeTitle();
                jQuery('body').addClass('ajaxyTooltip-deactivating');
                setTimeout(function() {
                    jQuery('body').removeClass('ajaxyTooltip-deactivating');
                    jQuery('body').removeClass('ajaxyTooltip-active');
                    ajaxyTooltip.show();
                }, options.delayShow);
            }
        };

        function mouseLeave() {
            var ajaxyTooltip = get(this);
			if(options.onHover){
				AjaxyCall(options.onHover, [this, 0]);
			}
			ajaxyTooltip.hoverState == 'out';
            if (options.delayHide == 0) {
                ajaxyTooltip.hide();
            } else {
                setTimeout(function() {  ajaxyTooltip.hide(); }, options.delayHide);
            }
        };

        if (options.trigger != 'manual') {
            var binder   = 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, mouseEnter)[binder](eventOut, mouseLeave);
        }
        return this;
    };



    jQuery.fn.ajaxyTooltip.elementOptions = function(ele, options) {
        return jQuery.metadata ? jQuery.extend({}, options, jQuery(ele).metadata()) : options;
    };
    jQuery.fn.ajaxyTooltip.defaults = {
        delayShow: 0, // time to delay before showing the tooltip
        delayHide: 100	, // time to delay after showing the tooltip
        fade: false,// Whether to fade the tooltip or not (it will animate the opacity only, not supported by old browsers)
        opacity: 1, // the opacity of the tooltip
		position: false, // the position of the tooltip
        html: true, // whether the tooltip is html or text
        offset: 0,
        trigger: 'hover',
		onHover:false,
		ajax:{url:null, type:'GET', data:'getPostId', fail:false, success:'', indicator:false},
		clickable:false,
		getTitle:false,
		emptyTitle:false
    };
    jQuery.fn.ajaxyTooltip.auto = function(item) {
		var element = {top: jQuery(item.AjaxyElement).offset().top, left:jQuery(item.AjaxyElement).offset().left, height:jQuery(item.AjaxyElement).innerHeight(), width:jQuery(item.AjaxyElement).innerWidth()};
		var t = '';
		var tip = {height:item.tip().innerHeight(), width:item.tip().innerWidth()};
		if(element.top - tip.height > 0){
			t = 't';
		} else{
			t = 'b';
		}
		if(element.left + tip.width <= jQuery(document).width() + 2){
			t += 'l';
		} else{
			t += 'r';
		}
		return t;
	};

	jQuery.fn.ajaxyTooltip.ajaxCall = function(tip, item) {
		if(jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).length > 0){
			jQuery(tip).find('.ajaxyTooltip-content').html(jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).html());
		}
		else{
			jQuery.ajax({
				  type: item.options.ajax.type,
				  url: item.options.ajax.url,
				  data: AjaxyCall(item.options.ajax.data, item.AjaxyElement)
				}).done(function( msg ) {
					if(jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).length > 0){
						jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).html(msg);
					}
					else{
						jQuery('body').append('<div style="display:none" id="' + jQuery(item.AjaxyElement).attr('ajaxy-ref') + '">'+msg+'</div>');
					}
					jQuery(tip).find('.ajaxyTooltip-content').html(AjaxyCall(item.options.ajax.success, msg));
					item._position();
				}).fail(function( msg ) {
					if(jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).length > 0){
						jQuery('#' + jQuery(item.AjaxyElement).attr('ajaxy-ref')).html('');
					}
					else{
						jQuery('body').append('<div style="display:none" id="' + jQuery(item.AjaxyElement).attr('ajaxy-ref') + '"></div>');
					}
					jQuery(tip).find('.ajaxyTooltip-content').html(AjaxyCall(item.options.ajax.fail, msg));
					item._position();
			});
		}
	}
})(jQuery);
