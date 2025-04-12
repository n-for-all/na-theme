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
    <meta name="description" content="<?php echo is_single() ? get_the_excerpt() : get_bloginfo('description'); ?>" />
    <title><?php wp_title(); ?></title>
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
    <header class="z-50 bg-white shadow-xl top-0 fixed w-full <?php echo $naTheme->navbar; ?> <?php echo $naTheme->menu_dark == 1 ? 'dark' : ''; ?>" role="banner">
        <?php do_action('na-theme.nav.top'); ?>
        <?php if (trim($naTheme->top_bar) != '' || has_nav_menu('social')) : ?>
            <?php
            $has_social_menu = false;
            $main_columns = 4;
            if (has_nav_menu('social')) {
                $has_social_menu = true;
                $main_columns = 3;
            }
            ?>
            <div id="top-bar">
                <div class="px-4 mx-auto 2xl:container sm:px-6 lg:px-8">
                    <div class="w-full lg:w-<?php echo $main_columns ?>/4">
                        <?php echo do_shortcode($naTheme->top_bar); ?>
                    </div>
                    <?php if ($has_social_menu) : ?>
                        <div class="w-full lg:w-1/4">
                            <nav id="social-navigation" class="social-navigation md:flex md:justify-end" role="navigation">
                                <?php
                                // Social links navigation menu.
                                wp_nav_menu(array(
                                    'theme_location' => 'social',
                                    'depth'          => 1,
                                    'link_before'    => '',
                                    'link_after'     => '',
                                ));
                                ?>
                            </nav>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
        <div class="px-4 mx-auto 2xl:container sm:px-6 lg:px-8">
            <nav class="navbar navbar-light navbar-expand-lg navbar-default lg:relative <?php echo $naTheme->menu_expanded == 1 ? 'in' : ''; ?> col-12 flex" x-data="{open:false}">
                <?php include(get_template_directory() . '/inc/menu/logo.php'); ?>
                <button type="button" class="navbar-toggler -mr-4 ml-auto shadow-none md:hidden <?php echo $naTheme->menu_expanded == 1 ? 'collapsed' : ''; ?> <?php echo !empty($naTheme->btn_menu_style) ? $naTheme->btn_menu_style : 'toggle-style-1';  ?>" :aria-expanded="open" @click.prevent="open=!open">
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
    </header>
    <div id="wrapper" class="hfeed site">