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
<div class="inner-section <?php echo $featured_image  ? 'has-featured-image' : ''; ?>" style="<?php echo $featured_image ? "background-image:url($featured_image)" : ''; ?>">

    <div <?php post_class(); ?>>
        <div class="entry-content">
            <div class="entry-inner-content">
                <?php
                the_content();

                wp_link_pages(array(
                    'before'      => '<div class="page-links"><span class="page-links-title">' . __('Pages:', 'na-theme') . '</span>',
                    'after'       => '</div>',
                    'link_before' => '<span>',
                    'link_after'  => '</span>',
                    'pagelink'    => '<span class="screen-reader-text">' . __('Page', 'na-theme') . ' </span>%',
                    'separator'   => '<span class="screen-reader-text">, </span>',
                ));
                ?>
            </div>
        </div><!-- .entry-content -->

    </div><!-- #post-## -->
</div>