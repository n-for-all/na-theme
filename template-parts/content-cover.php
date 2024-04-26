<?php
/**
 * The template part for displaying content
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */
global $naTheme;
$featured_image = $naTheme->get_post_thumbnail(null, 'full');
?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="<?php $naTheme->classes('header', 'entry-header'); ?>">
		<?php
		if($featured_image):
		?>
		<figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
			<img src="<?php echo $featured_image; ?>" />
		</figure>
		<?php endif; ?>
		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
	</header><!-- .entry-header -->
	<footer class="entry-footer">
		<small>Posted on <?php the_time('l, F jS, Y') ?></small>
	</footer><!-- .entry-footer -->
	<div class="entry-content">
		<?php
            /* translators: %s: Name of current post */
            the_content(sprintf(
                __('Continue reading<span class="screen-reader-text"> "%s"</span>', 'na-theme'),
                get_the_title()
            ));

            wp_link_pages(array(
                'before'      => '<div class="page-links"><span class="page-links-title">' . __('Pages:', 'na-theme') . '</span>',
                'after'       => '</div>',
                'link_before' => '<span>',
                'link_after'  => '</span>',
                'pagelink'    => '<span class="screen-reader-text">' . __('Page', 'na-theme') . ' </span>%',
                'separator'   => '<span class="screen-reader-text">, </span>',
            ));
        ?>
	</div><!-- .entry-content -->


</article><!-- #post-## -->
