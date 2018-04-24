<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "site-content" div.
 *
 * @package WordPress
 * @subpackage Na_Theme
 * @since Na_theme 1.0
 */


global $theme;
?>
    <!DOCTYPE html>
    <!--[if IE]><html <?php language_attributes(); ?> class="no-js ie"><![endif]-->
    <![if !IE]>
    <html <?php language_attributes(); ?> class="no-js">
    <![endif]>

    <head>
        <meta charset="<?php bloginfo( 'charset' ); ?>" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="description" content="<?php if ( is_single() ) {
        single_post_title('', true);
    } else {
        bloginfo('name'); echo " - "; bloginfo('description');
    }
    ?>" />
        <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
        <link rel="icon" type="image/png" href="<?php echo $theme->favicon; ?>" />
        <!--[if lt IE 9]>
    	<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/html5.js"></script>
    	<![endif]-->
        <?php wp_head(); ?>
    </head>

    <body <?php body_class( $theme->loading_logo ? 'loading': ''); ?>>
        <?php if($theme->loading_logo):
            ?>
            <span class="loading-overlay" style="background-image:url(<?php echo $theme->loading_logo; ?>)"></span>
        <?php endif;?>
        <header id="masthead" class="site-header" role="banner">
            <!-- Start navbar -->
            <?php if(trim($theme->top_bar) != ''): ?>
                <div id="top-bar">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12 col-xs-12">
                                <?php echo $theme->top_bar; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                    <nav id="main-nav-collapse" class="navbar navbar-default <?php echo $theme->navbar; ?> <?php echo $theme->menu_expanded == 1 ? 'in' : ''; ?>">
                        <div class="container">
                            <div class="navbar-header">
                                <?php if($theme->menu != 'left-expand-logo.css') include('inc/menu/logo.php'); ?>
                                <button type="button" class="navbar-toggle <?php echo $theme->menu_expanded == 1 ? 'collapsed' : ''; ?> <?php echo $theme->btn_menu_style; ?>" data-toggle="collapse" data-target="#main-navbar-collapse">  <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span><span class="icon-bar"></span> <span class="sr-only">Menu</span></button>
                                <?php include('inc/menu/logo.php'); ?>
                            </div>
                            <?php include('inc/menu/header.php'); ?>
                            <!-- End navbar-header -->
                        </div>
                    </nav>
                    <!-- End navbar -->
        </header>
        <!-- .site-header -->
        <div id="wrapper" class="hfeed site">
