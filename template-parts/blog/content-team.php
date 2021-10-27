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

global $post;
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
$meta = get_post_meta($post->ID, '_meta_team', true);
?>

<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <div class="row row-flex">
        <div class="col-lg-6 col-md-12">
            <figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
                <img src="<?php echo $featured_image; ?>" />
            </figure>
        </div>
        <div class="col-lg-6 col-md-12 d-flex align-items-center">
            <div class="entry-content">
                <?php the_title('<h3 class="entry-title">', '</h3>'); ?>
                <div class="position"><?php echo $meta['position'] ?? ''; ?></div>
                <div class="entry-inner-content">
                    <?php
                    the_content();
                    ?>
                </div>
            </div>
        </div>
    </div><!-- #post-## -->
</div><!-- #post-## -->