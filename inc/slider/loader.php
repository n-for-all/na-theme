<?php

namespace NaTheme\Inc\Slider;

class Slider
{
    private $metabox;
    private $image;
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_action('wp_enqueue_scripts', array(&$this, 'scripts'));
        add_shortcode('slider', array(&$this, 'slider'));

        add_filter('manage_slide_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_slide_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        $this->metabox = new Metabox(array('slide'), 'Settings');;
        $this->image = new PostImage("slides-image", "Settings", "image", "slider", 2);
        $this->image->set_meta_box($this->metabox);
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Slides', 'post type general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'      => _x('Slide', 'post type singular name', NA_THEME_TEXT_DOMAIN),
            'menu_name'          => _x('Slider', 'admin menu', NA_THEME_TEXT_DOMAIN),
            'name_admin_bar'     => _x('Slide', 'add new on admin bar', NA_THEME_TEXT_DOMAIN),
            'add_new'            => _x('Add New', 'book', NA_THEME_TEXT_DOMAIN),
            'add_new_item'       => __('Add New Slide', NA_THEME_TEXT_DOMAIN),
            'new_item'           => __('New Slide', NA_THEME_TEXT_DOMAIN),
            'edit_item'          => __('Edit Slide', NA_THEME_TEXT_DOMAIN),
            'view_item'          => __('View Slide', NA_THEME_TEXT_DOMAIN),
            'all_items'          => __('All Slides', NA_THEME_TEXT_DOMAIN),
            'search_items'       => __('Search Slides', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon'  => __('Parent Slides:', NA_THEME_TEXT_DOMAIN),
            'not_found'          => __('No slides found.', NA_THEME_TEXT_DOMAIN),
            'not_found_in_trash' => __('No slides found in Trash.', NA_THEME_TEXT_DOMAIN)
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'slide'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'page-attributes')
        );

        register_post_type('slide', $args);

