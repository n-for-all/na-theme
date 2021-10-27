<?php

namespace NaTheme\Inc\Healthcare;

class Division
{
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_shortcode('divisions-carousel', array(&$this, 'renderCarousel'));
        add_shortcode('divisions', array(&$this, 'render'));

        add_filter('manage_division_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_division_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        $this->metabox = new DivisionMetabox(array('division'), 'Divisions');

        $image = new DivisionImage("division-icon", "Icon", "icon", "divisions", 2);
        $image->set_metabox($this->metabox);
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Divisions', 'post type general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'      => _x('Division', 'post type singular name', NA_THEME_TEXT_DOMAIN),
            'menu_name'          => _x('Divisions', 'admin menu', NA_THEME_TEXT_DOMAIN),
            'name_admin_bar'     => _x('Division', 'add new on admin bar', NA_THEME_TEXT_DOMAIN),
            'add_new'            => _x('Add New', 'book', NA_THEME_TEXT_DOMAIN),
            'add_new_item'       => __('Add New Division', NA_THEME_TEXT_DOMAIN),
            'new_item'           => __('New Division', NA_THEME_TEXT_DOMAIN),
            'edit_item'          => __('Edit Division', NA_THEME_TEXT_DOMAIN),
            'view_item'          => __('View Division', NA_THEME_TEXT_DOMAIN),
            'all_items'          => __('Divisions', NA_THEME_TEXT_DOMAIN),
            'search_items'       => __('Search Divisions', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon'  => __('Parent Divisions:', NA_THEME_TEXT_DOMAIN),
            'not_found'          => __('No divisions found.', NA_THEME_TEXT_DOMAIN),
            'not_found_in_trash' => __('No divisions found in Trash.', NA_THEME_TEXT_DOMAIN)
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => 'edit.php?post_type=doctor',
            'query_var'          => true,
            'rewrite'            => array('slug' => 'division'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'page-attributes')
        );

        register_post_type('division', $args);
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

    public function renderCarousel($atts)
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
        $divisions = get_posts(
            array(
                'post_type' => 'division',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'suppress_filters' => false,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'divisions',
                        'field' => is_numeric($atts['category']) ? 'term_id' : 'slug',
                        'terms' => $atts['category']
                    )
                )
            )
        );
        $settings = array();
        $_divisions = array();
        if (count($divisions) > 0) {
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
            foreach ($divisions as $division) :
                $image = '';
                if (has_post_thumbnail($division->ID)) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id($division->ID), "full")[0];
                }

                $content = sprintf('<div class="na-division-text">%s</div>', apply_filters('the_content', $division->post_content));
                $_divisions[] = array('content' => sprintf('<div style="background-image:url(%s)" class="na-division-inner">
                        %s
    				</div>', $image, $settings['container'] == 'container' ? sprintf('<div class="container"><div class="row"><div class="col-md-12">%s</div></div></div>', $content) : $content), 'post' => $division);
                if ($atts['max'] && $atts['max'] < count($_divisions)) {
                    break;
                }
            endforeach;
        }
        return $this->addDivision($_divisions, $settings);
    }
    public function render($atts)
    {
        $atts = shortcode_atts(array(
            'limit' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        ), $atts);

        $divisions = get_posts(
            array(
                'post_type' => 'division',
                'posts_per_page' => $atts['limit'],
                'orderby' => $atts['orderby'],
                'order' => $atts['order'],
                'suppress_filters' => false
            )
        );

        ob_start();
        if (count($divisions) > 0) {
?>
            <div class="divisions-list">
                <ul>
                    <?php
                    global $post;
                    foreach ($divisions as $post) :
                        setup_postdata($post);
                        $image = $this->metabox->get_image($post->ID);
                        $icon = $this->metabox->get_icon($post->ID);
                    ?>
                        <li>
                            <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="image"></a>
                            <div class="content">
                                <?php echo $icon ? "<img src=\"{$icon[0]}\" />" : ''; ?>
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
    public function addDivision($divisions, $settings)
    {
        if (count($divisions) > 0) {
            $id = uniqid('divisions_');
            ob_start();
            if (isset($settings['thumbnails']) && $settings['thumbnails']) {
                $settings['sync'] = $id . '_thumbnails';
            }
            include('template/divisions.tpl.php');

            return ob_get_clean();
        }
    }
}
class DivisionMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
        ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose icon</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'icon', 'division', false); ?>
                        <p class="description">Choose the division icon.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose listing image</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'division', false); ?>
                        <p class="description">Choose the division listing image.</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }
    public function get_image($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'image', 'division', 'full');
        return $p;
    }
    public function get_icon($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'icon', 'division', 'full');
        return $p;
    }
}


class DivisionImage extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;
    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }
    public function show_content($column, $post_id)
    {
        $image = $this->metabox->_metabox_image_value($post_id, 'icon', 'division');

        if ($image) {
        ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
<?php

        }
    }
}

?>