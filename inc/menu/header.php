<?php
/**
 * Main menu
 */
?>
<?php if ( has_nav_menu( 'primary' ) ) : ?>
<!-- Start nav-collapse -->
<div class="collapse navbar-collapse" id="main-navbar-collapse">
	<div class="collapse-inner">
	<?php
		// Primary navigation menu.
		wp_nav_menu( array(
			'menu_class'     => 'nav nav-menu nav-primary',
			'theme_location' => 'primary',
			'container'			=> ''
		) );
	if ( has_nav_menu( 'primary-right' ) ) :
			// Primary navigation menu.
			wp_nav_menu( array(
				'menu_class'     => 'nav nav-menu navbar-right nav-primary-right',
				'theme_location' => 'primary-right',
				'container'			=> ''
			) );
	 endif; ?>

	</div>
	 <?php do_action('na-theme.nav.primary.after'); ?>
</div>
<?php elseif ( has_nav_menu( 'primary-right' ) ) : ?>
<!-- Start nav-collapse -->
<div class="collapse navbar-collapse" id="main-navbar-collapse">
	<div class="collapse-inner">
	<?php
		// Primary navigation menu.
		wp_nav_menu( array(
			'menu_class'     => 'nav nav-menu navbar-right nav-primary-right',
			'theme_location' => 'primary-right',
			'container'			=> ''
		) );
	?>
	</div>
	<?php do_action('na-theme.nav.primary-right.after'); ?>
</div>
<?php endif; ?>
