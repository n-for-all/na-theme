<?php

/**
 * Class to allow wrapping of shortcodes via popup
 */

class Na_Popup
{
    private $popup_shortcodes = [];
    function __construct(){
        add_shortcode( 'na_popup',  array(&$this, 'shortcode_popup') );
        add_shortcode( 'popup',  array(&$this, 'shortcode_popup') );
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('wp_footer', array($this, 'footer'));
    }

    public function shortcode_popup($atts, $content){
        $atts = shortcode_atts( array(
            'title' => "",
            'name' => "",
            'width' => '500px'
        ), $atts );
        $output = do_shortcode($content);
        $id = '#!popup/'.sanitize_title($atts['name']).'/';
        $output = '<div style="width:'.$atts['width'].'" id="popup-'.sanitize_title($atts['name']).'" class="popup"><a class="close-popup" href="#">&times;</a><div class="popup-content">'.$output.'</div></div>';
        $this->popup_shortcodes[] = $output;
        return '';
    }

    public function footer(){
        foreach($this->popup_shortcodes as $shortcode){
            echo $shortcode;
        }
    }
    public function scripts()
    {
        wp_enqueue_style('popup-shortcode', get_template_directory_uri() . '/inc/popup/css/styles.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('popup-shortcode', get_template_directory_uri() . '/inc/popup/js/scripts.js', array('jquery'));
    }
}
new Na_Popup();
?>
