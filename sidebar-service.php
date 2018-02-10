<?php
/**
 * The sidebar containing the main widget area
 *
 * @package WordPress
 */

if ( is_active_sidebar( 'sidebar-service' )  ) : ?>
	<div id="secondary" class="secondary secondary-service">
		<?php if ( is_active_sidebar( 'sidebar-service' ) ) : ?>
			<div id="widget-area" class="widget-area" role="complementary">
				<?php dynamic_sidebar( 'sidebar-service' ); ?>
			</div><!-- .widget-area -->
		<?php endif; ?>

	</div><!-- .secondary -->

<?php endif; ?>
