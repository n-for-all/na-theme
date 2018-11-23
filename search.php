<?php
/**
 * The template for displaying search results pages
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#search-result
 *
 * @package WordPress
 * @subpackage Twenty_Seventeen
 * @since 1.0
 * @version 1.0
 */
 global $theme, $post;

 $featured_image = $theme->get_post_thumbnail(null , 'full');
get_header(); ?>

<div class="wrap">
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
					<?php if (have_posts()) : ?>
						<h1 class="entry-title search-title"><?php printf(__('Search Results for: %s', 'na-theme'), '<span>' . get_search_query() . '</span>'); ?></h1>
					<?php else : ?>
						<h1 class="entry-title search-title"><?php _e('Sorry we couldn\'t find what you are looking for.', 'na-theme'); ?></h1>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</header><!-- .entry-header -->
	<div id="primary" class="content-area container">
		<main id="main" class="site-main search-products" role="main">
			<div class="row">
				<div class="col-md-12">
		<?php
        if (have_posts()) :
            /* Start the Loop */
			$args = array(
			   'public'   => true,
			   'exclude_from_search'   => false
			);

			$output = 'objects'; // names or objects, note names is the default
			$operator = 'and'; // 'and' or 'or'

			$post_types = get_post_types( $args, $output, $operator );
			foreach( $post_types as $type => $post_type ){
				if(!in_array($type, array('product'))){
					continue;
				}
				if(have_posts()){
				     ?><h2 class="block-title"><?php echo $post_type->label; ?></h2><div class="block-content block-type-<?php echo $type; ?>"><?php
			        while( have_posts() ){
			            the_post();
			            if( $type == get_post_type() ){
			                get_template_part('template-parts/content', 'search');
			            }
			        }
			        rewind_posts();
			         ?></div><?php
				 }
		    }

            the_posts_pagination(array(
                'prev_text' =>  '<span class="screen-reader-text">' . __('Previous page', 'twentyseventeen') . '</span>',
                'next_text' => '<span class="screen-reader-text">' . __('Next page', 'twentyseventeen') . '</span>' ,
                'before_page_number' => '<span class="meta-nav screen-reader-text">' . __('Page', 'twentyseventeen') . ' </span>',
            ));

        else : ?>

			<p><?php _e('Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'twentyseventeen'); ?></p>
			<?php
                get_search_form();

        endif;
        ?>
			</div>
			</div>
		</main><!-- #main -->
	</div><!-- #primary -->
</div><!-- .wrap -->
<?php get_footer();
