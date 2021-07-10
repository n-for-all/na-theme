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
<?php
/**
 * Featured Image
 */
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
?>
<div class="inner-section <?php echo $featured_image ? 'has-featured-image' : ''; ?>" style="<?php if ($featured_image) { ?>background-image:url(<?php echo $featured_image; ?>)<?php } ?>">
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <div class="entry-content <?php echo $naTheme->get_template_layout(get_the_ID(), 'container'); ?>">
            <?php $naTheme->get_template_layout_before(get_the_ID()); ?>
            <div class="entry-inner-content">
                <?php
                the_content();
                ?>
            </div>
            <?php $naTheme->get_template_layout_after(get_the_ID()); ?>
        </div><!-- .entry-content -->
    </article><!-- #post-## -->
</div>