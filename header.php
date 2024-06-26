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


global $naTheme;

$body_class = [];

$body_class[] = $naTheme->loading_logo ? 'loading' : '';
?>
<!DOCTYPE html>
<!--[if IE]><html <?php language_attributes(); ?> class="no-js ie"><![endif]-->
<![if !IE]>
<html <?php language_attributes(); ?> class="no-js">
<![endif]>

<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="description" content="<?php if (is_single()) {
                                            single_post_title('', true);
                                        } else {
                                            bloginfo('name');
                                            echo " - ";
                                            bloginfo('description');
                                        }
                                        ?>" />
    <title><?php bloginfo('name'); ?><?php wp_title(); ?></title>
    <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
    <link rel="icon" type="image/png" href="<?php echo $naTheme->favicon; ?>" />
    <!--[if lt IE 9]>
    	<script src="<?php echo esc_url(get_template_directory_uri()); ?>/js/html5.js"></script>
    	<![endif]-->
    <?php wp_head(); ?>
</head>

<body <?php body_class(implode(' ', $body_class)); ?>>
    <?php if ($naTheme->loading_logo) :
    ?>
        <span class="loading-overlay" style="background-image:url(<?php echo \add_query_arg('_', uniqid(), $naTheme->loading_logo); ?>)"></span>
    <?php endif; ?>
    <header id="masthead" class="site-header z-50 <?php echo $naTheme->navbar; ?> bg-white <?php echo $naTheme->menu_dark == 1 ? 'dark' : ''; ?>" role="banner">
        <?php do_action('na-theme.nav.top'); ?>
        <!-- Start navbar -->
        <?php if (trim($naTheme->top_bar) != '' || has_nav_menu('social')) : ?>
            <?php
            $has_social_menu = false;
            $main_columns = 12;
            if (has_nav_menu('social')) {
                $has_social_menu = true;
                $main_columns = 8;
            }
            ?>
            <div id="top-bar">
                <div class="container">
                    <div class="row">
                        <div class="col-md-<?php echo $main_columns ?> col-<?php echo $has_social_menu ? 6 : 12 ?>">
                            <?php echo do_shortcode($naTheme->top_bar); ?>
                        </div>
                        <?php if ($has_social_menu) : ?>
                            <div class="col-md-4 col-6">
                                <nav id="social-navigation" class="social-navigation" role="navigation">
                                    <label><?php _e("Follow Us:"); ?></label>
                                    <?php
                                    // Social links navigation menu.
                                    wp_nav_menu(array(
                                        'theme_location' => 'social',
                                        'depth'          => 1,
                                        'link_before'    => '<span class="screen-reader-text">',
                                        'link_after'     => '</span>',
                                    ));
                                    ?>
                                </nav>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        <div class="container">
            <div class="row">
                <nav class="navbar navbar-light navbar-expand-lg navbar-default relative <?php echo $naTheme->menu_expanded == 1 ? 'in' : ''; ?> col-12 flex" x-data="{open:false}">
                    <?php include(get_template_directory() . '/inc/menu/logo.php'); ?>
                    <button type="button" class="navbar-toggler absolute right-3 top-5 md:hidden <?php echo $naTheme->menu_expanded == 1 ? 'collapsed' : ''; ?> <?php echo !empty($naTheme->btn_menu_style) ? $naTheme->btn_menu_style : 'toggle-style-1';  ?>" @click.prevent="open=!open">
                        <span class="icon-bar navbar-toggler-icon"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="sr-only">Menu</span>
                    </button>
                    <?php do_action('na-theme.navbar.header'); ?>

                    <?php include(get_template_directory() . '/inc/menu/header.php'); ?>

                </nav>
            </div>
        </div>
        <!-- End navbar -->
    </header>
    <!-- .site-header -->
    <div id="wrapper" class="hfeed site">