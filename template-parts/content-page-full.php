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
<div class="inner-section <?php echo $featured_image? 'has-featured-image': ''; ?>">
	<header class="<?php $theme->classes('header', 'entry-header'); ?>">
		<?php
		if($featured_image):
		?>
		<figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
			<img src="<?php echo $featured_image; ?>" />
		</figure>
		<?php endif; ?>
	</header><!-- .entry-header -->

	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<?php if(function_exists('bcn_display')){ ?>
			<div class="breadcrumb">
				<?php  bcn_display(); ?>
			</div>
		<?php } ?>
		<div class="entry-content <?php echo $theme->get_template_layout(get_the_ID(), 'container'); ?>">
			<div class="entry-inner-content">
				<?php
				the_content();

				?>
			</div>
		</div><!-- .entry-content -->

	</article><!-- #post-## -->
</div>
