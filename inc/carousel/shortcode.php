<?php
class Carousels_Shortcode extends NA_METABOXES
{
    public function __construct()
    {
        // parent::__construct(array('carousel'), 'Item', 'normal', 'high');

        $this->actions();
        $this->shortcodes();
    }

    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        // add_action('wp_footer', array($this, 'inline_scripts'));

        add_action('wp_ajax_carousel', array($this, 'get_carousel'));
        add_action('wp_ajax_nopriv_carousel', array($this, 'get_carousel'));
    }

    public function shortcodes()
    {
        add_shortcode('carousel', array($this, 'shortcode'));
    }

    public function scripts()
    {
        wp_enqueue_style('carousel-shortcode', get_template_directory_uri().'/inc/carousel/css/carousel.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
        wp_enqueue_script('carousel-shortcode-js', get_template_directory_uri().'/inc/carousel/js/carousel.js', array('jquery'), '1.0.0');
    }

    public function init()
    {
        $labels = array(
            'name' => _x('Carousel', 'post type general name', 'na-theme'),
            'singular_name' => _x('Carousel', 'post type singular name', 'na-theme'),
            'menu_name' => _x('Carousel', 'admin menu', 'na-theme'),
            'name_admin_bar' => _x('Carousel', 'add new on admin bar', 'na-theme'),
            'add_new' => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item' => __('Add New Carousels', 'na-theme'),
            'new_item' => __('New Item', 'na-theme'),
            'edit_item' => __('Edit Item', 'na-theme'),
            'view_item' => __('View Item', 'na-theme'),
            'all_items' => __('All Items', 'na-theme'),
            'search_items' => __('Search Carousels', 'na-theme'),
            'parent_item_colon' => __('Parent Carousels:', 'na-theme'),
            'not_found' => __('No Carousels found.', 'na-theme'),
            'not_found_in_trash' => __('No Carousels found in Trash.', 'na-theme'),
        );

        $args = array(
            'labels' => $labels,
            'description' => __('Description.', 'na-theme'),
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'query_var' => true,
            'rewrite' => array('slug' => 'carousel'),
            'capability_type' => 'post',
            'has_archive' => true,
            'hierarchical' => true,
            'menu_position' => null,
            'supports' => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'),
        );

        register_post_type('carousel', $args);

        $labels = array(
            'name' => _x('Carousel', 'na-theme'),
            'singular_name' => _x('Carousel', 'na-theme'),
            'search_items' => __('Search Carousels'),
            'popular_items' => __('Popular Carousels'),
            'all_items' => __('All Items'),
            'parent_item' => null,
            'parent_item_colon' => null,
            'edit_item' => __('Edit Item'),
            'update_item' => __('Update Item'),
            'add_new_item' => __('Add New Item'),
            'new_item_name' => __('New Item'),
            'separate_items_with_commas' => __('Separate carousels with commas'),
            'add_or_remove_items' => __('Add or remove carousels'),
            'choose_from_most_used' => __('Choose from the most used carousels'),
            'not_found' => __('No carousels found.'),
            'menu_name' => __('Carousels'),
        );

        $args = array(
            'hierarchical' => true,
            'labels' => $labels,
            'show_ui' => true,
            'public' => false,
            'show_admin_column' => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var' => true,
            'rewrite' => array('slug' => 'carousel'),
        );

        register_taxonomy('carousels', 'carousel', $args);
    }

    public function shortcode($atts)
    {
        global $slider;
        $atts = shortcode_atts(array(
            'bullets' => false,
            'category' => '',
            'pagination' => '0',
            'height' => 'auto',
            'type' => '',
            'min-height' => false,
            'min-width' => 200,
            'vertical' => 0,
            'autoplay' => 0,
            'columns' => 4,
        ), $atts, 'carousels-shortcode');
        $categories = (array) explode(',', $atts['category']);
        $args = array(
            'post_type' => 'carousel',
            'orderby' => 'menu_order',
            'order' => 'ASC',
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'carousel',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'carousels',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC',
             );
        }
        $output = '';
        $query = new WP_Query($args);
        $id = time() + rand(1, 100);
        $slides = array();
        global $post;
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'carousels');
                $style = array();
                $inner = '';
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    if($image && isset($image[0])){
                        $inner = sprintf('<div class="carousels-inner" style="%s"><img src="%s" /></div>', $atts['min-height'] ? 'min-height:'.$atts['min-height']: '', $image[0]);
                    }
                }
                if(trim($post->post_content) != ''){
                    $inner .= '<div class="carousels-content">'.get_the_content().'</div>';
                }
                $slides[] = array('content' => $inner, 'post' => $post);
            }
        }
        wp_reset_postdata();
        $settings = array(
            'autoplay' => $atts['autoplay'],
            'bullets' => $atts['bullets'],
            'pagination' => $atts['pagination'],
            'columns' => $atts['columns'],
            'minWidth' => $atts['min-width'],
            'vertical' => $atts['vertical'],
            'type' => 'carousel',
            'height' => $atts['height']
        );
        return $slider->addSlider($slides, $settings);
    }

    public function show_metabox($post)
    {
        return;
        ?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Position</label></th>
					<td><?php $this->_metabox_text($post->ID, 'position', 'carousels'); ?>
					<p class="description">The person position.</p></td>
				</tr>
			</tbody>
		</table>
		<?php
    }
}
new Carousels_Shortcode();
?>
