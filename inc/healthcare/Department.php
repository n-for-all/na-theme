<?php

namespace NaTheme\Inc\Healthcare;

class Department
{
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_shortcode('departments', array(&$this, 'render'));
        add_shortcode('departments-carousel', array(&$this, 'renderCarousel'));

        add_filter('manage_department_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_department_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        add_filter('autocomplete', array(&$this, 'autocomplete'), 11, 1);

        add_action('the_post', array(&$this, 'post_object'));
        $this->metabox = new DepartmentMetabox(array('department'), 'Departments');

        $image = new DepartmentImage("department-icon", "Icon", "icon", "departments", 2);
        $image->set_metabox($this->metabox);
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Departments', 'post type general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'      => _x('Department', 'post type singular name', NA_THEME_TEXT_DOMAIN),
            'menu_name'          => _x('Departments', 'admin menu', NA_THEME_TEXT_DOMAIN),
            'name_admin_bar'     => _x('Department', 'add new on admin bar', NA_THEME_TEXT_DOMAIN),
            'add_new'            => _x('Add New', 'book', NA_THEME_TEXT_DOMAIN),
            'add_new_item'       => __('Add New Department', NA_THEME_TEXT_DOMAIN),
            'new_item'           => __('New Department', NA_THEME_TEXT_DOMAIN),
            'edit_item'          => __('Edit Department', NA_THEME_TEXT_DOMAIN),
            'view_item'          => __('View Department', NA_THEME_TEXT_DOMAIN),
            'all_items'          => __('Departments', NA_THEME_TEXT_DOMAIN),
            'search_items'       => __('Search Departments', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon'  => __('Parent Departments:', NA_THEME_TEXT_DOMAIN),
            'not_found'          => __('No departments found.', NA_THEME_TEXT_DOMAIN),
            'not_found_in_trash' => __('No departments found in Trash.', NA_THEME_TEXT_DOMAIN)
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => 'edit.php?post_type=doctor',
            'query_var'          => true,
            'rewrite'            => array('slug' => 'department'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'page-attributes')
        );

        register_post_type('department', $args);
    }

    public function autocomplete(&$values)
    {
        $search = $_GET['q'];

        $main_args = array(
            'post_type' => 'department',
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
                    'key' => '_meta_department',
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
            $json[] = ['label' => 'Departments', 'type' => 'title'];
            while ($query->have_posts()) : $query->the_post();
                $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'thumbnail');
                $json[] = ['label' => get_the_title(), 'image' => $image[0], 'description' => $post->position, 'url' => get_permalink()];
            endwhile;
        endif;

        return array_merge($values, $json);
    }

    function post_object(&$post_object)
    {
        if ($post_object->post_type == 'department') {
            $post_object->image = $this->metabox->get_image($post_object->ID);
            $post_object->icon = $this->metabox->get_icon($post_object->ID);
            $clinical = $this->metabox->get_clinical($post_object->ID);
            if ($clinical) {
                foreach ($clinical as &$item) {
                    $nitem = explode(':', $item);
                    if (count($nitem) == 2) {
                        $subitems = explode("|", $nitem[1]);
                        $item = [$nitem[0] => $subitems];
                    }
                }
            }
            $post_object->clinical = $clinical;

            $procedural = $this->metabox->get_procedural($post_object->ID);
            if ($procedural) {
                foreach ($procedural as &$item) {
                    $nitem = explode(':', $item);
                    if (count($nitem) == 2) {
                        $subitems = explode("|", $nitem[1]);
                        $item = [$nitem[0] => $subitems];
                    }
                }
            }
            $post_object->procedural = $procedural;
            $post_object->doctors = function () use ($post_object) {
                $posts = get_posts([
                    'post_type' => 'doctor',
                    'post_status' => 'publish',
                    'meta_key' => '_meta_na_department',
                    'meta_value' => $post_object->ID,
                ]);
                return $posts;
            };
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
            'limit' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
            'division' => null,
            'exclude' => null,
        ), $atts);

