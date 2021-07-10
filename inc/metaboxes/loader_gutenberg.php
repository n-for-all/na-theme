<?php

include_once(dirname(__FILE__) . "/admin/post_columns.php");


abstract class NA_METABOXES
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
        add_action('save_post', array(&$this, 'save_data'));
        add_action('init', array(&$this, 'init'));
        add_action('admin_enqueue_scripts', array(&$this, 'admin_enqueue_scripts'));
        add_action('rest_api_init', array(&$this, 'rest_init'));
    }

    public function rest_init()
    {
        register_rest_field(
            'page',
            'nameta',
            array(
                'get_callback'    => function ($object) {
                    $post_id = $object['id'];

                    //return the post meta
                    return get_post_meta($post_id, '_meta', true);
                },
                'update_callback' => function ($value, $post) {
                    return update_post_meta($post->ID, '_meta', $value);
                },
                'schema'          => null,
            )
        );
        foreach ($this->post_types as $post_type) {
            register_rest_field(
                $post_type,
                'nameta',
                array(
                    'get_callback'    => function ($object) {
                        $post_id = $object['id'];

                        //return the post meta
                        return get_post_meta($post_id, '_meta');
                    },
                    'schema'          => null,
                )
            );
        }
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
        $this->metaboxes[$section][] = ['name' => $name, 'label' => $label, 'type' => 'text', 'options' => $options];
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

    function save_data($post_id)
    {
        // Check if our nonce is set.
        if (!isset($_POST['na_metabox_inner_custom_box_nonce']))
            return $post_id;

        $nonce = $_POST['na_metabox_inner_custom_box_nonce'];

        // Verify that the nonce is valid.
        if (!wp_verify_nonce($nonce, 'na_metabox_inner_custom_box'))
            return $post_id;

        // If this is an autosave, our form has not been submitted, so we don't want to do anything.
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
            return $post_id;

        // Check the user's permissions.
        if ('page' == $_POST['post_type']) {

            if (!current_user_can('edit_page', $post_id))
                return $post_id;
        } else {

            if (!current_user_can('edit_post', $post_id))
                return $post_id;
        }

        /* OK, its safe for us to save the data now. */

        // Sanitize user input.
        $_meta = isset($_POST['_meta']) ? $_POST['_meta'] : null;
        if (is_array($_meta) && sizeof($_meta) > 0) {
            // Update the meta field in the database.
            foreach ($_meta as $key => $value) {
                update_post_meta($post_id, '_meta_' . $key, $value);
            }
        }
        $_meta_na = isset($_POST['_meta_na']) ? $_POST['_meta_na'] : null;
        if (is_array($_meta_na) && sizeof($_meta_na) > 0) {
            // Update the meta field in the database.
            foreach ($_meta_na as $key => $value) {
                update_post_meta($post_id, '_meta_na_' . $key, $value);
            }
        }

        if ($this->after_save) {
            call_user_func($this->after_save, $post_id, $_meta, $_meta_na);
        }
    }

    // function create_nonce()
    // {
    //     wp_nonce_field('na_metabox_inner_custom_box', 'na_metabox_inner_custom_box_nonce');
    // }
    // function _inner_custom_box($post)
    // {
    //     $this->create_nonce();
    //     die();
    //     /*
    // 	* Use get_post_meta() to retrieve an existing value
    // 	* from the database and use the value for the form.
    // 	*/
    //     $this->show_metabox($post);
    // }

    protected function get_meta($post_id, $group = '')
    {
        $meta_name = '';
        $meta_name = "_meta_{$group}";
        if ($a = get_post_meta($post_id, $meta_name, true)) {
            return $a;
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

function show_metabox must be implemented in the child class

class CNA_METABOXES extends NA_METABOXES{
	function show_metabox($post){
		?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Choose images</label></th>
					<td><?php $this->_metabox_text($post->ID, 'test_txt', 'group'); ?>
					<p class="description">Choose your portfolio images, those images will appear in the portfolio page of your website.</p></td>
				</tr>
				<tr class="form-field term-slug-wrap">
					<th scope="row"><label for="slug">Slug</label></th>
					<td><?php $this->_metabox_image($post->ID, 'test_image', 'group'); ?>
					<p class="description">The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</p></td>
				</tr>
				<tr class="form-field term-parent-wrap">
					<th scope="row"><label for="parent">Parent</label></th>
					<td><?php $this->_metabox_select($post->ID, array('s', 's1', 's2', 's3'), 'test_select', 'group'); ?>
					<p class="description">The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</p>
					</td>
				</tr>
				<tr class="form-field term-description-wrap">
					<th scope="row"><label for="description">Description</label></th>
					<td><textarea name="description" id="description" rows="5" cols="50" class="large-text"></textarea>
					<p class="description">The description is not prominent by default; however, some themes may show it.</p></td>
				</tr>
			</tbody>
		</table>
		<?php
	}
}
new CNA_METABOXES(array('project', 'page'), 'test metabox');
 ***********************************/
