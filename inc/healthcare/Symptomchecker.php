<?php

namespace NaTheme\Inc\Healthcare;

class Symptomchecker
{
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_shortcode('symptomchecker', array(&$this, 'render'));
    }
    public function init()
    {
    }

    public function render($atts)
    {
        $atts = shortcode_atts(array(
        ), $atts);

        ob_start();

        include(dirname(__FILE__).'/templates/symptomchecker.php');
        return ob_get_clean();
    }
}

?>