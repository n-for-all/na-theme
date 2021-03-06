<?php
class Na_Slider
{
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_action('wp_enqueue_scripts', array(&$this, 'scripts'));
        add_shortcode('slider', array(&$this, 'slider'));

        add_filter('manage_slide_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_slide_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);
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
            'rewrite'            => array( 'slug' => 'slide' ),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array( 'title', 'editor', 'thumbnail', 'page-attributes')
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
            'rewrite'           => array( 'slug' => 'slider' ),
        );
        register_taxonomy(
            'slider',
            'slide',
            $args
        );
    }
    public function add_img_column($columns) {
        $columns['img'] = 'Image';
        return $columns;
    }
    public function manage_img_column($column_name, $post_id) {
        if( $column_name == 'img' ) {
            echo get_the_post_thumbnail($post_id, 'thumbnail');
        }
        return $column_name;
    }
    public function scripts()
    {
        wp_enqueue_script('na-slider-swipe', get_template_directory_uri() . '/inc/slider/js/hammer.min.js', array( 'jquery' ), '1.0.0', true);
        wp_enqueue_script('na-slider', get_template_directory_uri() . '/inc/slider/js/slider.js', array( 'jquery' ), '1.0.0', true);
        wp_enqueue_style('na-slider', get_template_directory_uri() . '/inc/slider/css/slider.css', array(), '1.0');
    }
    public function slider($atts)
    {
        $atts = shortcode_atts(array(
            'id' => 0,
            'category' => 0,
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
        if($atts['id'] != 0){
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
                    'field' => is_numeric($atts['category']) ? 'term_id': 'slug',
                    'terms' => $atts['category']
                )
            ))
        );
        $settings = array();
        $_slides = array();
        if (count($slides) > 0) {
            $settings = array(
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
                for ($i = 0; $i < count($slides);  $i = $i + 2):
                    $slide1 = $slides[$i];
                    $slide2 = $slides[$i+1];
                    $image1 = '';
                    $image2 = '';
                    if (has_post_thumbnail($slide1->ID)) {
                        $image1 = wp_get_attachment_image_src(get_post_thumbnail_id($slide1->ID), "full")[0];
                    }
                    if (has_post_thumbnail($slide2->ID)) {
                        $image2 = wp_get_attachment_image_src(get_post_thumbnail_id($slide2->ID), "full")[0];
                    }
    			    $_slides[] = array('content' => '<div class="na-slide-inner na-slider-inner1" style="background:url('.$image1.') no-repeat top center / cover;width:100%">
    						<div class="na-slide-text">
    							'.apply_filters('the_content', $slide1->post_content).'
    						</div>
    					</div>
    					<div class="na-slide-inner na-slider-inner2" style="background:url('.$image2.') no-repeat top center / cover;width:100%">
    						<div class="na-slide-text">
    						     '.apply_filters('the_content', $slide2->post_content).'
    						</div>
    					</div>', 'post' => [$slide1, $slide2]);
				endfor;
            } else {
                foreach ($slides as $slide):
                    $image = '';
                    if (has_post_thumbnail($slide->ID)) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id($slide->ID), "full")[0];
                    }
    				$_slides[] = array('content' => '<div style="background-image:url('.$image.')" class="na-slide-inner">
                        <div class="'.$settings['container'].'">
        					<div class="na-slide-text">
        						'.apply_filters('the_content', $slide->post_content).'
        					</div>
    					</div>
    				</div>', 'post' => $slide);
                    if($atts['max'] && $atts['max'] < count($_slides)){
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
            if($settings['type'] == 'circular'){
                $settings['autoplay'] = false;
            }
            if (isset($settings['thumbnails']) && $settings['thumbnails']){
                $settings['sync'] = $id.'_thumbnails';
            }
            ?>
		<script>
			if(typeof(slider_settings) == 'undefined'){
				var slider_settings = [];
			}
			slider_settings['<?php echo $id; ?>'] = <?php echo json_encode((array)$settings); ?>;
			slider_settings['<?php echo $id; ?>_thumbnails'] = <?php echo json_encode(array('columns' => 6, 'minWidth' => 50, 'height' => 'w15%')); ?>;
		</script>
		<div id="<?php echo $id; ?>" class="na-slider-wrapper na-slider-<?php echo $settings['vertical'] != 0 ? 'vertical': 'horizontal'; ?> na-<?php echo $settings['type'] != '' ? $settings['type']: 'normal'; ?> <?php echo $settings['class'] ?? ''; ?>" data-slider="<?php echo $id; ?>">
            <?php if($settings['type'] == 'circular'): ?>
                <div id="circular-nav">
                    <div class="svg-wrap">
                        <svg width="500px" height="500px" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g class="circular-wrap" style="transform-origin: 250px 250px; transition: transform ease 1s">
                                    <circle id="main-circle" stroke="#34a0cd" stroke-width="2" cx="250" cy="250" r="200"></circle>
                                    <circle class="point-circle" fill="#723a83" cx="250" cy="50" r="16"></circle>
                                </g>
                            </g>
                        </svg>
                        <ul class="na-slides-title">
                            <?php
                            foreach ($slides as $slide):
                                if (has_post_thumbnail($slide['post']->ID)) {
                                    $image = wp_get_attachment_image_src(get_post_thumbnail_id($slide['post']->ID), "full");
                                }
                                 ?>
        						<li>
        						     <span><?php echo $slide['post']->post_title; ?></span>
        						</li>
        					<?php endforeach;
                             ?>
                         </ul>
                    </div>
                </div>
            <?php endif; ?>
        	<div style="height:<?php echo $settings['height']; ?>" class="na-slider">
				<ul class="na-slides <?php echo $settings['class'] ?? ''; ?>">
					<?php
                    foreach ($slides as $slide):
                         ?>
						<li class="na-slide na-slide-<?php echo $slide['post']->ID; ?>">
						     <?php echo $slide['content']; ?>
						</li>
					<?php endforeach;
                     ?>
				</ul>
			</div>
			<?php if (count($slides) > 1) { ?>
				<a href="#" class="na-slider-actions prev"><span>&nbsp;</span></a>
				<a href="#" class="na-slider-actions next"><span>&nbsp;</span></a>
			<?php
            }
            $total = count($slides)/$settings['columns'];
            ?>
			<?php if (isset($settings['bullets']) && $settings['bullets']  && count($slides) > 1) { ?>
				<ul class="na-slider-bullets">
                    <?php for ($index = 0; $index < $total; $index ++):?>
                        <li><a data-index="<?php echo $index; ?>" class="na-slider-bullet-actions <?php echo $index == 0 ? 'active': ''; ?>" href="#"><span class="bullet-title"><?php echo $slides[$index]['post']->post_title; ?></span></a></li>
                    <?php endfor; ?>
                </ul>
			<?php
            } ?>

		</div>
        <?php if (isset($settings['thumbnails']) && $settings['thumbnails']  && count($slides) > 1) { ?>
            <div class="na-slider-thumbnails">
                <div id="<?php echo $id; ?>_thumbnails" class="na-slider-wrapper na-slider-<?php echo $settings['vertical'] != 0 ? 'vertical': 'horizontal'; ?> na-<?php echo $settings['type'] != '' ? $settings['type']: 'normal'; ?>" data-slider="<?php echo $id; ?>_thumbnails">
                    <div style="height:50px" class="na-slider">
                        <ul class="na-slides <?php echo $settings['class']; ?>">
                            <?php
                            foreach ($slides as $slide):
                                 ?>
                                <li class="na-slide na-slide-<?php echo $slide['post']->ID; ?>">
                                     <?php echo $slide['content']; ?>
                                </li>
                            <?php endforeach;
                             ?>
                        </ul>
                    </div>
                </div>
            </div>
        <?php
        } ?>
		<?php
            return ob_get_clean();
        }

    }
}
class SLIDER_METABOXES extends NA_METABOXES
{
    public function show_metabox($post)
    {
        ?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Choose images</label></th>
					<td><?php $this->_metabox_image($post->ID, 'image', 'slide'); ?>
					<p class="description">Choose your slider images, those images will appear in the slider shortcode of your website.</p></td>
				</tr>
			</tbody>
		</table>
		<?php

    }
    // public function get_slides($post_id)
    // {
    //     return ['post' => get_post($post_id), 'image' => $this->_metabox_image_value($post_id, 'image', 'slide', 'full')];
    // }
}
global $SLIDER_METABOXES;
$SLIDER_METABOXES = new SLIDER_METABOXES(array('slide'), 'Slides');

class NA_POST_IMAGE extends NA_POST_COLUMN
{
    public function show_content($column, $post_id)
    {
        global $SLIDER_METABOXES;
        $images = $SLIDER_METABOXES->_metabox_image_value($post_id, 'image', 'slide');
        //print_r();
        foreach ($images as $image) {
            ?>
			<img src="<?php echo $image[0]; ?>" style="height:50px" />
			<?php

        }
    }
}
global $slider;
$slider = new Na_Slider();
$NA_POST_IMAGE = new NA_POST_IMAGE("slides-image", "Slides", "image", "slider", 2);

?>
