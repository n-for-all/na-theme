<div class="event-tpl">
    <div class="event-tpl-inner">
        <div class="container-fluid">
            <div class="row row-equal">
                <div class="col-md-4">
                    <div class="events-image" style="background-image:url({{data.image}})">
                        <img class="events-image-tpl" src="{{data.image}}" />
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="entry-content">
                        <h2>
                          {{data.title}}
                        </h2>
                        <# if(data.meta.location){ #>
                            <div class="events-location-tpl">
                              {{data.meta.location}}
                            </div>
                        <# } #>
                        <# if(data.meta.type == 'range' && data.meta.range && data.meta.range.length == 2){ #>
                            <div class="events-date-tpl">
                              <span>{{{data.meta.range[0].date}}}</span> <i>to</i> <span>{{{data.meta.range[1].date}}}</span>
                            </div>
                        <# } #>
                        <# if(data.meta.type == 'single' && data.meta.range && data.meta.range.length > 0){ #>
                            <div class="events-date-tpl">
                                <i>On</i>
                            <# _.each(data.meta.range, function(range){ #>
                                <span>{{{range.date}}}</span>
                            <# }); #>
                            </div>
                        <# } #>
                        {{{ data.content }}}
                        <# if(data.meta.image){
                            #>
                            <div class="events-images-tpl">
                                <ul>
                                <# _.each(data.meta.image, function(image){ #>
                                    <li><a target="_blank" href="{{{image.full}}}"><img src="{{{image.thumbnail}}}" /></a></li>
                                <# }); #>
                              </ul>
                          </div>
                          <# } #>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
