<?php

namespace NaTheme\Inc\Healthcare;

class Healthcare
{
    public $departments;
    public $doctors;
    public $divisions;
    public $symptomchecker;
    
    public function __construct()
    {
        $this->departments = new Department();
        $this->doctors = new Doctor();
        $this->divisions = new Division();
        $this->symptomchecker = new Symptomchecker();

        add_action('wp_enqueue_scripts', array(&$this, 'scripts'));

        add_action('wp_ajax_doctors_autocomplete', array(&$this, 'autocomplete'));
        add_action('wp_ajax_nopriv_doctors_autocomplete', array(&$this, 'autocomplete'));
    }

    public function autocomplete(){
        $values = [];
        $values = apply_filters('autocomplete', $values);
        echo wp_json_encode(['status'=>'success', 'data' => $values]);
        wp_die();
    }
    public function scripts()
    {
        wp_enqueue_script('na-healthcare-divisions', get_template_directory_uri() . '/inc/healthcare/js/app.js', array(), '1.0.0', true);
        if($this->symptomchecker){
            wp_enqueue_script('na-healthcare-symptomchecker', get_template_directory_uri() . '/inc/healthcare/js/symptomchecker.js', array(), '1.0.0', true);
        }
        
        wp_enqueue_style('na-healthcare-divisions', get_template_directory_uri() . '/inc/healthcare/css/styles.css', array('na_theme-main'), '1.0');
    }
}
?>