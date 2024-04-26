<?php

namespace NaTheme\Inc\Map;

class Map
{
    public function __construct()
    {
        $this->actions();
        $this->shortcodes();
    }

    public function actions()
    {

        add_action('wp_enqueue_scripts', array(&$this, 'enqueue_scripts'));
        // add_action('admin_enqueue_scripts', array(&$this, 'enqueue_scripts'));

        add_action('admin_menu', array(&$this, 'menu_pages'));

        add_action('wp_head', array(&$this, 'head'));
        add_action('wp_footer', array(&$this, 'footer'));

        add_action('admin_head', array(&$this, 'head'));
        add_action('admin_footer', array(&$this, 'footer'));

        add_action('init', array(&$this, 'init'));
        add_action('admin_init', array(&$this, 'admin_init'));




        if (is_admin()) {
            add_action('load-post.php', [$this, 'load_metabox']);
            add_action('load-post-new.php', [$this, 'load_metabox']);
        }
    }

    public function load_metabox()
    {
        new Metabox();
    }

    public function shortcodes()
    {
        add_shortcode('map', array(&$this, 'map_shortcode'));
    }

    public function menu_page_exists($menu_slug)
    {
        global $menu;
        foreach ($menu as $i => $item) {
            if ($menu_slug == $item[2]) {
                return true;
            }
        }

        return false;
    }

    public function admin_init()
    {
        register_setting('natheme-map-settings-general', 'natheme-map-key');
        register_setting('natheme-map-settings-general', 'natheme-map-version');
        register_setting('natheme-map-settings-general', 'natheme-map-styles');
    }

    public function menu_pages()
    {
        if (!$this->menu_page_exists('natheme-page')) {
        }

        add_submenu_page('edit.php?post_type=map', 'Settings', 'Settings', 'administrator', __FILE__, array(&$this, 'settings_page'));
    }

    public function settings_page()
    {
?>
        <div class="wrap">
            <h1>Map Settings</h1>
            <hr />
            <form method="post" action="options.php">
                <?php settings_fields('natheme-map-settings-general'); ?>
                <?php do_settings_sections('natheme-map-settings-general'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Api Key</th>
                        <td><input type="text" name="natheme-map-key" value="<?php echo esc_attr(get_option('natheme-map-key')); ?>" />
                            <p class="description"><small>Api Key from here: <a href="https://console.cloud.google.com/google/maps-apis/api-list">Google Cloud Console</a></small></p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">Api Version</th>
                        <td><input type="text" name="natheme-map-version" value="<?php echo esc_attr(get_option('natheme-map-version')); ?>" />
                            <p class="description"><small>keep empty to use latest</small></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Styles</th>
                        <td><textarea name="natheme-map-styles"><?php echo get_option('natheme-map-styles'); ?></textarea>
                            <p class="description"><small>Styles to use for the maps</small></p>
                        </td>
                    </tr>
                </table>
                <hr />
                <?php submit_button(); ?>

            </form>
        </div>
    <?php
    }

    public function init()
    {
        $labels = array(
            'name' => _x('Maps', 'post type general name', 'na-theme'),
            'singular_name' => _x('Map', 'post type singular name', 'na-theme'),
            'menu_name' => _x('Maps', 'admin menu', 'na-theme'),
            'name_admin_bar' => _x('Map', 'add new on admin bar', 'na-theme'),
            'add_new' => _x('Add New', 'map', 'na-theme'),
            'add_new_item' => __('Add New Map', 'na-theme'),
            'new_item' => __('New Map', 'na-theme'),
            'edit_item' => __('Edit Map', 'na-theme'),
            'view_item' => __('View Map', 'na-theme'),
            'all_items' => __('All Maps', 'na-theme'),
            'search_items' => __('Search Maps', 'na-theme'),
            'parent_item_colon' => __('Parent Maps:', 'na-theme'),
            'not_found' => __('No Maps found.', 'na-theme'),
            'not_found_in_trash' => __('No Maps found in Trash.', 'na-theme'),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'query_var' => true,
            'rewrite' => array('slug' => '_map'),
            'capability_type' => 'post',
            'has_archive' => true,
            'hierarchical' => false,
            'menu_position' => null,
            'menu_icon' => 'dashicons-location-alt',
            'supports' => array('title'),
        );

        register_post_type('map', $args);
    }

    public function get_text_words($text, $count)
    {
        $tr = explode(' ', strip_tags(strip_shortcodes($text)));
        $s = [];
        for ($i = 0; $i < $count && $i < sizeof($tr); ++$i) {
            $s[] = $tr[$i];
        }

        return implode(' ', $s);
    }

    public function enqueue_scripts()
    {
        $key = get_option('natheme-map-key');
        wp_enqueue_script('natheme-map-js', get_template_directory_uri() . '/inc/map/js/plugin.js', array(), '1.0.1', true);
        wp_enqueue_script('google-jspai', '//maps.googleapis.com/maps/api/js?libraries=places&callback=initMap&loading=async&key=' . $key, array('natheme-map-js'), '1.0.1', true);
        $this->enqueue_styles();
    }

    public function enqueue_styles()
    {
        wp_enqueue_style('natheme-map-css', get_template_directory_uri() . '/inc/map/css/style.css');
    }

    public function head()
    {
        $key = get_option('natheme-map-key');
        $styles = get_option('natheme-map-styles');
        $version = get_option('natheme-map-version');
        $map = array(
            'dir' => 'ltr',
            'key' => $key,
            'icon' => get_template_directory_uri() . '/inc/map/img/marker.svg',
            'url' => home_url('/'),
            'version' => $version
        );
    ?>
        <script type="text/javascript">
            var NATHEME_MAP = <?php echo json_encode($map); ?>;
            <?php if (function_exists('pll_current_language') && \pll_current_language() == 'ar') : ?>
                NATHEME_MAP.dir = 'rtl';
            <?php endif; ?>
            NATHEME_MAP.styles = <?php echo $styles ? $styles: '[]'; ?>;
        </script>
<?php
    }

    public function get_ajax_url()
    {
        return admin_url('admin-ajax.php');
    }

    public function footer()
    {
        //echo $script;
    }

    public function map_shortcode($atts = array())
    {
        $settings = array(
            'id' => '',
            'height' => '100%',
            'width' => '100%',
            'allow_places' => true
        );
        $settings = shortcode_atts($settings, $atts, 'natheme-map-atts');
        $data = (array) get_post_meta($settings['id'], 'natheme-map-markers', true);
        $data['markers'] = array_values($data['markers'] ?? []);
        $data['map'] = $data['map'];
        $data['routes'] = array_values(isset($data['routes']) ? $data['routes'] : array());
        return sprintf('<div id="map-cont">%s<div data-settings=\'%s\' data-map=\'%s\' id="map-canvas" style="height:%s;width:%s"></div></div>', $settings['allow_places'] ? '<ul id="cont-place-list"></ul>' : '', json_encode($settings, JSON_NUMERIC_CHECK), json_encode($data, JSON_NUMERIC_CHECK), $settings['height'], $settings['width'] ?? '100%');
    }
}


?>