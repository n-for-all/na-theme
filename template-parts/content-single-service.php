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
        if ($featured_image):
        ?>
            <figure class="entry-image">
                <img src="<?php echo $featured_image; ?>" />
            </figure>
        <?php endif; ?>

    </header>

    <div class="<?php $naTheme->classes('content', 'entry-content'); ?>">
        <?php $naTheme->get_template_layout_before(get_the_ID(), 'container'); ?>
        <?php the_title('<h1 class="text-3xl font-medium">', '</h1>'); ?>
        <div class="flex flex-col-reverse lg:flex-row">
            <div class="w-full lg:w-3/4">
                <div class="entry-inner-content">
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
            <div class="w-full lg:w-1/4">
                <?php get_sidebar('service'); ?>
            </div>
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
        '</span></footer>'
    );
    ?>

</article><!-- #post-## -->