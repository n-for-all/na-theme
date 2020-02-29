<?php

global $switcher_index;
$switcher_index = 0;

class Na_Theme_Shortcodes
{
    function __construct()
    {
        add_shortcode('na_product_categories',  array(&$this, 'product_categories_shortcode'));
        add_shortcode('na_pages',  array(&$this, 'pages_shortcode'));
        add_shortcode('na_menu_items',  array(&$this, 'menu_items_shortcode'));

        if (function_exists('pll_current_language')) {
            add_shortcode('trans',  array(&$this, 'translate_shortcode'));
            add_shortcode('translate',  array(&$this, 'translate_shortcode'));
        }
    }
    public function product_categories_shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'ids' => "",
        ), $atts, 'events');

        $terms = get_terms('product_cat', array(
            'hide_empty' => false,
        ));
        $output = "";
        $menu = array();
        //$services = get_posts( $args );
        $inner = "";
        if (!is_wp_error($terms) && count($terms) > 0) {
            foreach ($terms as $term) {
                $thumbnail_id = get_woocommerce_term_meta($term->term_id, 'thumbnail_id', true);
                // get the image URL for parent category
                $image = wp_get_attachment_url($thumbnail_id);
                $menu[] = '<li><a href="' . get_term_link($term) . '" style="background-image:url(' . $image . ')"><div><h3>' . $term->name . '</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
            }
        }
        $output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">' . implode("", $menu) . "</ul></div></div></div></section>";

        wp_reset_postdata();
        return $output;
    }
    public function translate_shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'text' => "",
            'domain' => ""
        ), $atts, 'menu_items');
        return __(pll__($atts['text']), $atts['domain']);
    }
    public function menu_items_shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'menu' => "",
            'parent' => -1
        ), $atts, 'menu_items');
        $args = array();
        if ($atts['parent'] > 0) {
            $args['menu_item_parent'] = $atts['parent'];
        }

        $menu_name = $atts['menu'];
        $locations = get_nav_menu_locations();
        $menu_id = $locations[$menu_name];

        $menu = wp_get_nav_menu_object($menu_id, $args);
        $items = wp_get_nav_menu_items($menu_id);

        $output = "";
        $menu = array();
        //$services = get_posts( $args );
        $inner = "";
        if (!is_wp_error($items) && count($items) > 0) {
            foreach ($items as $item) {
                if ($args['menu_item_parent'] && $args['menu_item_parent'] == $item->menu_item_parent) {
                    $menu[] = $this->show_menu_items($item);
                } elseif (!isset($args['menu_item_parent'])) {
                    $menu[] = $this->show_menu_items($item);
                }
            }
        }
        $output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">' . implode("", $menu) . "</ul></div></div></div></section>";

        wp_reset_postdata();
        return $output;
    }
    public function show_menu_items($item)
    {
        $menu = '';
        if ($item->type == 'post_type') {
            $thumbnail_id = get_post_thumbnail_id($item->object_id);
            $image = wp_get_attachment_url($thumbnail_id);
            $menu = '<li><a href="' . get_permalink($item->object_id) . '" style="background-image:url(' . $image . ')"><div><h3>' . $item->title . '</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
        } elseif ($item->type == 'taxonomy') {
            $image = '';
            if ($item->object == 'product_cat') {
                $thumbnail_id = get_woocommerce_term_meta($item->object_id, 'thumbnail_id', true);
                $image = wp_get_attachment_url($thumbnail_id);
            }
            // get the image URL for parent category
            $menu = '<li><a href="' . get_term_link(intval($item->object_id), $item->object) . '" style="background-image:url(' . $image . ')"><div><h3>' . $item->title . '</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
        } elseif ($item->type == 'custom') {
            $image = '';
            // get the image URL for parent category
            $menu = '<li><a href="' . $item->url . '" style="background-image:url(' . $image . ')"><div><h3>' . $item->title . '</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
        }
        return $menu;
    }
    public function pages_shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'ids' => "",
        ), $atts, 'events');

        $pages = get_posts(array('post_type' => 'page', 'post__in' => explode(",", $atts['ids'])));
        $output = "";
        $menu = array();
        //$services = get_posts( $args );
        $inner = "";
        if (!is_wp_error($pages) && count($pages) > 0) {
            foreach ($pages as $page) {
                $thumbnail_id = get_post_thumbnail_id($page->ID);
                $image = wp_get_attachment_url($thumbnail_id);
                $menu[] = '<li><a href="' . get_permalink($page->ID) . '" style="background-image:url(' . $image . ')"><div><h3>' . $page->post_title . '</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
            }
        }
        $output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">' . implode("", $menu) . "</ul></div></div></div></section>";

        wp_reset_postdata();
        return $output;
    }
}
//initialize the shortcodes
new Na_Theme_Shortcodes();
