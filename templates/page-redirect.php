<?php
/**
* Template Name: Page Redirect
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
global $theme, $post;
while ( have_posts() ) : the_post();
    $parent = get_the_ID();
    $args = array(
        'post_parent' => $parent,
        'post_type'   => 'page',
        'posts_per_page' => 10,
        'numberposts' => -1,
        'orderby' => 'menu_order',
        'post_status' => 'publish'
    );
    $children_array = get_posts( $args );
    if(sizeof($children_array) > 0):
        wp_redirect( get_permalink($children_array[0]->ID), 301 );
        exit;
    endif;
endwhile;
?>
