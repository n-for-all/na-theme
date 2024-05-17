<?php

/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */
global $naTheme, $post;
?>
<?php
/**
 * Featured Image
 */
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
        <?php
        if ($featured_image) :
        ?>
            <figure class="entry-image">
                <img src="<?php echo $featured_image; ?>" />
            </figure>
        <?php endif; ?>

    </header><!-- .entry-header -->

    <div class="<?php $naTheme->classes('content', 'entry-content'); ?> <?php echo $naTheme->get_template_layout(get_the_ID(), 'container'); ?>">
        <div class="row">
            <div class="col-md-3 col-xs-12">
                <div class="news-related-categories">
                    <?php
                    $categories = get_terms(array(
                        'taxonomy' => 'news',
                        'hide_empty' => false,
                    ));
                    ?>
                    <h3><?php _e('Related Categories', 'na-theme'); ?></h3>
                    <ul class="nav-side">
                        <?php foreach ($categories as $child) : ?>
                            <li><a href="<?php echo get_term_link($child->term_id); ?>"><?php echo $child->name; ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
            <div class="col-md-9 col-xs-12">
                <div class="entry-inner-content">
                    <?php the_title('<h1 class="text-3xl entry-title">', '</h1>'); ?>
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
    </div><!-- .entry-content -->

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

</article><!-- #post-## -->