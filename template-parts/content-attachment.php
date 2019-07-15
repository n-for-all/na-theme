<?php
/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */
global $naTheme;
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<div class="entry-content">
      <div class="row">
         <div class="col-md-12" style="text-align:center;margin-top:130px;">
             <?php $image_attributes = wp_get_attachment_image_src( get_post_thumbnail_id(), "full" );
               ?>
            <?php if ( $image_attributes ) : ?>
					<div class="doctor-main-image"><img src="<?php echo $image_attributes[0]; ?>" /></div>
				<?php endif; ?>
         </div>
      </div>
	</div><!-- .entry-content -->


</article><!-- #post-## -->