        $args = array(
            'post_type' => 'department',
            'posts_per_page' => $atts['limit'],
            'orderby' => $atts['orderby'],
            'order' => $atts['order'],
            'suppress_filters' => false
        );

        if(!empty($atts['exclude'])){
            $args['post__not_in'] = explode(',', $atts['exclude']);
        }

        if ($atts['division'] != '') {
            $args['meta_key'] = '_meta_na_division';
            $args['meta_value'] = $atts['division'];
        }

        $departments = get_posts(
            $args
        );

        ob_start();
        if (count($departments) > 0) { ?>
            <div class="departments-list">
                <ul>
                    <?php
                    global $post;
                    foreach ($departments as $post) :
                        setup_postdata($post);
                        $image = $this->metabox->get_image($post->ID);
                        $icon = $this->metabox->get_icon($post->ID); ?>
                        <li>
                            <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="image"></a>
                            <div class="content">
                                <?php echo !empty($icon) ? "<img src=\"{$icon[0]}\" />" : ''; ?>
                                <a href="<?php the_permalink(); ?>" class="title"><?php the_title(); ?></a>
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
        }
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
            'pagination' => 1,
            'min-width' => 0,
            'columns' => 3
        ), $atts);

        $departments = get_posts(
            array(
                'post_type' => 'department',
                'posts_per_page' => $atts['limit'],
                'orderby' => $atts['orderby'],
                'order' => $atts['order'],
                'suppress_filters' => false
            )
        );
        $settings = array();
        $_departments = array();
        if (count($departments) > 0) {
            $settings = array(
                'class' => 'na-departments-carousel ' . $atts['class'],
                'pagination' => $atts['pagination'],
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
            foreach ($departments as $post) :
                setup_postdata($post);
                $image = '';
                $image = $this->metabox->get_image($post->ID);

                $content = sprintf('<div class="title department-title">%s</div>', get_the_title());
                $_departments[] = array('content' => sprintf('<a href="%s" style="%s" class="image-aspect department-image"></a>%s', get_permalink(), $image ? "background-image:url('{$image[0]}')" : '', $content), 'post' => $post);
            endforeach;
            wp_reset_postdata();
        }
        global $slider;
        return $slider->addSlider($_departments, $settings);
    }
}
class DepartmentMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
        $posts = \get_posts(['post_type' => 'division', 'posts_per_page' => -1]);
        $options = [];
        if ($posts && !\is_wp_error($posts)) {
            $options = ['Select Division'];
            foreach ($posts as $pst) {
                $options[$pst->ID] = $pst->post_title;
            }
        } else {
            $options[] = 'No divisions found';
        }
        ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose icon</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'icon', 'department', false); ?>
                        <p class="description">Choose your department icon.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose listing image</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'department', false); ?>
                        <p class="description">Choose the department listing image.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose division</label></th>
                    <td><?php $this->_metabox_select($post->ID, $options, 'division'); ?>
                        <p class="description">Choose your department division.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Clinical</label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('clinical', 'department') ?>
                        <?php $this->_metabox_text($post->ID, 'item', 'department'); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Procedural</label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('procedural', 'department') ?>
                        <?php $this->_metabox_text($post->ID, 'item', 'department'); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Gallery</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'gallery', 'department', true); ?>
                        <p class="description">Image gallery.</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }
    public function get_image($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'image', 'department', 'full');
        return $p;
    }
    public function get_icon($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'icon', 'department', 'full');
        return $p;
    }
    public function get_clinical($post_id)
    {
        $p = $this->_metabox_repeater_value($post_id, 'clinical', 'department');
        return $p ? array_column((array)$p, 'item') : [];
    }
    public function get_procedural($post_id)
    {
        $p = $this->_metabox_repeater_value($post_id, 'procedural', 'department');
        return $p ? array_column((array)$p, 'item') : [];
    }
}


class DepartmentImage extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;

    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }

    public function show_content($column, $post_id)
    {
        $image =  $this->metabox->_metabox_image_value($post_id, 'icon', 'department');
        if ($image) { ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
<?php
        }
    }
}

?>