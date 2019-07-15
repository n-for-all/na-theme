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

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<?php if(function_exists('bcn_display') && false){ ?>
		<div class="breadcrumb">
			<?php  bcn_display(); ?>
		</div>
	<?php } ?>

	<header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
		<?php
		if($featured_image):
		?>
		<figure class="entry-image" style="background-image:<?php echo $featured_image; ?>">
			<img src="<?php echo $featured_image; ?>" />
		</figure>
		<?php endif; ?>
		<?php the_title( '<h1 class="entry-title"><a href="'.get_the_permalink().'">', '</a></h1>' ); ?>
	</header><!-- .entry-header -->

	<div class="<?php $naTheme->classes('content', 'entry-content'); ?>">
		<div class="entry-inner-content">
			<?php
			the_excerpt();
			?>
		</div>
	</div><!-- .entry-content -->
</article><!-- #post-## -->
