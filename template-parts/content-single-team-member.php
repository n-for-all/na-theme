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
<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <div class="<?php $naTheme->classes('content', 'entry-content'); ?>">
        <?php echo $naTheme->get_template_layout_before(get_the_ID(), 'container'); ?>
        <div class="flex">
            <div class="w-full lg:w-1/4">
                <?php
                if ($featured_image) :
                ?>
                    <figure class="entry-image">
                        <img src="<?php echo $featured_image; ?>" />
                    </figure>
                <?php endif; ?>
            </div>
            <div class="flex flex-col w-full lg:w-3/4 justify-content-center">
                <div class="entry-header"><?php the_title('<h1 class="entry-title">', '</h1>'); ?></div>

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
        </div>
        <?php echo $naTheme->get_template_layout_after(get_the_ID(), 'container'); ?>
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

</div><!-- #post-## -->