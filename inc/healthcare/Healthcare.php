<?php

namespace NaTheme\Inc\Healthcare;

class Healthcare
{
    public function __construct()
    {
        $this->departments = new Department();
        $this->doctors = new Doctor();
        $this->divisions = new Division();
        $this->symptomchecker = new Symptomchecker();

        add_action('wp_enqueue_scripts', array(&$this, 'scripts'));
    }

    public function scripts()
    {
        wp_enqueue_script('na-healthcare-divisions', get_template_directory_uri() . '/inc/healthcare/js/scripts.js', array(), '1.0.0', true);
        if($this->symptomchecker){
            wp_enqueue_script('na-healthcare-symptomchecker', get_template_directory_uri() . '/inc/healthcare/js/symptomchecker.js', array(), '1.0.0', true);
        }
        
        wp_enqueue_style('na-healthcare-divisions', get_template_directory_uri() . '/inc/healthcare/css/styles.css', array('na_theme-main'), '1.0');
    }
}
?>