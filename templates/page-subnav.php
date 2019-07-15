<?php
/**
* Template Name: Page Sub Nav
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
global $naTheme;
get_header(); ?>

	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">

		<?php
		// Start the loop.
		global $post;
		while ( have_posts() ) : the_post();
			$parent = $post->post_parent;
			if($parent == 0){
				$parent = get_the_ID();
			}
			$args = array(
				'post_parent' => $parent,
				'post_type'   => 'page',
				'posts_per_page' => 10,
				'numberposts' => -1,
				'orderby' => 'menu_order',
				'post_status' => 'publish'
			);
			$children_array = get_posts( $args );
			$col = 12;
			?>
			<div class="container">
				<div class="row">
					<?php if(sizeof($children_array) > 0):
					$col = 8;
					?>
					<div class="col-md-3">
						<ul class="nav-side">
						<?php foreach($children_array as $child): ?>
						<li class="<?php echo $child->ID == get_the_ID() ? 'active' : ''; ?>"><a href="<?php echo get_permalink($child->ID); ?>"><?php echo $child->post_title; ?></a></li>
						<?php endforeach; ?>
						</ul>
					</div>
					<?php endif; ?>
					<div class="col-md-<?php echo $col; ?>">
						<?php
						// Include the page content template.
						get_template_part( 'template-parts/content', 'page' );

						// If comments are open or we have at least one comment, load up the comment template.
						if ( comments_open() || get_comments_number() ) :
						comments_template();
						endif;
						// End the loop.
						?>
					</div>
				</div>
			</div>
		<?php
		endwhile;
		?>

		</main><!-- .site-main -->
	</div><!-- .content-area -->

<?php get_footer(); ?>
