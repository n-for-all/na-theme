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
global $naTheme, $post;

$featured_image = $naTheme->get_post_thumbnail(null, 'full');
get_header(); ?>

<div class="px-4 mx-auto 2xl:container sm:px-6 lg:px-8">
    <?php if (have_posts()) : ?>
        <h1 class="entry-title search-title"><?php printf(__('Search Results for: %s', 'na-theme'), '<span>' . get_search_query() . '</span>'); ?></h1>
    <?php else : ?>
        <h1 class="entry-title search-title"><?php _e('Sorry we couldn\'t find what you are looking for.', 'na-theme'); ?></h1>
    <?php endif; ?>
    <main id="main" class="site-main search-products" role="main">
        <?php
        global $wp_query;
        $posts = $wp_query->get_posts();
        if (have_posts()) :
            /* Start the Loop */
            $args = array(
                'public'   => true,
                'exclude_from_search'   => false
            );

            $output = 'objects'; // names or objects, note names is the default
            $operator = 'and'; // 'and' or 'or'

            $post_types = get_post_types($args, $output, $operator);

            $values = array();
            foreach ($post_types as $type => $post_type) {
                $values[$type] = ['label' => $post_type->label, 'posts' => array_filter($posts, function ($post) use ($type) {
                    return $post->post_type == $type;
                })];
            }
            foreach ($values as $type => $value) {
                if (count($value['posts']) > 0) { ?>
                    <h2 class="text-2xl block-title"><?php echo $value['label']; ?></h2>
                    <div class="block-content block-type-<?php echo $type; ?>">
                        <?php
                        foreach ($value['posts'] as $post) {
                            setup_postdata($post);
                            get_template_part('template-parts/content', 'search');
                        }
                        ?>
                    </div><?php
                        }
                    }

                    the_posts_pagination(array(
                        'prev_text' =>  '<span class="screen-reader-text">' . __('Previous page', 'na-theme') . '</span>',
                        'next_text' => '<span class="screen-reader-text">' . __('Next page', 'na-theme') . '</span>',
                        'before_page_number' => '<span class="meta-nav screen-reader-text">' . __('Page', 'na-theme') . ' </span>',
                    ));

                else : ?>
            <p>
                <?php _e('Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'na-theme'); ?>
            </p>
        <?php
                    get_search_form();
                endif;
        ?>
    </main>
</div>
<?php get_footer();
