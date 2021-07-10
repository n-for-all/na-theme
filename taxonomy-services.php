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
global $wp_query;
if ($wp_query->found_posts == 1) {
    $post = $wp_query->post;
    wp_redirect(get_permalink($post), 301);
    exit;
}
$term = get_queried_object();
$image = get_term_meta($term->term_id, '_meta_na_image', true);
get_header(); ?>
<div id="primary" class="content-area">
    <main id="main" class="site-main blog-list" role="main">
        <header class="<?php $naTheme->classes('header', 'entry-header entry-header-main'); ?>">
            <?php
            if ($image) :
                $src = wp_get_attachment_image_src($image, 'full');
            ?>
                <figure class="entry-image" style="background-image:url(<?php echo $src[0]; ?>)">
                    <img src="<?php echo $src[0]; ?>" />
                </figure>
            <?php endif; ?>
        </header>
        <div class="archive-content container">
            <h1 class="entry-title"> <?php echo single_cat_title('', false); ?></h1>
            <?php
            the_archive_description('<div class="taxonomy-description">', '</div>');
            ?>
            <section class="services-related">
                <div class="container">
                    <div class="row">
                        <?php
                        while (have_posts()) : the_post();
                            /*
                         * Include the Post-Format-specific template for the content.
                         * If you want to override this in a child theme, then include a file
                         * called content-___.php (where ___ is the Post Format name) and that will be used instead.
                         */
                        ?>
                        <div class="col-md-4 col-sm-4 col-xs-12">
                            <div class="service-related">
                                <div class="image">
                                    <?php if (has_post_thumbnail()) {
                                        echo get_the_post_thumbnail(get_the_ID(), 'large');
                                    ?>
                                    <?php } ?>
                                </div>
                                <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                                <a href="<?php the_permalink(); ?>" class="btn btn-secondary more-link">Book Now</a>
                            </div>
                        </div>
                        <?php

                        // End the loop.
                        endwhile;

                        // Previous/next page navigation.
                        the_posts_pagination(array(
                            'prev_text'          => __('Previous page', 'twentyfifteen'),
                            'next_text'          => __('Next page', 'twentyfifteen'),
                            'before_page_number' => '<span class="meta-nav screen-reader-text">' . __('Page', 'twentyfifteen') . ' </span>',
                        ));
                        ?>
                    </div>
                </div>
            </section>
        </div>
    </main><!-- .site-main -->
</div><!-- .content-area -->
<?php get_footer(); ?>