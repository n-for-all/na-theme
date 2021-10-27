<?php

namespace NaTheme\Inc\Menu;

class Shortcode
{
    public function __construct()
    {
        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
    }
    public function shortcodes()
    {
        add_shortcode('menu', array($this, 'shortcode'));
    }

    public function shortcode($atts)
    {
        extract(shortcode_atts(array(  
            'name'            => '', 
            'container'       => 'div', 
            'container_class' => '', 
            'container_id'    => '', 
            'class'      => 'menu', 
            'id'         => '',
            'echo'            => true,
            'fallback_cb'     => 'wp_page_menu',
            'before'          => '',
            'after'           => '',
            'link_before'     => '',
            'link_after'      => '',
            'depth'           => 0,
            'walker'          => '',
            'theme_location'  => ''), 
            $atts));
     
     
        return wp_nav_menu( array( 
            'menu'            => $name, 
            'container'       => $container, 
            'container_class' => $container_class, 
            'container_id'    => $container_id, 
            'menu_class'      => $class, 
            'menu_id'         => $id,
            'echo'            => false, 
            'fallback_cb'     => $fallback_cb,
            'before'          => $before,
            'after'           => $after,
            'link_before'     => $link_before,
            'link_after'      => $link_after,
            'depth'           => $depth,
            'walker'          => $walker,
            'theme_location'  => $theme_location));
    }
}