        $labels = array(
            'name'              => _x('Sliders', 'taxonomy general name', 'textdomain'),
            'singular_name'     => _x('Slider', 'taxonomy singular name', 'textdomain'),
            'search_items'      => __('Search Sliders', 'textdomain'),
            'all_items'         => __('All Sliders', 'textdomain'),
            'parent_item'       => __('Parent Slider', 'textdomain'),
            'parent_item_colon' => __('Parent Slider:', 'textdomain'),
            'edit_item'         => __('Edit Slider', 'textdomain'),
            'update_item'       => __('Update Slider', 'textdomain'),
            'add_new_item'      => __('Add New Slider', 'textdomain'),
            'new_item_name'     => __('New Slider Name', 'textdomain'),
            'menu_name'         => __('Sliders', 'textdomain'),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => false,
            'rewrite'           => array('slug' => 'slider'),
        );
        register_taxonomy(
            'slider',
            'slide',
            $args
        );
    }
    public function add_img_column($columns)
    {
        $columns['img'] = 'Image';
        return $columns;
    }
    public function manage_img_column($column_name, $post_id)
    {
        if ($column_name == 'img') {
            echo get_the_post_thumbnail($post_id, 'thumbnail');
        }
        return $column_name;
    }
    public function scripts()
    {
        wp_enqueue_script('na-slider', get_template_directory_uri() . '/assets/js/slider.js', array(), '1.0.1', true);
        wp_enqueue_style('na-slider', get_template_directory_uri() . '/inc/slider/css/slider.css', array(), '1.0.1');
    }
    public function slider($atts)
    {
        $atts = shortcode_atts(array(
            'id' => 0,
            'category' => 0,
            'class' => '',
            'container' => 'container',
            'height' => '100%',
            'type' => '',
            'max' => false,
            'vertical' => 0,
            'autoplay' => 0,
            'thumbnails' => 0,
            'bullets' => 0,
            'min-width' => 0,
            'columns' => 1
        ), $atts);
        if ($atts['id'] != 0) {
            $atts['category'] = $atts['id'];
        }
        $slides = get_posts(
            array(
                'post_type' => 'slide',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'suppress_filters' => false,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'slider',
                        'field' => is_numeric($atts['category']) ? 'term_id' : 'slug',
                        'terms' => $atts['category']
                    )
                )
            )
        );
        $settings = array();
        $_slides = array();
        if (count($slides) > 0) {
            $settings = array(
                'class' => $atts['class'],
                'autoplay' => $atts['autoplay'],
                'container' => $atts['container'],
                'bullets' => $atts['bullets'],
                'thumbnails' => $atts['thumbnails'],
                'columns' => $atts['columns'],
                'vertical' => $atts['vertical'],
                'minWidth' => $atts['min-width'] > 0 ? $atts['min-width'] : 200,
                'type' => $atts['type'],
                'height' => $atts['height']
            );
            if ($atts['type'] == 'mosaic') {
                for ($i = 0; $i < count($slides); $i = $i + 2) :
                    $slide1 = $slides[$i];
                    $slide2 = $slides[$i + 1];
                    $image1 = '';
                    $image2 = '';

                    $video_id = $this->metabox->get_youtube_video_id($slide1->ID);
                    if (has_post_thumbnail($slide1->ID)) {
                        $image1 = wp_get_attachment_image_src(get_post_thumbnail_id($slide1->ID), "full")[0];
                    }
                    if (has_post_thumbnail($slide2->ID)) {
                        $image2 = wp_get_attachment_image_src(get_post_thumbnail_id($slide2->ID), "full")[0];
                    }
                    $_slides[] = array('content' => '<div class="na-slide-inner na-slider-inner1" style="background:url(' . $image1 . ') no-repeat top center / cover;width:100%">
    						<div class="na-slide-text">
    							' . apply_filters('the_content', $slide1->post_content) . '
    						</div>
    					</div>
    					<div class="na-slide-inner na-slider-inner2" style="background:url(' . $image2 . ') no-repeat top center / cover;width:100%">
    						<div class="na-slide-text">
    						     ' . apply_filters('the_content', $slide2->post_content) . '
    						</div>
    					</div>', 'post' => [$slide1, $slide2], 'video' => $video_id);
                endfor;
            } else {
                foreach ($slides as $slide) :
                    $video_id = $this->metabox->get_youtube_video_id($slide->ID);
                    $image = '';
                    if (has_post_thumbnail($slide->ID)) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id($slide->ID), "full")[0];
                    }

                    $container  = '';
                    $content = sprintf('<div class="na-slide-text">%s</div>', apply_filters('the_content', $slide->post_content));
                    if ($settings['container'] == 'container') {
                        if ($video_id) {
                            $container  = sprintf('<div class="container"><div class="row"><div class="col-md-6">%s</div><div class="col-md-6"><a href="#" class="play-btn-big"></a></div></div></div>', $content);
                        } else {
                            $container  = sprintf('<div class="container"><div class="row"><div class="col-md-12">%s</div></div></div>', $content);
                        }
                    } else {
                        $container = $content . '<a href="#" class="play-btn-big"></a>';
                    }

                    $_slides[] = array('content' => sprintf('<div style="background-image:url(%s)" class="na-slide-inner">
                        %s
    				</div>', $image, $container), 'post' => $slide, 'video' => $video_id);
                    if ($atts['max'] && $atts['max'] < count($_slides)) {
                        break;
                    }
                endforeach;
            }
        }
        return $this->addSlider($_slides, $settings);
    }
    public function addSlider($slides, $settings)
    {
        if (count($slides) > 0) {
            $id = uniqid('slider_');
            ob_start();
            if (isset($settings['thumbnails']) && $settings['thumbnails']) {
                $settings['sync'] = $id . '_thumbnails';
            }
            include 'template/slider.tpl.php';

            return ob_get_clean();
        }
    }
}
class Metabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {   
        ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Youtube Video ID</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'youtube', 'slide'); ?>
                        <p class="description">Youtube video ID.</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php
    }
    public function get_youtube_video_id($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'youtube', 'slide', 'full');
        return $p;
    }
}

class PostImage extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $meta_box;
    public function set_meta_box($meta_box)
    {
        $this->meta_box = $meta_box;
    }
    public function show_content($column, $post_id)
    {
        $images = $this->meta_box->_metabox_image_value($post_id, 'image', 'slide');
        foreach ($images as $image) {
            ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
            <?php
        }
    }
}


global $slider;
$slider = new Slider();


?>