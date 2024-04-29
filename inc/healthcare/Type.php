<?php

namespace NaTheme\Inc\Healthcare;

class Type
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

        $this->metabox = new TypeMetabox(array('type'), 'Types');

        $image = new TypeImageColumn("type-icon", "Icon", "icon", "types", 2);
        $image->set_metabox($this->metabox);
    }

    public function init()
    {
        $labels = array(
            'name'              => _x('Types', 'taxonomy general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'     => _x('Type', 'taxonomy singular name', NA_THEME_TEXT_DOMAIN),
            'search_items'      => __('Search Types', NA_THEME_TEXT_DOMAIN),
            'all_items'         => __('All Types', NA_THEME_TEXT_DOMAIN),
            'parent_item'       => __('Parent Type', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon' => __('Parent Type:', NA_THEME_TEXT_DOMAIN),
            'edit_item'         => __('Edit Type', NA_THEME_TEXT_DOMAIN),
            'update_item'       => __('Update Type', NA_THEME_TEXT_DOMAIN),
            'add_new_item'      => __('Add New Type', NA_THEME_TEXT_DOMAIN),
            'new_item_name'     => __('New Type Name', NA_THEME_TEXT_DOMAIN),
            'menu_name'         => __('Type', NA_THEME_TEXT_DOMAIN),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'public'            => false,
            'rewrite'           => array('slug' => 'type'),
        );

        register_taxonomy('type', array('doctor'), $args);
    }
}


class TypeMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose icon</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'icon', 'type', false); ?>
                        <p class="description">Choose the type icon.</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }
    public function get_icon($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'icon', 'type', 'full');
        return $p;
    }
}


class TypeImageColumn extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;
    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }
    public function show_content($column, $post_id)
    {
        $image = $this->metabox->_metabox_image_value($post_id, 'icon', 'type');

        if ($image) {
        ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
<?php

        }
    }
}
