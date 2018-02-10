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

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<?php if(function_exists('bcn_display') && false){ ?>
		<div class="breadcrumb">
			<?php  bcn_display(); ?>
		</div>
	<?php } ?>

	<header class="<?php $theme->classes('header', 'entry-header'); ?>">
		<?php
		if($featured_image):
		?>
		<figure class="entry-image" style="background-image:<?php echo $featured_image; ?>">
			<img src="<?php echo $featured_image; ?>" />
		</figure>
		<?php endif; ?>
		<div class="container">
			<div class="row">
				<div class="col-md-12"><?php the_title( '<h1 class="entry-title">', '</h1>' ); ?></div>
			</div>
		</div>
	</header><!-- .entry-header -->

	<div class="<?php $theme->classes('content', 'entry-content'); ?>  <?php echo $theme->get_template_layout(get_the_ID(), 'container'); ?>">
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

	<?php
		edit_post_link(
			sprintf(
				/* translators: %s: Name of current post */
				__( 'Edit<span class="screen-reader-text"> "%s"</span>', 'twentysixteen' ),
				get_the_title()
			),
			'<footer class="entry-footer"><span class="edit-link">',
			'</span></footer><!-- .entry-footer -->'
		);
	?>

</article><!-- #post-## -->
