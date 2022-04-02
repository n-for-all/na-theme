<?php

/**
 * Template Name: Page Sections
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
global $naTheme;
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
get_header(); ?>
<div id="primary" class="content-area ">
    <main id="main" class="site-main" role="main">
        <header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
            <?php
            if ($featured_image) :
            ?>
                <figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
                    <img src="<?php echo $featured_image; ?>" />
                </figure>
            <?php endif; ?>
            <div class="container">
                <div class="row">
                    <div class="col-md-12"><?php the_title('<h1 class="entry-title">', '</h1>'); ?></div>
                </div>
            </div>

        </header><!-- .entry-header -->
        <?php
        // Start the loop.
        while (have_posts()) : the_post();
            // Include the page content template.
            $args = array(
                'post_parent' => get_the_ID(),
                'post_type'   => 'page',
                'posts_per_page' => -1,
                'post_status' => 'publish',
                'orderby'            => 'menu_order',
                'order'    => 'ASC'
            );
            $_children = get_posts($args);
            $i = 0;
            global $_class, $naTheme;
            foreach ($_children as $post) {
                //print_r($post);
                setup_postdata($post);
                $_class = 'section ';
                $_class .= $i % 2 == 0 ? 'even' : 'odd';
                $_class .= " section-" . $post->post_type;
                $_class .= " " . $naTheme->get_template_part($post->ID, 'content-page-notitle');
                $_class .= " subsection";

                $extraClass = get_post_meta($post->ID, '_wp_section_class', true);
                if ($extraClass) {
                    $_class .= " " . $extraClass;
                }

                $background = $naTheme->get_post_thumbnail($post, 'full');
                if ($background) {
                    $_class .= " has-post-thumbnail";
                }
                include('parts/section.php');
                $i++;
            }
            wp_reset_postdata();
            //get_template_part( 'content', 'home' );

            // If comments are open or we have at least one comment, load up the comment template.
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            // End the loop.
            break;
        endwhile;
        ?>
    </main>
    <!-- .site-main -->
</div>
<!-- .content-area -->
<?php get_footer(); ?>