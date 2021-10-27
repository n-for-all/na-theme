<?php

namespace NaTheme\Inc\Healthcare;

class Doctor
{
    /**
     * metabox
     *
     * @var DoctorMetabox
     */
    private $metabox = null;
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_shortcode('doctors', array(&$this, 'render'));

        add_filter('manage_doctor_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_doctor_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        add_action('the_post', array(&$this, 'post_object'));

        $this->metabox = new DoctorMetabox(array('doctor'), 'Doctors');

        $image = new DoctorImage("doctor-icon", "Icon", "icon", "doctors", 2);
        $image->set_metabox($this->metabox);
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Doctors', 'post type general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'      => _x('Doctor', 'post type singular name', NA_THEME_TEXT_DOMAIN),
            'menu_name'          => _x('Doctors', 'admin menu', NA_THEME_TEXT_DOMAIN),
            'name_admin_bar'     => _x('Doctor', 'add new on admin bar', NA_THEME_TEXT_DOMAIN),
            'add_new'            => _x('Add New', 'book', NA_THEME_TEXT_DOMAIN),
            'add_new_item'       => __('Add New Doctor', NA_THEME_TEXT_DOMAIN),
            'new_item'           => __('New Doctor', NA_THEME_TEXT_DOMAIN),
            'edit_item'          => __('Edit Doctor', NA_THEME_TEXT_DOMAIN),
            'view_item'          => __('View Doctor', NA_THEME_TEXT_DOMAIN),
            'all_items'          => __('Doctors', NA_THEME_TEXT_DOMAIN),
            'search_items'       => __('Search Doctors', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon'  => __('Parent Doctors:', NA_THEME_TEXT_DOMAIN),
            'not_found'          => __('No doctors found.', NA_THEME_TEXT_DOMAIN),
            'not_found_in_trash' => __('No doctors found in Trash.', NA_THEME_TEXT_DOMAIN)
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'doctor'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'page-attributes')
        );

        register_post_type('doctor', $args);
    }
    function post_object(&$post_object)
    {
        if ($post_object->post_type == 'doctor') {
            $post_object->image = $this->metabox->get_image($post_object->ID);
            $post_object->position = $this->metabox->get_position($post_object->ID);
            $post_object->services = $this->metabox->get_services($post_object->ID);
            $post_object->experience = $this->metabox->get_experience($post_object->ID);
            $post_object->education = $this->metabox->get_education($post_object->ID);
            $post_object->department = $this->metabox->get_department($post_object->ID);
        }
    }
    public function add_img_column($columns)
    {
        $columns['img'] = 'Image';
        return $columns;
    }
    public function manage_img_column($column_name, $post_id)
    {
        if ($column_name == 'img') {
            echo get_the_post_thumbnail($post_id, 'thumbnail');
        }
        return $column_name;
    }

    public function render($atts)
    {
        $atts = shortcode_atts(array(
            'id' => 0,
            'category' => 0,
            'container' => 'container',
            'height' => '100%',
            'type' => '',
            'max' => false,
            'vertical' => 0,
            'autoplay' => 0,
            'thumbnails' => 0,
            'bullets' => 0,
            'min-width' => 0,
            'columns' => 1
        ), $atts);
        if ($atts['id'] != 0) {
            $atts['category'] = $atts['id'];
        }
        $doctors = get_posts(
            array(
                'post_type' => 'doctor',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'suppress_filters' => false,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'doctors',
                        'field' => is_numeric($atts['category']) ? 'term_id' : 'slug',
                        'terms' => $atts['category']
                    )
                )
            )
        );
        $settings = array();
        $_doctors = array();
        if (count($doctors) > 0) {
            $settings = array(
                'autoplay' => $atts['autoplay'],
                'container' => $atts['container'],
                'bullets' => $atts['bullets'],
                'thumbnails' => $atts['thumbnails'],
                'columns' => $atts['columns'],
                'vertical' => $atts['vertical'],
                'minWidth' => $atts['min-width'] > 0 ? $atts['min-width'] : 200,
                'type' => $atts['type'],
                'height' => $atts['height']
            );
            if ($atts['type'] == 'mosaic') {
                for ($i = 0; $i < count($doctors); $i = $i + 2) :
                    $doctor1 = $doctors[$i];
                    $doctor2 = $doctors[$i + 1];
                    $image1 = '';
                    $image2 = '';
                    if (has_post_thumbnail($doctor1->ID)) {
                        $image1 = wp_get_attachment_image_src(get_post_thumbnail_id($doctor1->ID), "full")[0];
                    }
                    if (has_post_thumbnail($doctor2->ID)) {
                        $image2 = wp_get_attachment_image_src(get_post_thumbnail_id($doctor2->ID), "full")[0];
                    }
                    $_doctors[] = array('content' => '<div class="na-doctor-inner na-doctors-inner1" style="background:url(' . $image1 . ') no-repeat top center / cover;width:100%">
    						<div class="na-doctor-text">
    							' . apply_filters('the_content', $doctor1->post_content) . '
    						</div>
    					</div>
    					<div class="na-doctor-inner na-doctors-inner2" style="background:url(' . $image2 . ') no-repeat top center / cover;width:100%">
    						<div class="na-doctor-text">
    						     ' . apply_filters('the_content', $doctor2->post_content) . '
    						</div>
    					</div>', 'post' => [$doctor1, $doctor2]);
                endfor;
            } else {
                foreach ($doctors as $doctor) :
                    $image = '';
                    if (has_post_thumbnail($doctor->ID)) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id($doctor->ID), "full")[0];
                    }

                    $content = sprintf('<div class="na-doctor-text">%s</div>', apply_filters('the_content', $doctor->post_content));
                    $_doctors[] = array('content' => sprintf('<div style="background-image:url(%s)" class="na-doctor-inner">
                        %s
    				</div>', $image, $settings['container'] == 'container' ? sprintf('<div class="container"><div class="row"><div class="col-md-12">%s</div></div></div>', $content) : $content), 'post' => $doctor);
                    if ($atts['max'] && $atts['max'] < count($_doctors)) {
                        break;
                    }
                endforeach;
            }
        }
        return $this->addDoctor($_doctors, $settings);
    }
    public function addDoctor($doctors, $settings)
    {
        if (count($doctors) > 0) {
            $id = uniqid('doctors_');
            ob_start();
            if (isset($settings['thumbnails']) && $settings['thumbnails']) {
                $settings['sync'] = $id . '_thumbnails';
            }
            include('template/doctors.tpl.php');

            return ob_get_clean();
        }
    }
}
class DoctorMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
        $posts = get_posts([
            'post_type' => 'department',
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ]);

        $posts = array_reduce($posts, function ($result, $item) {
            $result[$item->ID] = $item->post_title;
            return $result;
        }, array('' => 'Select a department'));
