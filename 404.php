<?php

/**
 * The template for displaying 404 pages (not found)
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

get_header(); ?>

<div class="px-4 py-4 mx-auto 2xl:container sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
        <header class="page-header">
            <h1 class="text-5xl font-bold"><?php _e('Oops! That page can&rsquo;t be found.', 'na-theme'); ?></h1>
        </header>

        <div class="page-content">
            <p><?php _e('It looks like nothing was found at this location. Maybe try a search?', 'na-theme'); ?></p>
            <?php get_search_form(); ?>
        </div>
    </div>
</div>


<?php get_footer(); ?>