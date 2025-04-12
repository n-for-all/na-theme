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
?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>

	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="HandheldFriendly" content="True">
	<meta name="MobileOptimized" content="320">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="cleartype" content="on">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<link href="<?php echo esc_url( get_template_directory_uri() ); ?>/img/favicon.png" rel="shortcut icon">
	<!--[if lt IE 9]>
	<script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/html5.js"></script>
	<![endif]-->
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
		<!-- Start preloading -->
	<div id="loading" class="loading-invisible">
		<div class="loading-center">
			<div class="loading-center-absolute">
				<img src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/logo-3.png" />
			</div>
		</div>
        <div class="loading-lines">
            <div>
                <img class="line-1" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/lines/line-1.png" />
                <img class="line-2" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/lines/line-2.png" />
                <img class="line-3" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/lines/line-3.png" />
                <img class="line-4" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/lines/line-4.png" />
            </div>
        </div>
	</div>
	<script type="text/javascript">
		  document.getElementById("loading").className = "loading-visible";
		  var hideDiv = function(){document.getElementById("loading").className = "loading-invisible";};
		  var oldLoad = window.onload;
		  var newLoad = oldLoad ? function(){hideDiv.call(this);oldLoad.call(this);} : hideDiv;
		  //window.onload = newLoad; 
	</script>
	<!-- Start featured -->
	<div id="featured">
    <!-- Jssor Slider Begin -->
    <!-- To move inline styles to css file/block, please specify a class name for each element. --> 
    <div id="slider2_container" class="slider2_container">
        <!-- Slides Container -->
        <div data-jssor="slides" class="slides" style="background-image:url(<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/1.jpg)">
            <div>
                <img data-jssor="image" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/1.jpg" alt="" />
            </div>
        </div>
			
        <div data-jssor="slides" class="slides" style="background-image:url(<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/2.jpg)">
            <div>
                <img data-jssor="image" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/2.jpg" alt="" />
            </div>
        </div>
        <div data-jssor="slides" class="slides" style="background-image:url(<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/3.jpg)">
            <div>
                <img data-jssor="image" src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/slider/3.jpg" alt="" />
            </div>
        </div>
    </div>
    <!-- Jssor Slider End -->
	</div>
	<!-- End featured -->
	<div id="wrapper" class="hfeed site">
    <header id="masthead" class="site-header" role="banner">
        <!-- Start navbar -->
        <nav class="navbar navbar-default">
          <div class="container">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar-collapse">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="#"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/img/logo-3.png" alt="" /></a>
            </div>
            <?php include('inc/menu_header.php'); ?>
            <!-- End navbar-header -->
          </div>
        </nav>
        <!-- End navbar -->
    </header>