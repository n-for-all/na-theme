(function($) {

    $.fn.lbyl = function(options) {

        var s = $.extend({
            content: '',
            speed: 10,
            type: 'fade',
            fadeSpeed: 500,
            finished: function() {}
        }, options);

        var elem = $(this),
            letterArray = [],
            lbylContent = s.content,
            count = $(this).length;

        elem.empty();
        elem.append('<span class="lbyl"></span>&nbsp;');
        elem.attr('data-time', lbylContent.length * s.speed)
        elem = elem.find(".lbyl");
        for (var i = 0; i < lbylContent.length; i++) {
            letterArray.push(lbylContent[i]);
        }

        $.each(letterArray, function(index, value) {
            elem.append('<span style="display: none;">' + value + '</span>');

            setTimeout(function() {
                if (s.type == 'show') {
                    elem.find('span:eq(' + index + ')').show();
                } else if (s.type == 'fade') {
                    elem.find('span:eq(' + index + ')').fadeIn(s.fadeSpeed);
                }
            }, index * s.speed);

        });

        setTimeout(function() {
            s.finished();
        }, lbylContent.length * s.speed);

    };

}(jQuery));

/* Letter by Letter JS */
/*Full Documentation at: https://www.html5andbeyond.com/letter-by-letter-js-jquery-plugin-animated-text-plugin/*/
/**
 * Example Usage

jQuery(document).ready(function($) {
    $(".example-1").lbyl({
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce iaculis a quam a pellentesque. Proin maximus, nulla non molestie scelerisque, ligula purus lacinia massa, et dapibus quam mi at mi.",
        finished: function() {
            $(".example-2").lbyl({
                content: "Aliquip exquisitaque aut commodo. E an quis arbitror, pariatur fore in aliquip sempiternum, appellat quae mentitum e sunt voluptatibus admodum dolore senserit, eu ex imitarentur, mandaremus aliqua quibusdam ad ea ut duis incididunt ubi hic offendit nam incurreret. Te ad aliqua fore quis. Cernantur quem sed ullamco firmissimum, summis concursionibus possumus dolore possumus si eu tamen minim ab probant an noster an nescius e sint. Pariatur aute senserit vidisse, nescius dolore ullamco sed pariatur velit proident quibusdam, de quid laborum, probant enim anim ut quis qui ne do familiaritatem an doctrina summis hic litteris adipisicing ab ubi aliquip reprehenderit."
            });
        }
    });
});
 */
