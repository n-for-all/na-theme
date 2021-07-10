<?php

/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */
global $naTheme, $_class, $post;
$background = $naTheme->get_post_thumbnail(null, 'full');

?>
<div class="<?php echo $naTheme->get_template_layout(get_the_ID(), 'container'); ?>">
    <?php $naTheme->get_template_layout_before(get_the_ID()); ?>
    <div <?php post_class('content inner-content ' . $post->post_name); ?> style="<?php echo $background ? 'background-image:url(' . $background . ')' : '' ?>">
        <div class="entry-inner inner">
            <div class="entry-title">
                <h2>
                    <?php the_title(); ?>
                </h2>
            </div>
            <div class="entry-content">
                <?php the_content(); ?>
            </div><!-- .entry-content -->
        </div>
    </div>
    <?php $naTheme->get_template_layout_after(get_the_ID()); ?>
</div>
<!-- #post-## -->