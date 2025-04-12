<?php

namespace NaTheme\Inc\Products;

class Shortcodes
{
    public function __construct()
    {
        $this->actions();
        $this->shortcodes();
    }
    public function actions() {}
    public function shortcodes()
    {
        add_shortcode('products_featured', array($this, 'get_featured_products'));
    }

    public function get_featured_products($atts)
    {
        extract(shortcode_atts(array(
            'title' => 'Featured Plugins & Addons',
            'description' => 'Wide range of solutions to fit every need.',
            'featured' => true,
            'category'      => '',
            'per_page'  => '-1',
            'orderby' => 'date',
            'order' => 'desc'
        ), $atts));

        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'ignore_sticky_posts'   => 1,
            'posts_per_page' => $per_page,
            'orderby' => $orderby,
            'order' => $order,
            'featured' => true,
            'meta_query' => array(
                array(
                    'key' => '_visibility',
                    'value' => array('catalog', 'visible'),
                    'compare' => 'IN'
                )
            ),

        );

        if ($category && $category != '') {
            $args = array_merge($args, array('tax_query'             => array(
                array(
                    'taxonomy'      => 'product_cat',
                    'terms'         => array(esc_attr($category)),
                    'field'         => 'slug',
                    'operator'      => 'IN'
                )
            )));
        }

        ob_start();
        include(dirname(__FILE__) . '/templates/featured.php');
        return ob_get_clean();
    }
}
