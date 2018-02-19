<?php
class Na_Switcher
{
    private $switcher_navs = [];
    function __construct(){
        add_shortcode( 'na_switch',  array(&$this, 'shortcode_switch') );
        add_shortcode( 'na_switcher',  array(&$this, 'shortcode_switcher') );
        add_filter( 'pre_do_shortcode_tag',  array(&$this, 'pre_shortcode'), 10, 4 );
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
    }
    public function pre_shortcode($_, $tag, $attr, $m){
        if($tag == 'na_switcher'){
            $this->switcher_navs = [];
        }
        if($tag == 'na_switch'){
            $this->switcher_navs[] = $attr;
        }
        return false;
    }
    public function shortcode_switch($atts, $content){
        $atts = shortcode_atts( array(
            'label' => "",
            'active' => "",
        ), $atts );
        $output = sprintf('<div title="%s" class="switch %s">%s</div>', $atts['label'], $atts['active'] == 1 ? 'active' : '', $content);
        return  $output;
    }

    public function shortcode_switcher($atts, $content){
        global $switcher_index;
        $this->switcher_navs = [];
        $output = do_shortcode($content);
        $id = '#!switch/'.($switcher_index + 1).'/';
        $nav = '<div class="switcher-nav"><select>';
        foreach($this->switcher_navs as $key => $tabnav){
            $nav .= sprintf('<option %s value="%s">%s</option>', isset($tabnav['active']) && $tabnav['active'] == 1 ? 'selected': '', $id.($key + 1), $tabnav['label']);
        }
        $nav .= '</select></div>';

        $output = '<div id="switcher-'.($switcher_index + 1).'" class="switcher">'.$nav.'<div class="switcher-content">'.$output.'</div></div>';
        $switcher_index++;
        return $output;
    }

    public function scripts()
    {
        wp_enqueue_style('switcher-shortcode', get_template_directory_uri() . '/inc/switcher/css/styles.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('switcher-shortcode', get_template_directory_uri() . '/inc/switcher/js/scripts.js', array('jquery'));
    }
}
new Na_Switcher();
?>
