<?php

namespace NaTheme\Inc\Team;

class Team extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function __construct()
    {
        parent::__construct(array('team-member'), 'Team Member', 'normal', 'high');
        $this->add_term_metabox('team');
        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('wp_footer', array($this, 'inline_scripts'));

        add_action('wp_ajax_team_member', array($this, 'get_team_member'));
        add_action('wp_ajax_nopriv_team_member', array($this, 'get_team_member'));
        add_action('parse_query',  array($this, 'sort_posts'));
    }


    function sort_posts($q)
    {
        if (!$q->is_main_query() || is_admin())
            return;

        if (
            !is_post_type_archive('team-member') &&
            !is_tax(array('team'))
        ) return;

        $q->set('orderby', 'menu_order');
        $q->set('order', 'ASC');
    }

    public function shortcodes()
    {
        add_shortcode('team', array(&$this, 'shortcode'));
    }
    public function scripts()
    {
        wp_enqueue_style('team-shortcode', get_template_directory_uri() . '/inc/team/css/team.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
        wp_enqueue_script('case-studies-shortcode', get_template_directory_uri() . '/inc/team/js/scripts.js', array('wp-util', 'underscore'), '1.0.0', 'screen');
    }
    public function on_term_add($taxonomy)
    {
?>
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
            <th scope="row"><label for="name">Image</label></th>
            <td><?php $this->_term_metabox_image($term->term_id, 'image', false); ?>
                <p class="description">Add/update an image for this service.</p>
            </td>
        </tr>
    <?php

    }
    public function inline_scripts()
    {
    ?>
        <script id="tmpl-team-member" type="text/template">
            <?php include(locate_template('/inc/team/template/popup.php')); ?>
        </script>
        <script type="text/javascript">
            var TeamSettings = <?php echo json_encode(array('url' => admin_url('admin-ajax.php'))); ?>;
        </script>
    <?php
    }
    public function get_team_member()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if ($post->post_type == 'team-member') {
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                    'image' => $image ? $image[0] : '',
                    'meta'  => $this->get_meta(get_the_ID(), 'team')
                );
                $output = array('status' => 'success', 'post' => $pst);
            }
        }
        echo json_encode($output);
        die();
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Team', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Team', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Team', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Team', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Team Member', 'na-theme'),
            'new_item'           => __('New Team Member', 'na-theme'),
            'edit_item'          => __('Edit Team Member', 'na-theme'),
            'view_item'          => __('View Team Members', 'na-theme'),
            'all_items'          => __('All Team Members', 'na-theme'),
            'search_items'       => __('Search Teams', 'na-theme'),
            'parent_item_colon'  => __('Parent Teams:', 'na-theme'),
            'not_found'          => __('No Team Members found.', 'na-theme'),
            'not_found_in_trash' => __('No Team Members found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'team-member'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('team-member', $args);

        $labels = array(
            'name'                       => _x('Teams', 'na-theme'),
            'singular_name'              => _x('Teams', 'na-theme'),
            'search_items'               => __('Search Teams'),
            'popular_items'              => __('Popular Teams'),
            'all_items'                  => __('All Teams'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Team'),
            'update_item'                => __('Update Team'),
            'add_new_item'               => __('Add New Team'),
            'new_item_name'              => __('New Team'),
            'separate_items_with_commas' => __('Separate team with commas'),
            'add_or_remove_items'        => __('Add or remove team'),
            'choose_from_most_used'      => __('Choose from the most used team'),
            'not_found'                  => __('No team found.'),
            'menu_name'                  => __('Teams'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array('slug' => 'team'),
        );

        register_taxonomy('team', 'team-member', $args);
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'autoplay' => false,
            'filter' => true,
            'bullets' => true,
            'popup' => false,
            'pagination' => false,
            'columns' => '4',
            'minWidth' => '0',
            'vertical' => false,
            'type' => 'carousel',
            'height' => 'auto',
            'slider' => '',
            'category' => '',
            'outer' => false,
            'columns' => '3'
        ), $atts, 'team-shortcode');
        $categories = (array) explode(",", $atts['category']);
        $args = array(
            'post_type' => 'team-member',
            'posts_per_page' => '-1',
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'team-member',
                'posts_per_page' => '-1',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'team',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
        }
        $output = [];
        $query = new \WP_Query($args);
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'team');
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'full');
                    $style[] = "background-image:url($image[0])";
                }
                $inner = '';
                $outer = '';
                if ($atts['outer']) {
                    $outer = '<span class="team-header">
                        <span class="team-title">' . get_the_title() . '</span>
                        <span class="team-position">' . $meta['position'] . '</span>
                    </span>';
                } else {
                    $inner = '<span class="team-header">
                        <span class="team-title">' . get_the_title() . '</span>
                        <span class="team-position">' . $meta['position'] . '</span> 
                    </span>';
                }
                $has_content = trim(get_the_content()) != '';
                $has_popup = $atts['popup'];

                $categories = wp_get_post_terms(get_the_ID(), 'team', array("fields" => "all"));
                $term_ids = [];
                $class = [];

                foreach ($categories as $category) {
                    $term_ids[] = $category->term_id;
                    $class[] = sprintf('category-%s', $category->term_id);
                }

                $link =  sprintf('<a href="%s" data-id="%s" data-terms="%s" class="team-image team-button"><span style="%s" class="image"></span>%s</a>', $has_popup ? '#!team-member/' . get_the_ID() : get_permalink(), get_the_ID(), implode(",", $term_ids), implode(";", $style), $inner);
                $output[] = [
                    'id' => get_the_ID(),
                    'post' => get_post(),
                    'terms' => $term_ids,
                    'content' => sprintf('<div class="team-inner %s">%s%s
                        <div class="team-content">%s</div>
                    </div>', $has_content ? '' : 'no-content', $link, $outer, get_the_excerpt())
                ];
            }
        }
        wp_reset_postdata();

        $header = '%s';
        if ($atts['slider'] == 1) {
            global $slider;
            $settings = array(
                'autoplay' => $atts['autoplay'],
                'bullets' => $atts['bullets'],
                'pagination' => $atts['pagination'],
                'columns' => $atts['columns'],
                'minWidth' => $atts['min-width'] ?? 'none',
                'vertical' => $atts['vertical'],
                'class' => sprintf("na-team na-team-columns-%s", $atts['columns']),
                'type' => 'carousel',
                'height' => $atts['height']
            );

            return $slider->addSlider($output, $settings);
        } else if ($atts['filter']) {
            $terms = get_terms(['taxonomy' => 'team', 'hide_empty' => false]);
            $list = [];
            $header = '';
            foreach ($terms as $key => $term) {
                $list[] = sprintf('<li><a class="%s" href="#!team/%s">%s</a></li>', $key == 0 ? 'active' : '', $term->term_id, $term->name);
            }
            if (count($list) > 1) {
                $header = sprintf('<ul class="na-team-header">%s</ul>', implode('', $list));
            }
            $header = '<div class="na-team-wrapper">' . $header . '%s</div>';
            $first = isset($terms[0]) ? $terms[0]->term_id : '';
            $output = array_map(function ($item) use ($first) {
                return  sprintf('<li class="%s item-%s">%s</li>', in_array($first, $item['terms']) ? '' : 'hidden', $item['id'], $item['content']);
            }, $output);
        } else {
            $output = array_map(function ($item) {
                return  sprintf('<li class="item-%s">%s</li>', $item['id'], $item['content']);
            }, $output);
        }
        return sprintf($header, sprintf('<ul class="na-team na-team-columns-%s">%s</ul>', $atts['columns'], implode('', $output)));
    }
    public function show_metabox($post)
    {
    ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Position</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'position', 'team'); ?>
                        <p class="description">The team member position.</p>
                    </td>
                </tr>
            </tbody>
        </table>
<?php
    }
}

?>