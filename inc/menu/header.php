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
			'menu_class'     => 'nav nav-menu navbar-nav nav-primary',
			'theme_location' => 'primary',
			'container'			=> ''
		) );
	if ( has_nav_menu( 'primary-right' ) ) :
			// Primary navigation menu.
			wp_nav_menu( array(
				'menu_class'     => 'nav nav-menu navbar-nav navbar-right nav-primary-right',
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
			'menu_class'     => 'nav nav-menu navbar-nav navbar-right nav-primary-right',
			'theme_location' => 'primary-right',
			'container'			=> ''
		) );
	?>
	</div>
	<?php do_action('na-theme.nav.primary-right.after'); ?>
</div>
<?php endif; ?>

<?php if ( has_nav_menu( 'social' ) ) : ?>
	<nav id="social-navigation" class="social-navigation" role="navigation">
		<?php
			// Social links navigation menu.
			wp_nav_menu( array(
				'theme_location' => 'social',
				'depth'          => 1,
				'link_before'    => '<span class="screen-reader-text">',
				'link_after'     => '</span>',
			) );
		?>
	</nav><!-- .social-navigation -->
<?php endif; ?>
