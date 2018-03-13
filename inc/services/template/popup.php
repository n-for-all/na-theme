<div class="service-tpl">
    <a href="#" class="close-service">&times;</a>
    <div class="service-tpl-inner">
        <header <# if(data.image != '') { #>style="background-image:url({{data.image}})"<# }else{ #>class="no-image"<# } #>>
            <div class="container">
                <div class="row">
                    <div class="col-md-8 col-md-offset-2">
                        <h2>
                            {{{data.title}}}
                        </h2>
                        <span class="service-tagline-tpl">
                              {{{data.meta.tagline}}}
                        </span>
                    </div>
                </div>
            </div>
        </header>
        <div class="container">
            <div class="row">
                <div class="col-md-8 col-md-offset-2">
                    <div class="entry-content">
                        <div class="service-content-tpl">{{{ data.content }}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
