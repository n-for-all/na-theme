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
get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main blog-list" role="main">

			<div class="inner-header">
				<div class="inner-overlay" style=""></div>
			</div>
			<div class="container">
						<header>
							<h1 class="page-title screen-reader-text">				<?php
												the_archive_title( '<h1 class="page-title">', '</h1>' );
												the_archive_description( '<div class="taxonomy-description">', '</div>' );
											?></h1>
						</header>
					<div class="blog-sidebar sidebar">
						<?php if(dynamic_sidebar('blog-sidebar')):else:endif; ?>
					</div>
					<div class="blogroll">
						<div class="row">

					<?php
					// Start the loop.
					while ( have_posts() ) : the_post();
					?>
					<div class="col-md-4 col-sm-6 col-xs-12">
						<?php
						/*
						 * Include the Post-Format-specific template for the content.
						 * If you want to override this in a child theme, then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 */

						get_template_part( 'blog-parts/content-team', get_post_format() );


						?>
						</div>
						<?php
					endwhile;

					// Previous/next page navigation.
					the_posts_pagination( array(
						'prev_text'          => __( 'Previous page', 'twentyfifteen' ),
						'next_text'          => __( 'Next page', 'twentyfifteen' ),
						'before_page_number' => '<span class="meta-nav screen-reader-text">' . __( 'Page', 'twentyfifteen' ) . ' </span>',
					) );


				?>
				</div>
				</div>
			</div>
		</main><!-- .site-main -->

	</div><!-- .content-area -->
<?php get_footer(); ?>
