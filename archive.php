<?php

/**
 * The main template file
 *
 */

global $wp_query;
$tax = $wp_query->get_queried_object();

if (is_string($tax->has_archive) && locate_template('inc/healthcare/templates/archive-' . $tax->has_archive . '.php') != '') {
    include(locate_template('inc/healthcare/templates/archive-' . $tax->has_archive . '.php'));
    return;
}

get_header();

?>

<div id="primary" class="content-area">
    <main id="main" class="px-4 py-4 mx-auto site-main 2xl:container sm:px-6 lg:px-8 blog-list" role="main">

        <div class="flex flex-col py-4 lg:flex-row lg:py-10">
            <div class="w-full lg:w-1/4">
                <div class="blog-sidebar sidebar">
                    <?php if (dynamic_sidebar('blog-sidebar')) : else : endif; ?>
                </div>
            </div>
            <div class="w-full mt-4 lg:w-3/4 lg:mt-0">
                <div class="blogroll">
                    <header>
                        <h1 class="page-title screen-reader-text">
                            <?php
                            the_archive_title('<h1 class="page-title">', '</h1>');
                            the_archive_description('<div class="taxonomy-description">', '</div>');
                            ?>
                        </h1>
                    </header>
                    <div class="flex gap-4">
                    <?php
                    // Start the loop.
                    while (have_posts()) : the_post();
                    ?>
                        <article id="<?php echo get_the_ID(); ?>" class="post-<?php echo get_the_ID(); ?> post blog-post w-full lg:w-1/2">
                            <div class="entry-content">
                                <?php $src= wp_get_attachment_image_src( get_post_thumbnail_id(get_the_ID()), 'full', false, '' ); ?>
                                <div class="bg-center bg-cover aspect-video" style="background-image: url(<?php echo $src[0]; ?>);"></div>
                                <h3 class="mt-4 post-title"><a href="<?php echo get_permalink(); ?>"><?php echo get_the_title(); ?></a></h3>
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