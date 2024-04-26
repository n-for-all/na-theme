<?php

namespace NaTheme\Inc\Testimonials;

class Shortcode extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function __construct()
    {
        parent::__construct(array('testimonial'), 'Testimonial', 'normal', 'high');

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
        add_shortcode('testimonials', array($this, 'render'));
        add_shortcode('testimonials-carousel', array($this, 'renderCarousel'));
    }
    public function scripts()
    {
        wp_enqueue_style('testimonials-shortcode', get_template_directory_uri() . '/inc/testimonials/css/styles.css', array(), '1.0.0', 'screen');
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
            'add_new_item'       => __('Add New Testimonial', 'na-theme'),
            'new_item'           => __('New Testimonial', 'na-theme'),
            'edit_item'          => __('Edit Testimonial', 'na-theme'),
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
            'rewrite'            => array('slug' => 'testimonial'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
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
            'rewrite'               => array('slug' => 'testimonials'),
        );

        register_taxonomy('testimonials', 'testimonial', $args);
    }

    public function render($atts)
    {
        $atts = shortcode_atts(array(
            'limit' => 2,
            'columns' => 1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        ), $atts);

        $testimonials = get_posts(
            array(
                'post_type' => 'testimonial',
                'posts_per_page' => $atts['limit'],
                'orderby' => $atts['orderby'],
                'order' => $atts['order'],
                'suppress_filters' => false
            )
        );

        $part = [];
        $output = '';
        if (count($testimonials) > 0) {
            global $post;
            foreach ($testimonials as $post) :
                setup_postdata($post);
                $part[] =  $this->create_testimonial();

            endforeach;
            wp_reset_postdata();

            $output = sprintf('<div class="na-testimonials na-testimonials-columns-%s grid gap-3 grid-cols-1 lg:grid-cols-%1$s w-full">%s</div>', $atts['columns'], implode('', $part));
        }
        return $output;
    }

    public function create_testimonial()
    {
        $outer = '';
        $image = "";
        if (has_post_thumbnail()) {
            $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
            $image = \sprintf('<div alt="%s" style="%s;height:80px" class="w-full bg-no-repeat bg-contain"></div>', get_the_title(), "background-image:url($thumbnail[0])");
        }

        $meta = (array)$this->get_meta(get_the_ID(), 'testimonials');
        $name = $meta['name'] ?? '';

        $outer = sprintf('
                <div class="overflow-hidden transition border border-gray-100 rounded testimonial">
                    <div class="flex flex-col h-full p-5 bg-white lg:p-10">
                        <svg class="w-14 h-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.21 37.17"><defs><style>.cls-1{opacity:.64;}.cls-2{fill:#bcc4dd;stroke-width:0px;}</style></defs><g id="vEl84m" class="cls-1"><path class="cls-2" d="m52.21,1.45c-.19.37-.49.64-.84.85-1.21.7-2.43,1.38-3.62,2.12-1.8,1.12-3.51,2.37-4.98,3.9-.88.92-1.67,1.9-2.27,3.03-.1.19-.18.38-.25.59-.09.3-.03.38.28.42.6.08,1.21.12,1.8.25,7.68,1.69,12.04,10.38,8.64,17.49-1.79,3.74-4.81,6.15-8.95,6.87-5.34.93-9.99-1.37-12.7-5.55-1.1-1.69-1.67-3.59-1.84-5.59-.3-3.56.33-6.99,1.53-10.32,2.1-5.83,6.04-10,11.6-12.68,2.96-1.42,6.08-2.29,9.32-2.75.25-.04.5-.06.74-.08.14,0,.27,0,.41,0,.59.08,1,.39,1.16.99v.46Z"/><path class="cls-2" d="m23.92,0c.61.19.95.63.95,1.21,0,.4-.17.71-.51.91-.52.31-1.05.61-1.58.91-1.73.96-3.44,1.97-4.99,3.21-1.59,1.28-3.08,2.67-4.2,4.41-.27.41-.47.86-.71,1.3-.12.21-.04.32.19.36.57.08,1.15.14,1.72.25,3.04.59,5.48,2.18,7.4,4.58,1.35,1.68,2.28,3.57,2.51,5.74.2,1.99.24,3.98-.48,5.9-1.04,2.73-2.68,5-5.2,6.55-2.45,1.51-5.12,2.07-7.97,1.75-3.89-.43-6.86-2.37-9.01-5.59-3.12-4.67-2.15-10.98-.35-15.96,1.72-4.75,4.67-8.51,8.94-11.22C14.14,2.07,18.02.82,22.11.16c.37-.06.74-.11,1.11-.16.23,0,.46,0,.7,0Z"/></g></svg>
                        <div class="mt-2 mb-2">%s</div>
                        <div class="flex items-center mt-auto">
                            %s
                            <div class="ml-2">%s</div>
                        </div>
                    </div>
                </div>
                ', get_the_content(), $image, $name, $image);
        return $outer;
    }
    public function renderCarousel($atts)
    {
        global $slider;
        $atts = shortcode_atts(array(
            'category' => '',
            'height' => 'auto',
            'type' => '',
            'vertical' => 1,
            'autoplay' => 0,
            'columns' => 1
        ), $atts, 'testimonials-shortcode');
        $categories = (array) explode(",", $atts['category']);
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
        $query = new \WP_Query($args);
        $slides = array();
        global $post;
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'testimonials');
                $slide_image = '';
                $image = null;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $slide_image = sprintf('<div class="testimonials-image" style="%s"></div>', "background-image:url($image[0])");
                }
                $slides[] = array(
                    'content' => apply_filters('testimonial-shortcode-item', sprintf('%s<div class="testimonials-inner"><div class="testimonials-header"><h3>%s</h3><span class="testimonials-name">%s</span></div><div class="testimonials-content">%s</div></div>', $slide_image, get_the_title(), $meta['name'], get_the_content()), $post, $meta, get_the_content(), $image),
                    'post' => $post
                );
            }
        }
        wp_reset_postdata();
        $settings = array(
            'autoplay' => $atts['autoplay'],
            'columns' => $atts['columns'],
            'vertical' => $atts['vertical'],
            'type' => $atts['type'],
            'class' => 'testimonials-slider',
            'height' => $atts['height'] ? $atts['height'] : '50vh'
        );
        return $slider->addSlider($slides, $settings);
    }
    public function show_metabox($post)
    {
?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Name</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'name', 'testimonials'); ?>
                        <p class="description">The person name.</p>
                    </td>
                </tr>
            </tbody>
        </table>
<?php

    }
}
?>