?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Position</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'position', 'doctor'); ?>
                        <p class="description">Doctor Title/Position.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Department</label></th>
                    <td><?php $this->_metabox_select($post->ID, $posts, 'department', 'doctor'); ?>
                        <p class="description">Select department.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose listing image</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'doctor', false); ?>
                        <p class="description">Choose the doctor listing image.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Services</label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('services', 'doctor') ?>
                        <?php $this->_metabox_text($post->ID, 'title', 'doctor', ['placeholder' => 'Service']); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Experience</label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('experience', 'doctor') ?>
                        <?php $this->_metabox_text($post->ID, 'title', 'doctor', ['placeholder' => 'Title']); ?>
                        <hr />
                        <?php $this->_metabox_text($post->ID, 'description', 'doctor', ['placeholder' => 'Description']); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Education</label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('education', 'doctor') ?>
                        <?php $this->_metabox_text($post->ID, 'title', 'doctor', ['placeholder' => 'Title']); ?>
                        <hr />
                        <?php $this->_metabox_text($post->ID, 'description', 'doctor', ['placeholder' => 'Description']); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }

    public function get_position($post_id)
    {
        $p = $this->_metabox_repeater_value($post_id, 'position', 'doctor');
        return $p;
    }
    public function get_department($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'department', 'doctor');
        return $p;
    }
    public function get_image($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'image', 'doctor', 'full');
        return $p;
    }
    public function get_services($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'services', 'doctor');
        return $p;
    }
    public function get_experience($post_id)
    {
        $p = $this->_metabox_repeater_value($post_id, 'experience', 'doctor');
        return $p;
    }
    public function get_education($post_id)
    {
        $p = $this->_metabox_repeater_value($post_id, 'education', 'doctor');
        return $p;
    }
}


class DoctorImage extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;

    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }

    public function show_content($column, $post_id)
    {
        $images = $this->metabox->_metabox_image_value($post_id, 'icon', 'doctor');
        //print_r();
        foreach ($images as $image) {
        ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
<?php

        }
    }
}

?>