<?php

/**
 * Template Name: Page Sub Nav
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 */
get_header();

global $naTheme, $post;
?>
<?php
/**
 * Featured Image
 */
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
?>
<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
        <header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
            <?php
            if ($featured_image) :
            ?>
                <figure class="entry-image parallax-effect" style="background-image:url(<?php echo $featured_image; ?>)">
                    <img src="<?php echo $featured_image; ?>" />
                </figure>
            <?php endif; ?>
            <?php the_title('<h1 class="text-4xl font-medium">', '</h1>'); ?>
        </header>
        <div class="<?php $naTheme->classes('content', 'entry-content'); ?>">
            <?php $naTheme->get_template_layout_before(get_the_ID(), 'container'); ?>
            <div class="entry-inner-content">
                <?php
                // Start the loop.
                global $post;
                $is_parent = false;
                while (have_posts()) : the_post();
                    $parent = $post->post_parent;
                    if ($parent == 0) {
                        $parent = get_the_ID();
                        $is_parent = true;
                    } else {
                        $children = get_children([
                            'post_parent'    => get_the_ID(),
                            'post_type'   => 'page',
                            'post_status' => 'publish'
                        ]);
                        if ($children && count($children) > 0) {
                            $parent = get_the_ID();
                            $is_parent = true;
                        }
                    }
                    
                    $args = array(
                        'post_parent' => $parent,
                        'post_type'   => 'page',
                        'posts_per_page' => 10,
                        'numberposts' => -1,
                        'orderby' => 'menu_order',
                        'order' => 'asc',
                        'post_status' => 'publish'
                    );
                    $children_array = get_posts($args);
                    $col = 4;

                    $curent_id = get_the_ID();

                    if ($is_parent && count($children_array) > 0 && trim(get_the_content()) == '') {
                        setup_postdata($children_array[0]);
                        $curent_id = $children_array[0]->ID;
                    }
                ?>
                    <div class="flex">
                        <?php if (sizeof($children_array) > 0) :
                            $col = 3;
                        ?>
                            <div class="w-full lg:w-1/4">
                                <ul class="nav-side">
                                    <?php foreach ($children_array as $child) : ?>
                                        <li class="<?php echo $child->ID == $curent_id ? 'active' : ''; ?>"><a href="<?php echo get_permalink($child->ID); ?>"><?php echo $child->post_title; ?></a></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                        <div class="w-full lg:w-<?php echo $col; ?>/4">
                            <div <?php post_class(); ?>>
                                <?php
                                the_content();

                                wp_link_pages(array(
                                    'before'      => '<div class="page-links"><span class="page-links-title">' . __('Pages:', 'na-theme') . '</span>',
                                    'after'       => '</div>',
                                    'link_before' => '<span>',
                                    'link_after'  => '</span>',
                                    'pagelink'    => '<span class="screen-reader-text">' . __('Page', 'na-theme') . ' </span>%',
                                    'separator'   => '<span class="screen-reader-text">, </span>',
                                ));
                                ?>
                            </div>
                        </div>
                    </div>
                <?php
                endwhile;
                ?>
            </div>
            <?php $naTheme->get_template_layout_after(get_the_ID(), 'container'); ?>
        </div>

        <?php
        edit_post_link(
            sprintf(
                /* translators: %s: Name of current post */
                __('Edit<span class="screen-reader-text"> "%s"</span>', 'na-theme'),
                get_the_title()
            ),
            '<footer class="entry-footer"><span class="edit-link">',
            '</span></footer><!-- .entry-footer -->'
        );
        ?>




    </main><!-- .site-main -->
</div><!-- .content-area -->

<?php get_footer(); ?>