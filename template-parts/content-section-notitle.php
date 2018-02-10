<?php
/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */
global $theme, $_class, $post;
$background = $theme->get_post_thumbnail(null, 'full');
?>


<div id="<?php echo $post->post_name; ?>" <?php post_class( 'content inner-content' ); ?>>
	<div class="entry-inner inner">
        <div class="entry-content">
            <?php the_content(); ?>
        </div><!-- .entry-content -->
	</div>
</div><!-- #post-## -->
