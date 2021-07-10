<?php
require_once('posts.php');

add_action( 'widgets_init', function() {
    return register_widget( "Posts_Widget" );
} );