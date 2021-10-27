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

$hide_title = $hide_title ? true : false;

$classes = array_map( 'esc_attr', [$naTheme->get_template_layout(get_the_ID(), 'container'), is_home() ? 'full-height' : '']);

?>
<div class="<?php echo implode(' ', $classes); ?>">
    <?php $naTheme->get_template_layout_before(get_the_ID()); ?>
    <div <?php post_class('content inner-content ' . $post->post_name); ?>>
        <div class="entry-inner inner">
            <?php if (!$hide_title) : ?>
                <div class="entry-title">
                    <h2>
                        <?php the_title(); ?>
                    </h2>
                </div>
            <?php endif; ?>
            <div class="entry-content">
                <?php the_content(); ?>
            </div><!-- .entry-content -->
        </div>
    </div>
    <?php $naTheme->get_template_layout_after(get_the_ID()); ?>
</div>
<!-- #post-## -->