<?php
/**
 * Footer menu
 */
?>
<?php if ( has_nav_menu( 'footer' ) ) : ?>
<!-- Start nav-collapse -->
<div class="collapse navbar-collapse" id="main-navbar-collapse">
	<?php
		// Primary navigation menu.
		wp_nav_menu( array(
			'menu_class'     => 'list-link',
			'theme_location' => 'footer',
			'container'			=> ''
		) );
	?>
</div>
<?php endif; ?>


