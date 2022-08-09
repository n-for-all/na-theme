<?php

namespace NaTheme\Inc\Metaboxes;

abstract class GutenbergMetabox
{
    public $post_types = array('post', 'page');
    public $title = "";
    public $repeater = false;
    public $repeater_group = '';
    public $repeater_script = false;
    private $after_save = null;
    private $term_after_save = null;
    private $metaboxes = [];
    private $sections = [];

    /**
     * Hook into the appropriate actions when the class is constructed.
     */
    public function __construct($post_types, $title, $description = '')
    {
        $this->post_types = (array)$post_types;
        $this->title = $title;

        $this->register_section('main', $title, $description);
        add_action('add_meta_boxes', array(&$this, 'add_meta_box'));
        add_action('init', array(&$this, 'init'));
        add_action('admin_enqueue_scripts', array(&$this, 'admin_enqueue_scripts'));
        add_action('rest_api_init', array(&$this, 'rest_init'));
    }

    function isAssociative(array $arr)
    {
        if (array() === $arr) {
            return false;
        }
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    public function rest_init()
    {
        register_rest_field(
            $this->post_types,
            'nameta',
            array(
                'get_callback'    => function ($object) {
                    $post_id = $object['id'];

                    //return the post meta
                    return get_post_meta($post_id, '_meta', true);
                },
                'update_callback' => function ($value, $post) {
                    if (is_array($value) && $this->isAssociative($value)) {
                        foreach ($value as $key => $v) {
                            update_post_meta($post->ID, '_meta_' . $key, $v);
                        }
                    }
                    return update_post_meta($post->ID, '_meta', $value);
                },
                'schema'          => null,
            )
        );
    }
    public function init()
    {
        register_meta('post', '_meta', array(
            'type'        => 'object',
            'single'    => true,
            'show_in_rest'    => false,
            'auth_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
    }
    public function add_term_metabox($taxonomy)
    {
        add_action($taxonomy . '_add_form_fields', array(&$this, 'on_term_add'), 10, 2);
        add_action($taxonomy . '_edit_form_fields', array(&$this, 'on_term_update'), 10, 2);
        add_action('created_' . $taxonomy, array(&$this, 'on_term_save'), 10, 2);
        add_action('edited_' . $taxonomy, array(&$this, 'on_term_save'), 10, 2);
    }
    public function on_term_add($taxonomy)
    {
    }
    public function on_term_update($term, $taxonomy)
    {
    }
    public function on_term_save($term_id, $term_taxonomy_id)
    {
        $_meta = isset($_POST['_meta']) ? $_POST['_meta'] : null;
        if (is_array($_meta) && sizeof($_meta) > 0) {
            foreach ($_meta as $key => $value) {
                update_term_meta($term_id, '_meta_' . $key, $value);
            }
        }
        $_meta_na = isset($_POST['_meta_na']) ? $_POST['_meta_na'] : null;
        if (is_array($_meta_na) && sizeof($_meta_na) > 0) {
            foreach ($_meta_na as $key => $value) {
                update_term_meta($term_id, '_meta_na_' . $key, $value);
            }
        }

        if ($this->term_after_save) {
            call_user_func($this->term_after_save, $term_id, $_meta, $_meta_na);
        }
    }

    public function admin_enqueue_scripts()
    {
        wp_enqueue_media();

        wp_enqueue_script('na-metabox-js-scripts', get_template_directory_uri() . '/inc/metaboxes/js/app.js', array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-plugins', 'jquery'), '1.0.0', true);
        wp_localize_script(
            'na-metabox-js-scripts',
            'naThemeMetaboxes',
            ['sections' => $this->sections, 'metaboxes' => $this->metaboxes]
        );

        wp_register_style('na-metabox', get_template_directory_uri() . '/inc/metaboxes/css/styles.css', array(), '1.0', 'all');
        wp_enqueue_style('na-metabox');
    }
    /**
     * Adds the meta box container. 
     */
    public function add_meta_box($post_type)
    {
        if (in_array($post_type, $this->post_types)) {
            $meta_box = array(
                'id' => 'page-settings',
                'page' => $post_type
            );
            add_meta_box(
                $meta_box['id'],
                $this->title,
                null,
                $meta_box['page'],
                'advanced',
                'high',
                array(
                    '__back_compat_meta_box' => true,
                )
            );
            add_filter("postbox_classes_{$meta_box['page']}_{$meta_box['id']}", array(&$this, 'hook_meta_styles'), 1);
        }
    }

    public function register_section($name, $label, $description = '')
    {
        $this->sections[] = ['name' => $name, 'label' => $label];
    }

    private function check_section($name)
    {
        $return = array_filter($this->sections, function ($item) use ($name) {
            return $item['name'] == $name;
        });
        if (empty($return)) {
            throw new \Exception("Section $name doesn't exist, please register the section with 'register_section' function");
        }
    }
    public function register_text_box($name, $label, $section = 'main')
    {
        $this->check_section($section);
        if (!isset($this->metaboxes[$section])) {
            $this->metaboxes[$section] = [];
        }
        $this->metaboxes[$section][] = ['name' => $name, 'label' => $label, 'type' => 'text'];
    }

    public function register_select_box($name, $label, $options, $section = 'main')
    {
        $this->check_section($section);
        if (!isset($this->metaboxes[$section])) {
            $this->metaboxes[$section] = [];
        }
        $this->metaboxes[$section][] = ['name' => $name, 'label' => $label, 'type' => 'select', 'options' => array_map(function ($key) use ($options) {
            return ['label' => $options[$key], 'value' => $key];
        }, array_keys($options))];
    }

    function hook_meta_styles($classes)
    {
        $classes[] = 'na-metabox';
        return $classes;
    }

    function after_save($callback)
    {
        $this->after_save = $callback;
    }

    protected function get_meta($post_id, $name)
    {
        $meta_name = '';
        $meta_name = "_meta";
        if ($a = get_post_meta($post_id, $meta_name, true)) {
            return $a[$name] ?? '';
        }
        return "";
    }
    protected function get_term_meta($term_id, $taxonomy, $group = '')
    {
        $meta_name = '';
        $meta_name = "_meta_{$group}";
        if ($a = get_term_meta($term_id, $meta_name, true)) {
            return $a;
        }
        return "";
    }
    function get_meta_value($post_id, $name, $group = '')
    {
        $meta_name = '';
        if ($group != "") {
            $meta_name = "_meta_{$group}";
        } else {
            $meta_name = "_meta_na_{$name}";
        }
        if ($a = get_post_meta($post_id, $meta_name, true)) {
            if ($group != "") {
                $a = $a[$name];
            }
            return $a;
        }
        return "";
    }
}
/******************************
Example usage

class Section extends \NaTheme\Inc\Metaboxes\GutenbergMetabox
{
    public function __construct()
    {
        parent::__construct(['page'], 'Section');
        $this->register_text_box('section_class', 'Class');
    }
}

 ***********************************/
