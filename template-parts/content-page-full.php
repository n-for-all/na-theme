<?php
/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */
global $theme, $post;
?>
<?php
/**
 * Featured Image
 */
$featured_image = $theme->get_post_thumbnail(null, 'full');
?>
<div class="inner-section <?php echo $featured_image? 'has-featured-image': ''; ?>" style="<?php echo $featured_image? "background-image:url(  $featured_image)": ''; ?>">
	<?php
	if($featured_image):
	?>
	<figure class="entry-image featured-image">
		<img src="<?php echo $featured_image; ?>" />
	</figure>
	<?php  endif; ?>

	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<?php if(function_exists('bcn_display')){ ?>
			<div class="breadcrumb">
				<?php  bcn_display(); ?>
			</div>
		<?php } ?>
		<div class="entry-content">
			<div class="entry-inner-content">
				<?php
				the_content();

				wp_link_pages( array(
					'before'      => '<div class="page-links"><span class="page-links-title">' . __( 'Pages:', 'twentysixteen' ) . '</span>',
					'after'       => '</div>',
					'link_before' => '<span>',
					'link_after'  => '</span>',
					'pagelink'    => '<span class="screen-reader-text">' . __( 'Page', 'twentysixteen' ) . ' </span>%',
					'separator'   => '<span class="screen-reader-text">, </span>',
				) );
				?>
			</div>
		</div><!-- .entry-content -->

	</article><!-- #post-## -->
</div>
