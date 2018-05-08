<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * e.g., it puts together the home page when no home.php file exists.
 *
 * Learn more: {@link https://codex.wordpress.org/Template_Hierarchy}
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

global $theme, $post;

$page = get_option( 'page_for_posts' );
$featured_image = $theme->get_post_thumbnail($page ?$page:null , 'full');
get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main blog-list" role="main">
			<header class="<?php $theme->classes('header', 'entry-header'); ?>">
				<?php
				if($featured_image):
				?>
				<figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
					<img src="<?php echo $featured_image; ?>" />
				</figure>
				<?php endif; ?>
				<div class="container">
					<div class="row">
						<div class="col-md-12">
							<?php if ( is_home() && ! is_front_page() ) : ?>
								<h1 class="entry-title blog-title"><?php single_post_title(); ?></h1>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</header><!-- .entry-header -->
			<div class="blog-list-container">
				<?php if ( have_posts() ) :
					$sidebar = is_active_sidebar('blog-sidebar');
					?>
				<?php if ( $sidebar ) : ?>
					<div class="blog-sidebar sidebar">
						<?php dynamic_sidebar('blog-sidebar'); ?>
					</div>
				<?php endif; ?>
					<div class="blogroll <?php echo !$sidebar ? 'no-sidebar': '' ?>">
					<?php
					// Start the loop.
					while ( have_posts() ) : the_post();
						/*
						 * Include the Post-Format-specific template for the content.
						 * If you want to override this in a child theme, then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 */

						get_template_part( 'template-parts/blog/content', get_post_format() );
					// End the loop.
					endwhile;

					// Previous/next page navigation.
					the_posts_pagination( array(
						'prev_text'          => __( 'Previous page', 'twentyfifteen' ),
						'next_text'          => __( 'Next page', 'twentyfifteen' ),
						'before_page_number' => '<span class="meta-nav screen-reader-text">' . __( 'Page', 'twentyfifteen' ) . ' </span>',
					) );

				// If no content, include the "No posts found" template.
				else :
					get_template_part( 'template-parts/blog/content', 'none' );

				endif;
				?>
				</div>
			</div>
		</main><!-- .site-main -->

	</div><!-- .content-area -->
<?php get_footer(); ?>
