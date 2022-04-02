<?php

global $naTheme;
get_header(); ?>

<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
        <?php
        // Start the loop.
        while (have_posts()) : the_post();

            // Include the page content template.
            get_template_part('template-parts/content', 'single-article');

            // If comments are open or we have at least one comment, load up the comment template.
            if (comments_open() || get_comments_number()) {
                comments_template();
            }

            // End of the loop.

            $category = get_the_terms(get_the_ID(), 'news');
            if (!is_wp_error($category) && $category && sizeof($category) > 0) {
        ?>
                <section class="news-related">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12 col-xs-12">
                                <h2><?php _e('Related News', 'na-theme'); ?></h2>
                            </div>
                            <div class="col-md-12 col-xs-12">
                                <?php
                                echo do_shortcode(sprintf('[news slider="1" category="%s" limit="6" columns="3" exclude="%s"]',  $category[0]->term_id, get_the_ID()));
                                ?>
                            </div>
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