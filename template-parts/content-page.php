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
<div class="<?php $naTheme->classes('content', 'entry-content'); ?>  <?php echo $naTheme->get_template_layout(get_the_ID(), 'container'); ?>">
    <?php $naTheme->get_template_layout_before(get_the_ID()); ?>
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
    <?php $naTheme->get_template_layout_after(get_the_ID()); ?>
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