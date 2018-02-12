<?php
class Testimonials_Shortcode extends NA_METABOXES
{
    public function __construct()
    {
        parent::__construct(array('testimonial'), 'Testimonials Member', 'normal', 'high') ;

        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        // add_action('wp_footer', array($this, 'inline_scripts'));

        add_action('wp_ajax_testimonial', array($this, 'get_testimonial'));
        add_action('wp_ajax_nopriv_testimonial', array($this, 'get_testimonial'));
    }
    public function shortcodes()
    {
        add_shortcode('testimonials', array($this, 'shortcode'));
    }
    public function scripts()
    {
        wp_enqueue_style('testimonials-shortcode', get_template_directory_uri() . '/inc/testimonials/css/testimonials.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
        wp_enqueue_script('testimonials-shortcode-js', get_template_directory_uri() . '/inc/testimonials/js/testimonials.js', array('jquery'), '1.0.0');
    }

    public function get_testimonial()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if ($post->post_type == 'testimonial') {
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
            'title' => get_the_title(),
            'content' => get_the_content(),
            'image' => $image ? $image[0] : '',
            'meta'  => $this->get_meta(get_the_ID(), 'testimonials')
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
            'name'               => _x('Testimonials', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Testimonials', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Testimonials', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Testimonials', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Testimonials Member', 'na-theme'),
            'new_item'           => __('New Testimonials Member', 'na-theme'),
            'edit_item'          => __('Edit Testimonials Member', 'na-theme'),
            'view_item'          => __('View Testimonials', 'na-theme'),
            'all_items'          => __('All Testimonials', 'na-theme'),
            'search_items'       => __('Search Testimonials', 'na-theme'),
            'parent_item_colon'  => __('Parent Testimonials:', 'na-theme'),
            'not_found'          => __('No Testimonials found.', 'na-theme'),
            'not_found_in_trash' => __('No Testimonials found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'testimonial' ),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('testimonial', $args);

        $labels = array(
            'name'                       => _x('Testimonials', 'na-theme'),
            'singular_name'              => _x('Testimonials', 'na-theme'),
            'search_items'               => __('Search Testimonials'),
            'popular_items'              => __('Popular Testimonials'),
            'all_items'                  => __('All Testimonials'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Testimonials'),
            'update_item'                => __('Update Testimonials'),
            'add_new_item'               => __('Add New Testimonials'),
            'new_item_name'              => __('New Testimonials'),
            'separate_items_with_commas' => __('Separate testimonials with commas'),
            'add_or_remove_items'        => __('Add or remove testimonials'),
            'choose_from_most_used'      => __('Choose from the most used testimonials'),
            'not_found'                  => __('No testimonials found.'),
            'menu_name'                  => __('Testimonials'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array( 'slug' => 'testimonials' ),
        );

        register_taxonomy('testimonials', 'testimonial', $args);
    }
    public function shortcode($atts)
    {
        global $slider;
        $atts = shortcode_atts(array(
            'category' => '',
            'height' => '100%',
            'type' => '',
            'vertical' => 1,
            'autoplay' => 0,
            'columns' => 1
        ), $atts, 'testimonials-shortcode');
        $categories = (array)explode(",", $atts['category']);
        $args = array(
            'post_type' => 'testimonial',
            'orderby' => 'menu_order',
          'order' => 'ASC'
         );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'testimonial',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'testimonials',
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
        $id = time() + rand(1,100);
        $slides = array();
        global $post;
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'testimonials');
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $slides[] = array('content' => '<div class="testimonials-header"><h3>'.get_the_title().'</h3><span class="testimonials-position">'.$meta['position'].'</span></div><div class="testimonials-content">'.get_the_content().'</div>', 'post' => $post);
            }
        }
        wp_reset_postdata();
        $settings = array(
            'autoplay' => $atts['autoplay'],
            'columns' => $atts['columns'],
            'vertical' => $atts['vertical'],
            'type' => $atts['type'],
            'height' => $atts['height']
        );
        return $slider->addSlider($slides, $settings);
    }
    public function show_metabox($post)
    {
        ?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Position</label></th>
					<td><?php $this->_metabox_text($post->ID, 'position', 'testimonials'); ?>
					<p class="description">The person position.</p></td>
				</tr>
			</tbody>
		</table>
		<?php

    }
}
new Testimonials_Shortcode();
?>
