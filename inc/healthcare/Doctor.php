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
        $this->metabox = new DoctorMetabox(array('doctor'), 'Doctors');

        $image = new DoctorImage("doctor-icon", "Icon", "icon", "doctors", 2);
        $image->set_metabox($this->metabox);

        add_action('init', array(&$this, 'init'));
        add_shortcode('doctors', array(&$this, 'render'));
        add_shortcode('doctors-listing', array(&$this, 'renderListing'));
        add_shortcode('doctors-carousel', array(&$this, 'renderCarousel'));

        add_filter('manage_doctor_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_doctor_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        add_filter('autocomplete', array(&$this, 'autocomplete'), 10, 1);

        add_action('the_post', array(&$this, 'post_object'));
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
            'has_archive' => 'doctors',
            'rewrite'            => array('slug' => 'doctor'),
            'capability_type'    => 'post',
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
            $post_object->languages = $this->metabox->get_languages($post_object->ID);
            $post_object->services = $this->metabox->get_services($post_object->ID);
            $post_object->experience = $this->metabox->get_experience($post_object->ID);
            $post_object->education = $this->metabox->get_education($post_object->ID);
            $post_object->division = $this->metabox->get_division($post_object->ID);
            // $post_object->type = $this->metabox->get_type($post_object->ID);
        }
    }
    public function autocomplete(&$values)
    {
        $search = $_GET['q'];

        $main_args = array(
            'post_type' => 'doctor',
            'post_status' => 'publish',
            'posts_per_page' => 20
        );
        $args = $main_args;
        $args['s'] = $search;

        $query = new \WP_Query($args);
        if ($search != '') {
            $meta_args = $main_args;
            $meta_args['meta_query'] = array(
                'relation' => 'OR',
                array(
                    'key' => '_meta_na_doctor',
                    'value' => $search,
                    'compare' => 'LIKE'
                )
            );
            if (isset($args['tax_query'])) {
                $meta_args['tax_query'] = $args['tax_query'];
            }
            $meta_query = new \WP_Query($meta_args);
            $query->posts = array_unique(array_merge($query->posts, $meta_query->posts), SORT_REGULAR);
            $query->post_count = count($query->posts);
        }

        $json = [];
        global $post;
        if ($query->have_posts()) :
            $json[] = ['label' => 'Doctors', 'type' => 'title'];
            while ($query->have_posts()) : $query->the_post();
                $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'thumbnail');
                $json[] = ['label' => get_the_title(), 'image' => $image[0], 'description' => $post->position, 'url' => get_permalink()];
            endwhile;
        endif;

        return array_merge($values, $json);
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
            'limit' => -1,
            'division' => '',
            'orderby' => 'menu_order',
            'order' => 'ASC',
            'exclude' => null,
        ), $atts);

        $args = array(
            'post_type' => 'doctor',
            'posts_per_page' => $atts['limit'],
            'orderby' => $atts['orderby'],
            'order' => $atts['order'],
            'suppress_filters' => false
        );

        if ($atts['division'] != '') {
            $args['meta_key'] = '_meta_na_division';
            $args['meta_value'] = explode(',', $atts['division']);
        }

        if (!empty($atts['exclude'])) {
            $args['post__not_in'] = explode(',', $atts['exclude']);
        }

        $doctors = get_posts(
            $args
        );

        if (count($doctors) > 0) {
            ob_start();
?>
            <div class="doctors-list">
                <ul>
                    <?php
                    global $post;
                    foreach ($doctors as $post) :
                        setup_postdata($post);

                        $image = $this->metabox->get_image($post->ID);
                        $position = $this->metabox->get_position($post->ID); ?>
                        <li>
                            <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="image"></a>
                            <div class="content">
                                <a href="<?php the_permalink(); ?>" class="title"><?php the_title(); ?></a>
                                <div class="position"><?php echo $position; ?></div>
                                <div class="text"><?php the_excerpt(); ?></div>
                            </div>
                        </li>
                    <?php
                    endforeach;
                    wp_reset_postdata();
                    ?>
                </ul>
            </div>
        <?php
            return ob_get_clean();
        }
        return null;
    }

    public function renderListing($atts)
    {
        $atts = shortcode_atts(array(
            'limit' => -1,
            'division' => '',
            'orderby' => 'post_title',
            'order' => 'ASC',
            'exclude' => null,
        ), $atts);

        $order = $atts['order'] ?? 'ASC';
        $sort = $_GET['sort'] ?? 'a-z';
        if ($sort == 'z-a') {
            $order = 'DESC';
        }
        $args = array(
            'post_type' => 'doctor',
            'posts_per_page' => $atts['limit'],
            'orderby' => $atts['orderby'],
            'order' => $order,
            'suppress_filters' => false
        );

        $filter = $_GET['filter'] ?? [];
        $filter_division = $filter['division'] ?? $atts['division'] ?? '';

        if ($filter_division != '') {
            $args['meta_key'] = '_meta_na_division';
            $args['meta_value'] = explode(',', $filter_division);
        }

        if (!empty($atts['exclude'])) {
            $args['post__not_in'] = explode(',', $atts['exclude']);
        }

        $doctors = get_posts(
            $args
        );


        ob_start();
        // $divisions = $this->getDivisions();

        include_once(get_template_directory() . '/inc/healthcare/templates/parts/department-filters.php');
        include_once(get_template_directory() . '/inc/healthcare/templates/parts/doctors-filters.php');
        ?>

        <div class="doctors-list doctors-listing">
            <?php if (count($doctors) > 0) { ?>
                <ul>
                    <?php
                    global $post;
                    foreach ($doctors as $post) :
                        setup_postdata($post);
                        $image = $this->metabox->get_image($post->ID);
                        $position = $this->metabox->get_position($post->ID); ?>
                        <li>
                            <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="image"></a>
                            <div class="content">
                                <a href="<?php the_permalink(); ?>" class="title"><?php the_title(); ?></a>
                                <div class="position"><?php echo $position; ?></div>
                                <div class="text"><?php the_excerpt(); ?></div>
                            </div>
                        </li>
                    <?php
                    endforeach;
                    wp_reset_postdata();
                    ?>
                </ul>
            <?php } else {
            ?>
                <div class="alert alert-info"><?php _e('There are no doctors found', 'na-theme'); ?></div>
            <?php
            } ?>
        </div>
    <?php
        return ob_get_clean();
    }


    public function renderCarousel($atts)
    {
        $atts = shortcode_atts(array(
            'container' => 'container',
            'height' => 'auto',
            'type' => '',
            'max' => false,
            'limit' => -1,
            'vertical' => 0,
            'autoplay' => 0,
            'thumbnails' => 0,
            'bullets' => 1,
            'min-width' => 0,
            'columns' => 3
        ), $atts);

        $doctors = get_posts(
            array(
                'post_type' => 'doctor',
                'posts_per_page' => $atts['limit'],
                'orderby' => $atts['orderby'] ?? 'date',
                'order' => $atts['order'] ?? 'DESC',
                'suppress_filters' => false
            )
        );
        $settings = array();
        $_doctors = array();
        if (count($doctors) > 0) {
            $settings = array(
                'class' => 'na-doctors-carousel ' . ($atts['class'] ?? ''),
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
            global $post;
            foreach ($doctors as $post) :
                setup_postdata($post);
                $image = '';
                $image = $this->metabox->get_image($post->ID);

                $content = sprintf('<h3 class="mt-3 text-xl font-medium text-center title doctor-title">%s</h3>
                <div class="pb-3 text-center doctor-position">%s</div>', get_the_title(), $this->metabox->get_position($post->ID));
                $_doctors[] = array('content' => sprintf('<a href="%s" style="%s" class="bg-center bg-no-repeat bg-contain image-aspect-full doctor-image"></a>%s', get_permalink(), $image ? "background-image:url('{$image[0]}')" : '', $content), 'post' => $post);
            endforeach;
            wp_reset_postdata();
        }
        global $slider;
        return $slider->addSlider($_doctors, $settings);
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

    public static function getDivisions()
    {
        $args = array(
            'post_type' => 'division',
            'posts_per_page' => -1,
            'suppress_filters' => false
        );

        $divisions = get_posts(
            $args
        );

        return $divisions;
    }

    public static function getDepartments()
    {
        $args = array(
            'post_type' => 'department',
            'posts_per_page' => -1,
            'suppress_filters' => false
        );

        $divisions = get_posts(
            $args
        );

        return $divisions;
    }
}
class DoctorMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
        $posts = get_posts([
            'post_type' => 'division',
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ]);

        $posts = array_reduce($posts, function ($result, $item) {
            $result[$item->ID] = $item->post_title;
            return $result;
        }, array('' => 'Select a division'));
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
                    <th scope="row"><label for="name">Languages</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'languages', 'doctor'); ?>
                        <p class="description">Speaking languages.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Division</label></th>
                    <td><?php $this->_metabox_select($post->ID, $posts, 'division', ''); ?>
                        <p class="description">Select Division.</p>
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
                        <div style="display: flex">
                            <?php $this->_metabox_text($post->ID, 'title', 'doctor', ['placeholder' => 'Title', 'style' => "margin-right:1em"]); ?>

                            <?php $this->_metabox_textarea($post->ID, 'description', 'doctor', ['placeholder' => 'Description']); ?>
                        </div>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }

    public function get_languages($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'languages', 'doctor');
        return $p;
    }

    public function get_position($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'position', 'doctor');
        return $p;
    }
    public function get_division($post_id)
    {
        $p = $this->_metabox_text_value($post_id, 'division', '');
        return $p;
    }
    public function get_image($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'image', 'doctor', 'full');
        if (!$p && has_post_thumbnail($post_id)) {
            $p = wp_get_attachment_image_src(get_post_thumbnail_id($post_id), 'full');
        }
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