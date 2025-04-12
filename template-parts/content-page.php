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
<?php
if ($featured_image) :
?>
    <header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
        <figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
            <img src="<?php echo $featured_image; ?>" />
        </figure>
        <div class="px-4 mx-auto 2xl:container sm:px-6 lg:px-8">
            <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
        </div>
    </header>
<?php else: ?>
    <div class="px-4 mx-auto mt-4 2xl:container sm:px-6 lg:px-8 lg:mt-10">
        <?php the_title('<h1>', '</h1>'); ?>
    </div>
<?php endif; ?>

<?php $naTheme->get_template_layout_before(get_the_ID(), 'container'); ?>
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
<?php $naTheme->get_template_layout_after(get_the_ID(), 'container'); ?>


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