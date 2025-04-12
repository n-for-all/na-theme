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
global $naTheme, $post;
while ( have_posts() ) : the_post();
    $parent = $post->post_parent;
    
    $parentPage = get_post( $parent );

    if($parentPage):
        wp_redirect( get_permalink($parentPage), 301 );
        exit;
    endif;
endwhile;
?>
