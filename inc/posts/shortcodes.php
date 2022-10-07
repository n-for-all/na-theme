<?php

class Posts_Shortcode
{
    public function __construct()
    {
        $this->actions();
        $this->shortcodes();
    }

    public function actions()
    {
        add_filter('widget_text', 'do_shortcode');
    }

    public function shortcodes()
    {
        add_shortcode('posts', array($this, 'render'));
        add_shortcode('posts-carousel', array($this, 'renderCarousel'));
        add_shortcode('posts-slider', array($this, 'renderCarousel'));
    }

    public function render($atts)
    {
        $atts = shortcode_atts(array(
            'category' => '',
            'columns' => 4,
            'limit' => 4
        ), $atts, 'services-shortcode');
        $categories = (array) explode(',', $atts['category']);
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => $atts['limit'],
            'orderby' => 'menu_order',
            'post_status' => 'publish',
            'order' => 'ASC',
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'post',
                'posts_per_page' => $atts['limit'],
                'tax_query' => array(
                    array(
                        'taxonomy' => 'category',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC',
            );
        }
        $output = '';
        $columns = intval($atts['columns']) > 0 ? $atts['columns'] : 4;
        $query = new \WP_Query($args);
        $template = '<li class="post-list-item %s"><a data-id="%d" class="posts-image" style="%s" href="%s"><dt>%s</dt></a><div class="posts-inner"><div class="posts-header"><h3><a href="%4$s">%s</a></h3></div><div class="posts-content">%s</div></div></li>';
        if ($query->have_posts()) {
            $output = sprintf('<ul class="na-posts na-posts-columns-%s">', $columns);
            while ($query->have_posts()) {
                $query->the_post();
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $output .= sprintf($template, has_post_thumbnail() ? 'has-thumbnail' : '', get_the_ID(), implode(';', $style), get_the_permalink(), get_the_date('M<b>d</b>', '', ''), get_the_title(), get_the_excerpt());
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();

        return $output;
    }

    public function renderCarousel($atts)
    {
        global $slider;
        $atts = shortcode_atts(array(
            'category' => '',
            'height' => '400px',
            'columns' => 4,
            'limit' => -1,
            'autoplay' => 0,
            'vertical' => 0,
            'bullets' => 1,
            'pagination' => 1,
            'type' => 'carousel',
        ), $atts, 'services-shortcode');
        $categories = (array) explode(',', $atts['category']);
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => $atts['limit'],
            'orderby' => 'menu_order',
            'post_status' => 'publish',
            'order' => 'ASC',
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'post',
                'posts_per_page' => $atts['limit'],
                'tax_query' => array(
                    array(
                        'taxonomy' => 'category',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC',
            );
        }

        $columns = intval($atts['columns']) > 0 ? $atts['columns'] : 4;
        $query = new \WP_Query($args);
        $template = '<a class="posts-image %s" data-id="%d" style="%s" href="%s"><dt>%s</dt></a><div class="posts-inner"><div class="posts-header"><h3><a href="%4$s">%s</a></h3></div><div class="posts-content">%s</div></div>';
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $slides[] = array(
                    'content' => apply_filters('posts-shortcode-item', sprintf($template, has_post_thumbnail() ? 'has-thumbnail' : '', get_the_ID(), implode(';', $style), get_the_permalink(), get_the_date('M<b>d</b>', '', ''), get_the_title(), get_the_excerpt())),
                    'post' => get_post()
                );

            }
        }

        wp_reset_postdata();
        $settings = array(
            'autoplay' => $atts['autoplay'],
            'columns' => $columns,
            'vertical' => $atts['vertical'],
            'bullets' => $atts['bullets'],
            'type' => $atts['type'],
            'pagination' => $atts['pagination'],
            'class' => 'na-posts-slider',
            'height' => $atts['height'] ? $atts['height'] : '50vh'
        );
        return $slider->addSlider($slides, $settings);
    }
}
new Posts_Shortcode();
