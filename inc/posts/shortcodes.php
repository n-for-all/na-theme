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
        add_shortcode('posts', array($this, 'shortcode'));
    }

    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'category' => '',
            'per_page' => -1,
        ), $atts, 'services-shortcode');
        $categories = (array) explode(',', $atts['category']);
        $args = array(
            'post_type' => 'post',
            'posts_per_page' => $atts['per_page'],
            'orderby' => 'menu_order',
            'post_status' => 'publish',
            'order' => 'ASC',
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'post',
                'posts_per_page' => $atts['per_page'],
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
        $query = new WP_Query($args);
        $template = '<li class="post-list-item %s"><a data-id="%d" class="posts-image" style="%s" href="%s"><dt>%s</dt></a><div class="posts-inner"><div class="posts-header"><h3><a href="%s">%s</a></h3></div><div class="posts-content">%s</div></div></li>';
        if ($query->have_posts()) {
            $output = '<ul class="na-posts">';
            while ($query->have_posts()) {
                $query->the_post();
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $output .= sprintf($template, has_post_thumbnail() ? 'has-thumbnail' : '', get_the_ID(), implode(';', $style), get_the_permalink(), get_the_date('M<b>d</b>', '', ''), get_the_permalink(), get_the_title(), get_the_excerpt());
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();

        return $output;
    }
}
new Posts_Shortcode();
