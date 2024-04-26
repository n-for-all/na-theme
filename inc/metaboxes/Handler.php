<?php

namespace NaTheme\Inc\Metaboxes;

class Handler
{
    private $sections = [];
    private $metaboxes = [];

    public function __construct()
    {
        add_action('admin_enqueue_scripts', array(&$this, 'admin_enqueue_scripts'));
    }

    public function admin_enqueue_scripts()
    {
        if (!empty(GutenbergMetabox::$instances)) {
            foreach (GutenbergMetabox::$instances as $instance) {
                $this->sections = array_merge($this->sections, $instance->get_sections());
                $this->metaboxes = array_merge($this->metaboxes, $instance->get_metaboxes());
            }
            wp_enqueue_media();

            wp_enqueue_script('na-metabox-js-scripts', get_template_directory_uri() . '/inc/metaboxes/js/app.js', array('editor', 'wp-plugins', 'wp-components', 'wp-edit-post'), '1.0.0', true);
            wp_localize_script(
                'na-metabox-js-scripts',
                'naThemeMetaboxes',
                ['sections' => $this->sections, 'metaboxes' => $this->metaboxes]
            );

            wp_register_style('na-metabox', get_template_directory_uri() . '/inc/metaboxes/css/styles.css', array(), '1.0', 'all');
            wp_enqueue_style('na-metabox');
        }
    }
}
