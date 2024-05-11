<?php

/**
 * The main template file
 *
 */
get_header();

$filter = $_GET['filter'] ?? [];
$filter_division = $filter['division'] ?? '';

$tax = $wp_query->get_queried_object();

?>

<div id="primary" class="content-area">
    <main id="main" class="site-main blog-list" role="main">
        <div class="container blog-list-container">
            <div class="flex w-full">
                <div class="pr-10">
                    <div class="blog-sidebar sidebar">
                        <?php include_once(get_template_directory() . '/inc/healthcare/templates/parts/department-filters.php'); ?>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="mb-10 blogroll">
                    <?php include_once(get_template_directory() . '/inc/healthcare/templates/parts/doctors-filters.php'); ?>
                        <div class="grid w-full gap-4 md:grid-cols-3 lg:grid-cols-4">
                        
                        <?php
                        // Start the loop.
                        while (have_posts()) : the_post();
                            $image = $post->image;
                            $position = $post->position;
                        ?>
                            <div class="doctor-<?php echo get_the_ID(); ?> doctor-item bg-gray-100 shadow">
                                <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="bg-center bg-no-repeat bg-contain image-aspect-full doctor-image"></a>
                                <h3 class="mt-3 text-xl font-medium text-center title doctor-title"><?php the_title(); ?></h3>
                                <div class="pb-3 text-center doctor-position"><?php echo $position; ?></div>
                            </div>

                        <?php

                        // End the loop.
                        endwhile;
                        ?>
                        </div>
                        <?php

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