<?php

/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */
global $naTheme, $post;
?>
<div class="inner-section ">
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <div class="entry-content">
            <?php $naTheme->get_template_layout_before(get_the_ID(), 'container'); ?>
            <div class="entry-inner-content">
                <?php the_content(); ?>
            </div>
            <?php $naTheme->get_template_layout_after(get_the_ID(), 'container'); ?>
        </div>
    </article><!-- #post-## -->
</div>