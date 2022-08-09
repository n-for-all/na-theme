<?php

/**
 * Template Name: Home Page - Sections
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
global $_class, $naTheme, $post;
get_header(); ?>
<div id="primary" class="content-area ">
    <main id="main" class="site-main" role="main">
        <div class="main-inner">
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
                $query = new \WP_Query($args);
                $i = 0;
                $start_scroller = false;

                while ($query->have_posts()) :
                    $query->the_post();
                    $_class = 'section ';
                    $_class .= $i % 2 == 0 ? 'even' : 'odd';
                    $_class .= " section-scroll section-" . $post->post_type;
                    $_class .= " " . $naTheme->get_template_part(get_the_ID(), 'content-page-notitle');
                    $_class .= " subsection";

                    $extraClass = $naTheme->get_meta(get_the_ID(), '_wp_section_class');
                    if ($extraClass) {
                        $_class .= " " . $extraClass;
                    }
                    $background = $naTheme->get_post_thumbnail($post, 'full');
                    if ($background) {
                        $_class .= " has-post-thumbnail";
                    } ?>
                    <?php 
                    if ($naTheme->homepage_scrolling != "") : //scrollmagic manual
                        if (($i == 1 || $naTheme->homepage_scrolling == 1) && !$start_scroller) :
                            $start_scroller = true; ?>
                            <div id="scroll-container" class="scrolling-container--<?php echo $naTheme->homepage_scrolling; ?>">
                                <div id="inner-scroll" class="scrolling-style-<?php echo $naTheme->homepage_scrolling; ?>">
                                <?php
                        endif;
                    endif;
                    include 'parts/section.php';

                    $i++;
                endwhile;
                if ($start_scroller) :
                    if ($naTheme->homepage_scrolling == 4) :
                            ?>
                            <section class="section-placeholder"></section>
                        <?php
                    endif; ?>
                            </div>
                        </div>
                    <?php
                endif;
                if ($naTheme->show_scroll_icon == 1) { ?>
                        <span class="mouse"><span class="scroll" title=""></span></span>
                <?php }
                
                $query->reset_postdata();
            endwhile;
            wp_reset_postdata();
        ?>
        </div>
    </main>
    <!-- .site-main -->
</div>
<!-- .content-area -->
<?php get_footer(); ?>