<?php
/**
 * The sidebar containing the main widget area
 *
 * @package WordPress
 */
?><div class="row"><?php
if ( is_active_sidebar( 'shop' )  ) : ?>
	<div class="sidebar-shop col-md-3 col-sm-3 col-xs-12">
		<?php if ( is_active_sidebar( 'shop' ) ) : ?>
			<div id="widget-area" class="widget-area" role="complementary">
				<?php dynamic_sidebar( 'shop' ); ?>
			</div><!-- .widget-area -->
		<?php endif; ?>
	</div><!-- .secondary -->
<?php endif; ?>
