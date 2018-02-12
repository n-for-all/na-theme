<?php
class Team_Shortcode extends NA_METABOXES
{
    public function __construct()
    {
        parent::__construct(array('team-member'), 'Team Member', 'normal', 'high') ;

        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('wp_footer', array($this, 'inline_scripts'));

        add_action('wp_ajax_team_member', array($this, 'get_team_member'));
        add_action('wp_ajax_nopriv_team_member', array($this, 'get_team_member'));
    }
    public function shortcodes()
    {
        add_shortcode('team', array(&$this, 'shortcode'));
    }
    public function scripts()
    {
        wp_enqueue_style('team-shortcode', get_template_directory_uri() . '/inc/team/css/team.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
    }
    public function inline_scripts()
    {
        ?>
<script id="tmpl-team-member" type="text/template">
<?php include('template/popup.php'); ?>
</script>
<script type="text/javascript">
jQuery(document).on("click", ".team-button", function(){
  jQuery("body").addClass("na-team-overlay");
  event.preventDefault();
	jQuery.ajax({
		url: "<?php echo admin_url('admin-ajax.php'); ?>",
		type: 'post',
    //dataType: "jsonp",
		data: {
			action: 'team_member',
      id: jQuery(this).data("id")
		},
		success: function( result ) {
      result = eval('(' + result.trim() +')');
			if(result && result.status == "success"){
        var post_template = wp.template( 'team-member' );
        jQuery("body").append("<div id='na-team-member-template'><a class='close-team' href='#'></a>"+post_template(result.post)+"</div>");
        jQuery('#na-team-member-template').fadeIn();
      }
		},
    error: function(){
      jQuery("body").removeClass("na-team-overlay");
    }
	})
  return false;
});
jQuery(document).on("click", ".close-team", function(){
  event.preventDefault();
  jQuery('#na-team-member-template').fadeOut(function(){
    jQuery(this).remove();
    jQuery("body").removeClass("na-team-overlay");
  });

});

</script><?php
    }
    public function get_team_member()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if ($post->post_type == 'team-member') {
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                    'image' => $image ? $image[0] : '',
                    'meta'  => $this->get_meta(get_the_ID(), 'team')
                );
                $output = array('status' => 'success', 'post' => $pst);
            }
        }
        echo json_encode($output);
        die();
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Team', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Team', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Team', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Team', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Team Member', 'na-theme'),
            'new_item'           => __('New Team Member', 'na-theme'),
            'edit_item'          => __('Edit Team Member', 'na-theme'),
            'view_item'          => __('View Team Members', 'na-theme'),
            'all_items'          => __('All Team Members', 'na-theme'),
            'search_items'       => __('Search Teams', 'na-theme'),
            'parent_item_colon'  => __('Parent Teams:', 'na-theme'),
            'not_found'          => __('No Team Members found.', 'na-theme'),
            'not_found_in_trash' => __('No Team Members found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'team-member' ),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('team-member', $args);

        $labels = array(
            'name'                       => _x('Teams', 'na-theme'),
            'singular_name'              => _x('Teams', 'na-theme'),
            'search_items'               => __('Search Teams'),
            'popular_items'              => __('Popular Teams'),
            'all_items'                  => __('All Teams'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Team'),
            'update_item'                => __('Update Team'),
            'add_new_item'               => __('Add New Team'),
            'new_item_name'              => __('New Team'),
            'separate_items_with_commas' => __('Separate team with commas'),
            'add_or_remove_items'        => __('Add or remove team'),
            'choose_from_most_used'      => __('Choose from the most used team'),
            'not_found'                  => __('No team found.'),
            'menu_name'                  => __('Teams'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array( 'slug' => 'team' ),
        );

        register_taxonomy('team', 'team-member', $args);
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'category' => '',
            'columns' => '3'
        ), $atts, 'team-shortcode');
        $categories = (array)explode(",", $atts['category']);
        $args = array(
            'post_type' => 'team-member',
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'team-member',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'team',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
             );
        }
        $output = "";
        $query = new WP_Query($args);
        if ($query->have_posts()) {
            $output = '<ul class="na-team na-team-columns-'.$atts['columns'].'">';
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'team');
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $output .= '<li>
                <div class="team-inner">
                    <a data-id="'.get_the_ID().'" class="team-image team-button" style="'.implode(";", $style).'" href="'.get_the_permalink().'">
                        <span class="team-header">
                            <span class="team-title">'.get_the_title().'</span>
                            <span class="team-position">'.$meta['position'].'</span>
                        </span>
                    </a>
                    <div class="team-content">'.get_the_excerpt().'</div>
                </div>
                </li>';
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();
        return $output;
    }
    public function show_metabox($post)
    {
        ?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Position</label></th>
					<td><?php $this->_metabox_text($post->ID, 'position', 'team'); ?>
					<p class="description">The team member position.</p></td>
				</tr>
			</tbody>
		</table>
		<?php
    }
}
new Team_Shortcode();
?>
