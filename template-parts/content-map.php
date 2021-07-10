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

		<?php echo do_shortcode('[ajaxy-map id="410" height="500px"]'); ?>
		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
        <div id="map-box">

        </div>
	</header><!-- .entry-header -->
    <script id="map-box-template" type="text/template">
    <h2>{title}</h2>
    <div class="">{info}</div>
    </script>
	<div class="<?php $naTheme->classes('content', 'entry-content'); ?>">
		<div class="entry-inner-content">
			<?php
			the_content();

			wp_link_pages( array(
				'before'      => '<div class="page-links"><span class="page-links-title">' . __( 'Pages:', 'twentysixteen' ) . '</span>',
				'after'       => '</div>',
				'link_before' => '<span>',
				'link_after'  => '</span>',
				'pagelink'    => '<span class="screen-reader-text">' . __( 'Page', 'twentysixteen' ) . ' </span>%',
				'separator'   => '<span class="screen-reader-text">, </span>',
			) );
			?>
		</div>
	</div><!-- .entry-content -->

	<?php
		edit_post_link(
			sprintf(
				/* translators: %s: Name of current post */
				__( 'Edit<span class="screen-reader-text"> "%s"</span>', 'twentysixteen' ),
				get_the_title()
			),
			'<footer class="entry-footer"><span class="edit-link">',
			'</span></footer><!-- .entry-footer -->'
		);
	?>

</article><!-- #post-## -->
<script>

    function showMapBox(marker){
        var html = jQuery('#map-box-template').html();
        html = html.replace('{title}', marker.title);
        html = html.replace('{label}', marker.label);
        html = html.replace('{lat}', marker.lat);
        html = html.replace('{lng}', marker.lng);
        html = html.replace('{info}', marker.infowindow.content);
        jQuery('body').addClass('map-box-show');
        jQuery('#map-box').html(html);
    }
</script>
