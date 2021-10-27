<?php

/**
 * [services category=""]
 * Returns a list of services with specific category, if category is null or empty the it will return all services
 *
 * [services-categories]
 * Returns a list of service taxonomies
 *
 * [service-members]
 * Returns a list of service members
 */

namespace NaTheme\Inc\Services;

class Services extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function __construct()
    {
        parent::__construct(array('service'), 'Service', 'normal', 'high');
        $this->add_term_metabox('services');
        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));

        add_action('wp_ajax_service', array($this, 'get_service'));
        add_action('wp_ajax_nopriv_service', array($this, 'get_service'));
        add_action('wp_footer', array($this, 'inline_scripts'));
        add_filter('widget_text', 'do_shortcode');
    }
    public function shortcodes()
    {
        add_shortcode('services', array($this, 'shortcode'));
        add_shortcode('services-categories', array($this, 'shortcode_categories'));
        add_shortcode('service-members', array($this, 'shortcode_members'));
    }
    public function inline_scripts()
    {
?>
        <script id="tmpl-service" type="text/template">
            <?php include('template/popup.php'); ?>
        </script>
    <?php
    }
    public function scripts()
    {
        wp_enqueue_script('services-shortcode', get_template_directory_uri() . '/inc/services/js/scripts.js', array(), '1.0.0', 'screen');
        wp_enqueue_style('services-shortcode', get_template_directory_uri() . '/inc/services/css/styles.css', array(), '1.0.0', 'screen');
    }
    public function get_service()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if ($post->post_type == 'service') {
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                    'image' => $image ? $image[0] : '',
                    'meta'  => $this->get_meta(get_the_ID(), 'services')
                );
                $output = array('status' => 'success', 'post' => $pst);
            }
        }
        echo json_encode($output);
        die();
    }
    public function on_term_add($taxonomy)
    {
    ?>
        <div class="form-field term-image-wrap">
            <label for="tag-slug">Price</label>
            <?php $this->_term_metabox_custom('text', 'price'); ?>
            <p>Service Price</p>
        </div>
        <div class="form-field term-image-wrap">
            <label for="tag-slug">Image/Icon</label>
            <?php $this->_term_metabox_image(false, 'image', false); ?>
            <p>Add an image for this service</p>
        </div>
    <?php

    }
    public function on_term_update($term, $taxonomy)
    {
    ?>
        <tr class="form-field form-required term-image-wrap">
            <th scope="row"><label for="name">Price</label></th>
            <td><?php $this->_term_metabox_custom('text', 'price', '', $term->term_id); ?>
                <p class="description">Service Price.</p>
            </td>
        </tr>
        <tr class="form-field form-required term-image-wrap">
            <th scope="row"><label for="name">Image</label></th>
            <td><?php $this->_term_metabox_image($term->term_id, 'image', false); ?>
                <p class="description">Add/update an image for this service.</p>
            </td>
        </tr>
        <?php

    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Services', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Service', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Services', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Services', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New Service', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Service', 'na-theme'),
            'new_item'           => __('New Service', 'na-theme'),
            'edit_item'          => __('Edit Service', 'na-theme'),
            'view_item'          => __('View Service', 'na-theme'),
            'all_items'          => __('All Service', 'na-theme'),
            'search_items'       => __('Search Services', 'na-theme'),
            'parent_item_colon'  => __('Parent Services:', 'na-theme'),
            'not_found'          => __('No Service found.', 'na-theme'),
            'not_found_in_trash' => __('No Service found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'service'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('service', $args);

        $labels = array(
            'name'                       => _x('Services', 'na-theme'),
            'singular_name'              => _x('Services', 'na-theme'),
            'search_items'               => __('Search Services'),
            'popular_items'              => __('Popular Services'),
            'all_items'                  => __('All Services'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Service Category'),
            'update_item'                => __('Update Service Category'),
            'add_new_item'               => __('Add New Service Category'),
            'new_item_name'              => __('New Service Category'),
            'separate_items_with_commas' => __('Separate services with commas'),
            'add_or_remove_items'        => __('Add or remove service category'),
            'choose_from_most_used'      => __('Choose from the most used service category'),
            'not_found'                  => __('No service categories found.'),
            'menu_name'                  => __('Services'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array('slug' => 'services'),
        );

        register_taxonomy('services', 'service', $args);
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'columns' => '3',
            'label' => 'Read More &rarr;',
            'category' => '',
            'wrapper' => 'body'
        ), $atts, 'services-shortcode');
        $categories = (array)explode(",", $atts['category']);
        $args = array(
            'post_type' => 'service',
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'service',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'services',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
        }
        $output = "";
        $query = new \WP_Query($args);
        $count = 0;
        $row = 1;

        $label = sprintf('<span class="services-btn btn">%s</span>',  $atts['label']);
        if ($query->have_posts()) {
            $output = sprintf('<ul data-wrapper="%s" class="na-services na-services-columns-%s">', $atts['wrapper'], $atts['columns'] ?? '1');
            global $post;
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'services');
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $class = array('service-inner');
                $popup = false;
                //add end class to the last columns
                if (isset($meta['popup']) && $meta['popup'] == 1) {
                    $popup = 'services-popup';
                }
                if ($row >= $query->post_count / $atts['columns']) {
                    $class[] = 'row-end';
                }
                if (($count + 1) % $atts['columns'] == 0 || $count == $query->post_count - 1) {
                    $class[] = 'column-end';
                }
                $price = $meta['price'] ?? '';
                $price = $price ? '<div class="services-price"><span>' . $price . '</span></div>' : '';
                $tagline = $meta['tagline'] ?? '';
                if ($tagline != '') {
                    $tagline = sprintf('<span class="services-tagline">%s</span>', $tagline);
                }

                $excerpt = sprintf('<span class="services-content">%s</span>', $post->post_excerpt);
                $output .= sprintf('<li class="%s">
                <a data-id="%s" class="services-image services-button %s" style="%s" href="%s">
                <span class="services-wrapper"><span class="services-header">%s</span>
                %s%s%s%s</span></a></li>', implode(" ", $class), get_the_ID(), $popup, implode(";", $style), ($popup ? '#!service/' . get_the_ID() : get_the_permalink()), get_the_title(), $tagline, $price, $excerpt, $label);
                $count++;
                if ($count % $atts['columns'] == 0) {
                    $row++;
                }
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();
        return $output;
    }
    public function shortcode_members($atts)
    {
        $atts = shortcode_atts(array(), $atts, 'service-members-shortcode');
        ob_start();
        if (is_single()) {
            global $post;
            $meta = get_post_meta(get_the_ID(), '_meta_service', true);
            if (isset($meta['members'])) {
        ?>
                <div class="service-members">
                    <?php
                    foreach ($meta['members'] as $member) {
                        $post = get_post($member);
                        setup_postdata($post); ?>
                        <div class="service-member">
                            <div class="image">
                                <?php if (has_post_thumbnail()) {
                                    echo get_the_post_thumbnail(get_the_ID(), 'large'); ?>
                                <?php
                                } ?>
                            </div>
                            <h3><?php the_title(); ?></h3>
                            <div class="excerpt"><?php the_excerpt(); ?></div>
                        </div>
                    <?php

                    } ?>
                </div>
        <?php
            }
        }
        wp_reset_postdata();
        $output = ob_get_clean();
        return $output;
    }
    public function shortcode_categories($atts)
    {
        $terms = get_terms('services', array(
            'hide_empty' => false,
        ));
        if ($terms) {
            $output = '<ul class="na-services-category">';
            $i = sizeof($terms) - 1;
            while ($i >= 0) {
                $term = $terms[$i];
                $image = get_term_meta($term->term_id, 'image', true);
                $style = array();
                $v = wp_get_attachment_image_src($image, 'full');
                if ($v) {
                    $style[] = "background-image:url($v[0])";
                }

                $output .= '<li><a data-id="' . $term->term_id . '" class="services-image services-button" style="' . implode(";", $style) . '" href="' . get_term_link($term, 'services') . '"></a><a data-id="' . $term->term_id . '" href="' . get_term_link($term, 'services') . '" class="services-button"><div class="content vertical-center"><div class="services-header"><h3>' . $term->name . '</h3></div><div class="services-content">' . $term->description . '</div><span data-id="' . $term->term_id . '" class="services-image services-button btn">Read More &rarr;</span></div></a></li>';
                $i--;
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();
        return $output;
    }
    public function show_metabox($post)
    {
        ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Tagline</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'tagline', 'services'); ?>
                        <p class="description">The services tagline.</p>
                    </td>
                </tr>

                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Price</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'price', 'services'); ?>
                        <p class="description">The service price.</p>
                    </td>
                </tr>

                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Currency</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'currency', 'services'); ?>
                        <p class="description">The service currency.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Popup</label></th>
                    <td><?php $this->_metabox_checkbox($post->ID, 'Open as popup', 'popup', 'services'); ?>
                        <p class="description">Opens as popup or seperate page</p>
                    </td>
                </tr>
            </tbody>
        </table>
<?php

    }
}
?>