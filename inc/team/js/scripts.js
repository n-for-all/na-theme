jQuery(document).ready(function() {
    var last = null;

    function showTeamMember(id) {
        jQuery("body").addClass('na-team-active');
        jQuery.ajax({
            url: TeamSettings.url,
            type: 'post',
            dataType: "json",
            data: {
                action: 'team_member',
                id: id
            },
            success: function(result) {
                if (result && result.status == "success") {
                    var post_template = wp.template('team-member');
                    jQuery("body").append("<div id='na-team-member-template'><a class='close-team' href='#'></a>" + post_template(result.post) + "</div>");
                    jQuery('#na-team-member-template').fadeIn();
                }else{
                    jQuery("body").removeClass('na-team-active');
                }
            }
        }).fail(function() {
            jQuery('.close-team').trigger('click');
            jQuery("body").removeClass('na-team-active');
        });
        return false;
    }
    jQuery(document).on('keydown', function(event) {
        if (last && event.keyCode == 27) {
            event.preventDefault();
            jQuery('.close-team').trigger('click');
        }
    });
    jQuery(window).on('hashchange', function(e) {
        var hash = window.location.hash.replace(/^#!/, '');
        if (hash) {
            var path = hash.split('/');
            if (path[0] == 'team') {
                showTeamMember(path[1]);
            }
        }
    });

    jQuery(document).on("click", ".close-team", function() {
        event.preventDefault();
        jQuery('#na-team-member-template').fadeOut(function() {
            jQuery('#na-team-member-template').remove();
            jQuery("body").removeClass("na-team-active");
        });
        window.location.hash = '#!';
    });
});
