<?php
/**
 * Template Name: Home Page - Content
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */

 global $theme, $slider;
 get_header(); ?>

 <div id="primary" class="content-area">
	<?php echo do_shortcode('[slider category="29"]'); ?>
 	<main id="main" class="site-main" role="main">
 		<?php
 		// Start the loop.
 		while ( have_posts() ) : the_post();

 			// Include the page content template.
 			get_template_part( 'template-parts/content', 'page-notitle' );

 			// If comments are open or we have at least one comment, load up the comment template.
 			if ( comments_open() || get_comments_number() ) {
 				comments_template();
 			}

 			// End of the loop.
 		endwhile;
 		?>
 	</main><!-- .site-main -->



 </div><!-- .content-area -->
<?php get_footer(); ?>
