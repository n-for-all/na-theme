<?php
require_once('posts.php');

add_action( 'widgets_init', create_function( '', 'return register_widget( "Posts_Widget" );' ) );