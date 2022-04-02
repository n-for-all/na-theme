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
get_header();
$tax = $wp_query->get_queried_object();
$terms = get_terms(array(
    'taxonomy' => $tax->taxonomy,
    'hide_empty' => false,
));
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main blog-list" role="main">
        <div class="blog-list-container container">
            <div class="row">
                <div class="col-md-3">
                    <div class="blog-sidebar sidebar">
                        <?php if (dynamic_sidebar('blog-sidebar')) : else : endif; ?>
                        <?php if ($terms) : ?>
                            <ul class="nav-side">
                                <?php foreach ($terms as $term) :
                                ?>
                                    <li class="<?php echo $tax->term_id == $term->term_id ? 'active': ''; ?>"><a href="<?php echo get_term_link($term); ?>"><?php echo $term->name; ?></a></li>
                                <?php
                                endforeach; ?>
                            </ul>
                        <?php endif ?>
                    </div>
                </div>
                <div class="col-md-9">
                    <div class="blogroll">
                        <header>
                            <h1 class="page-title screen-reader-text">
                                <?php
                                the_archive_title('<h1 class="page-title">', '</h1>');
                                the_archive_description('<div class="taxonomy-description">', '</div>');
                                ?>
                            </h1>
                        </header>
                        <?php
                        // Start the loop.
                        while (have_posts()) : the_post();
                        ?>

                            <article id="<?php echo $post_id; ?>" class="<?php echo $post_id; ?> post blog-post">
                                <div class="entry-content">
                                    <?php echo get_the_post_thumbnail($post->ID, 'large'); ?>
                                    <h3 class="post-title"><a href="<?php echo get_permalink(); ?>"><?php echo get_the_title(); ?></a></h3>
                                    <span class="meta-info-container"><?php echo get_the_date('F j, Y', $post->ID); ?></span>
                                </div>
                            </article>

                        <?php

                        // End the loop.
                        endwhile;

                        // Previous/next page navigation.
                        the_posts_pagination(array(
                            'prev_text'          => '&larr;',
                            'next_text'          => '&rarr;',
                            'before_page_number' => '<span class="meta-nav screen-reader-text">' . __('Page', 'na-theme') . ' </span>',
                        ));


                        ?>
                    </div>
                </div>
            </div>
        </div>
    </main><!-- .site-main -->
</div><!-- .content-area -->
<?php get_footer(); ?>