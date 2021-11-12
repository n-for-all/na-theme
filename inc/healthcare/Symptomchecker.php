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
            'data' => ''
        ), $atts);

        ob_start();

        $json = base64_decode($atts['data']);
        include(dirname(__FILE__).'/templates/symptomchecker.php');
        return ob_get_clean();
    }
}

?>