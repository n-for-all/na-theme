<?php

global $naTheme;
get_header(); ?>

<div id="primary" class="content-area">
	<main id="main" class="site-main" role="main">
		<?php
		// Start the loop.
		while ( have_posts() ) : the_post();

			// Include the page content template.
			get_template_part( 'template-parts/content', 'single-service' );

			// If comments are open or we have at least one comment, load up the comment template.
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}

			// End of the loop.

            $category = get_the_terms( get_the_ID(), 'services' );
			if(!is_wp_error($category) && $category && sizeof($category) > 0){
				$args = array(
					'exclude' => get_the_ID(),
					'post_type' => 'service',
					'posts_per_page' => 3,
					'tax_query' => array(
						array(
							'taxonomy' => 'services',
							'field' => 'term_id',
							'terms' => $category[0]->term_id
						)
					)
				);
				$related = get_posts($args);
				?>

				<section class="related-departments">
					<div class="container">
					<div class="row">
						<div class="col-md-12 col-xs-12"><h1>Other Departments</h1></div>
						<?php
						foreach($related as $post){
							setup_postdata($post);
							?>
							<div class="col-md-4 col-sm-4 col-xs-12">
							<div class="service-related">
									<div class="image">
										<?php if(has_post_thumbnail()){
												echo get_the_post_thumbnail( get_the_ID(), 'large' );
											?>
											<?php } ?>
									</div>
									<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
									<div class="excerpt"><?php the_excerpt(); ?></div>
							</div>
							</div>
							<?php
						}
						?>
					</div>
					</div>
				</section>
				<?php
			}
		endwhile;
		?>

	</main><!-- .site-main -->


</div><!-- .content-area -->

<?php get_footer(); ?>
