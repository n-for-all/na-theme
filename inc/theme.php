<?php

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */

namespace NaTheme\Inc;

class Theme
{

    private $search = [];
    private $modules = [];
    private $module_classes = [];
    public $svgTool = null;
    public $imageTool = null;

    private $cache_id = false;

    public function __construct()
    {
        spl_autoload_register(
            function ($class_name) {
                if (\stripos($class_name, __NAMESPACE__ . '\\') === 0) {
                    $class_name = dirname(__FILE__) . '/' . str_ireplace([__NAMESPACE__ . '\\', '\\'], ['', '/'], $class_name) . '.php';
                    if (!file_exists($class_name)) {
                        $classes = explode('/', $class_name);
                        $name = ucwords($classes[count($classes) - 1]);

                        $classes = array_map('strtolower', $classes);
                        $classes[count($classes) - 1] = $name;
                        $class_name = implode('/', $classes);
                    }

                    include_once $class_name;
                }
            }
        );


        $this->svgTool = new \NaTheme\Inc\Tools\Svg\Svg();
        $this->imageTool = new \NaTheme\Inc\Tools\Image\Image();
        $this->actions();
        $this->filters();
        $this->shortcodes();
        if ($this->cache) {
            $this->cache_id = strtotime('now');
        } else {
            $this->cache_id = get_option('na_cache_id');
        }
        if (function_exists('pll_current_language')) {
            if (is_admin()) {
                $strings =  (array) get_option('_na_translations');
                foreach ($strings as $string) {
                    \pll_register_string('na-theme', $string);
                }
            }
            if (!is_admin() && \pll_current_language() == \pll_default_language()) {
                $strings = new \ArrayObject();
                add_filter(
                    'gettext',
                    function ($translation, $text, $domain) use (&$strings) {
                        if ($translation == $text) {
                            $strings[$text] = $text;
                            if ($domain != 'pll_string') {
                                return __($text, 'pll_string');
                            }
                        }

                        return $translation;
                    },
                    10,
                    3
                );

                add_action(
                    'wp_footer',
                    function () use ($strings) {
                        $old = (array) get_option('_na_translations');
                        $new = array_diff((array) $strings, $old) + $old;
                        update_option('_na_translations', array_values($new), false);
                    },
                    10,
                    3
                );
            }
        }
    }

    protected function actions()
    {
        add_action('after_setup_theme', array($this, 'setup'));
        add_action('widgets_init', array(&$this, 'widgets_init'));
        add_action('wp_head', array(&$this, 'head'), 1);
        add_action('wp_enqueue_scripts', array(&$this, 'scripts'), 11);
        add_action('admin_enqueue_scripts', array(&$this, 'admin_scripts'));
        add_action('credits', array(&$this, 'credits'));
        add_action('woocommerce_before_shop_loop', array(&$this, 'woocommerce_before_shop_loop'), 10);
        add_action('woocommerce_before_main_content', array(&$this, 'woocommerce_before_main_content'), 10);
        add_action('woocommerce_after_main_content', array(&$this, 'woocommerce_after_main_content'), 10);
        add_action('woocommerce_after_shop_loop', array(&$this, 'woocommerce_after_shop_loop'), 10);
        add_action('template_redirect', array(&$this, 'disable_author_page'));
        if (is_admin()) {
            add_action('dynamic_sidebar_before',  array(&$this, 'dynamic_sidebar_before'), 10, 2);
            add_action('wp_ajax_na_save_sidebars', array(&$this, 'save_sidebars'));
            add_action('page_attributes_misc_attributes', array(&$this, 'page_attributes_misc_attributes'), 10, 2);
            add_action('save_post_page', array(&$this, 'save_page_template_part'), 10, 3);
            add_action('wp_ajax_unattach_attachment', [&$this, 'unattach_attachment']);
            add_action('wp_ajax_attach_attachment', [&$this, 'attach_attachment']);
        }
        add_action('init', array(&$this, 'init'));

        add_action('admin_head',  function () {
            echo '<style type="text/css">
                  .attachment-266x266, .thumbnail img {
                       width: 100% !important;
                       height: auto !important;
                  }
                  </style>';
        });
    }
    public function init()
    {
        register_meta(
            'post',
            '_wp_page_template_part',
            array(
                'object_subtype'        => 'page',
                'type'        => 'string',
                'single'    => true,
                'show_in_rest'    => true,
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                }
            )
        );
        register_meta(
            'post',
            '_wp_page_template_layout',
            array(
                'object_subtype'        => 'page',
                'type'        => 'string',
                'single'    => true,
                'show_in_rest'    => true,
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                }
            )
        );
        register_meta(
            'post',
            '_wp_section_class',
            array(
                'object_subtype'        => 'page',
                'type'        => 'string',
                'single'    => true,
                'show_in_rest'    => true,
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                }
            )
        );

        register_meta(
            'post',
            '_wp_section_id',
            array(
                'object_subtype'        => 'page',
                'type'        => 'string',
                'single'    => true,
                'show_in_rest'    => true,
                'auth_callback' => function () {
                    return current_user_can('edit_posts');
                }
            )
        );

        add_post_type_support('page', 'excerpt');
    }
    protected function shortcodes()
    {
        add_shortcode('permalink', array(&$this, 'shortcode_permalinks'));
    }
    protected function filters()
    {
        add_filter('get_search_form', array(&$this, 'search_form_modify'));
        if (!is_admin()) {
            add_filter('excerpt_more', array(&$this, 'excerpt_more'));
        }
        add_filter('wpcf7_autop_or_not', '__return_false');
        add_filter('body_class', array(&$this, 'body_class'));
        add_filter('get_the_excerpt', array(&$this, 'get_excerpt'));
        add_filter('pre_get_posts', array(&$this, 'search_filter'));
        add_filter('get_the_archive_title', array(&$this, 'get_the_archive_title'));
        add_filter('author_link', array(&$this, 'redirect_author_link'));
        add_filter('script_loader_src', array(&$this, 'cache'), 10, 2);
        add_filter('style_loader_src', array(&$this, 'cache'), 10, 2);
        add_filter('tiny_mce_before_init', array(&$this, 'override_mce_options'));
        add_filter('upload_mimes', array($this, 'allow_svg'));
        add_filter('script_loader_tag', array($this, 'add_type_attribute'), 10, 3);

        add_filter('dynamic_sidebar_params', array($this, 'dynamic_sidebar_params'));
        add_filter('widget_update_callback', array($this, 'widget_update'), 10, 2);
        add_filter('widget_form_callback', array($this, 'widget_form_extend'), 10, 2);
        add_filter('widget_nav_menu_args', function ($nav_menu_args, $nav_menu, $args, $instance) {
            $nav_menu_args['menu_class'] = 'menu ' . ($instance['classes'] ?? '');
            return $nav_menu_args;
        }, 10, 4);

        //remove wordpress links
        add_filter(
            'wp_headers',
            function ($headers, $wp_query) {
                if (array_key_exists('X-Pingback', $headers)) {
                    unset($headers['X-Pingback']);
                }
                return $headers;
            },
            11,
            2
        );

        add_filter(
            'bloginfo_url',
            function ($output, $property) {
                return ($property == 'pingback_url') ? null : $output;
            },
            11,
            2
        );

        add_action(
            'wp',
            function () {
                remove_action('wp_head', 'rsd_link');
            },
            11
        );
    }

    public function setup()
    {

        $this->remove_json_api();
        /**
         * Make theme available for translation.
         * Translations can be filed in the /languages/ directory.
         * If you're building a theme based on na_theme, use a find and replace
         * to change NA_THEME_TEXT_DOMAIN to the name of your theme in all the template files
         */
        load_theme_textdomain(NA_THEME_TEXT_DOMAIN, get_template_directory() . '/languages');

        // Add default posts and comments RSS feed links to head.
        add_theme_support('automatic-feed-links');
        add_theme_support('woocommerce');
        add_theme_support('wc-product-gallery-zoom');
        add_theme_support('wc-product-gallery-lightbox');
        add_theme_support('wc-product-gallery-slider');
        /**
         * Let WordPress manage the document title.
         * By adding theme support, we declare that this theme does not use a
         * hard-coded <title> tag in the document head, and expect WordPress to
         * provide it for us.
         */
        // add_theme_support('title-tag');

        /**
         * Enable support for Post Thumbnails on posts and pages.
         *
         * See: https://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
         */
        add_theme_support('post-thumbnails');
        set_post_thumbnail_size(825, 510, true);

        // This theme uses wp_nav_menu() in three locations.
        register_nav_menus(
            array(
                'primary' => __('Primary Left Menu',      NA_THEME_TEXT_DOMAIN),
                'primary-right'  => __('Primary Right Menu', NA_THEME_TEXT_DOMAIN),
                'social'  => __('Social Links Menu', NA_THEME_TEXT_DOMAIN),
            )
        );

        /**
         * Switch default core markup for search form, comment form, and comments
         * to output valid HTML5.
         */
        add_theme_support(
            'html5',
            array(
                'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'
            )
        );

        /**
         * Enable support for Post Formats.
         *
         * See: https://codex.wordpress.org/Post_Formats
         */
        add_theme_support(
            'post-formats',
            array(
                'aside', 'image', 'video', 'quote', 'link', 'gallery', 'status', 'audio', 'chat'
            )
        );


        add_image_size('news', 300, 300, true);

        /**
         * This theme styles the visual editor to resemble the theme style,
         * specifically font, colors, icons, and column width.
         */
        new \NaTheme\Inc\Metaboxes\Handler();
        new \NaTheme\Inc\Metaboxes\Section();
    }

    /**
     * Credits hook
     *
     * @date 2022-08-09
     *
     * @return string
     */
    function credits()
    {
?>
        <span class="copyright"><?php echo do_shortcode($this->copyright); ?></span>
        <?php
    }

    function allow_svg($mimes)
    {
        $mimes['svg'] = 'image/svg+xml';
        return $mimes;
    }

    function cache($src, $handle)
    {
        if (!$this->cache_id) {
            return $src;
        }
        update_option('na_cache_id', $this->cache_id);
        $src = add_query_arg('_', $this->cache_id, $src);
        return $src;
    }

    /**
     * This will stop mce from removing html code
     * 
     * @param array $initArray
     *
     * @return array
     */
    function override_mce_options($initArray)
    {
        $opts = '*[*]';
        $initArray['valid_elements'] = $opts;
        $initArray['extended_valid_elements'] = $opts;
        return $initArray;
    }
    function body_class($classes)
    {
        if (is_singular()) {
            // search the array for the class
            if (has_post_thumbnail()) {
                $key = array_search('has-featured-image', $classes);
                if (false === $key) {
                    $classes[] = 'has-featured-image';
                }
            }
            // return the $classes array
        }
        if (is_search()) {
            $classes[] = "woocommerce";
        }
        if ($this->navbar) {
            $classes[] = "nav-" . $this->navbar;
        }
        return $classes;
    }
    /**
     * Register widget area.
     *
     * @link https://codex.wordpress.org/Function_Reference/register_sidebar
     * 
     * @return void
     */
    function widgets_init()
    {
        register_sidebar(
            array(
                'name'          => __('Top Header Widget Area', NA_THEME_TEXT_DOMAIN),
                'id'            => 'header-sidebar-top',
                'description'   => __('Add widgets here to appear in your top header sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );

        if (class_exists('woocommerce')) {
            register_sidebar(
                array(
                    'name'          => __('Shop Widget Area', NA_THEME_TEXT_DOMAIN),
                    'id'            => 'shop',
                    'description'   => __('Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN),
                    'before_widget' => '',
                    'after_widget'  => '</div></aside>',
                    'before_title'  => '<h2 class="widget-title">',
                    'after_title'   => '</h2><div class="widget-inner">',
                )
            );
        }

        register_sidebar(
            array(
                'name'          => __('Blog Widget Area', NA_THEME_TEXT_DOMAIN),
                'id'            => 'blog-sidebar',
                'description'   => __('Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );

        register_sidebar(
            array(
                'name'          => __('Service Widget Area', NA_THEME_TEXT_DOMAIN),
                'id'            => 'sidebar-service',
                'description'   => __('Add widgets here to appear in your sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );


        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 1', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-1',
                'description'   => __('Add widgets here to appear in your top header sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 2', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-2',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );

        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 3', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-3',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 4', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-4',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 5', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-5',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 6', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-6',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 7', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-7',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
        register_sidebar(
            array(
                'name'          => __('Footer Widget Area 8', NA_THEME_TEXT_DOMAIN),
                'id'            => 'footer-8',
                'description'   => __('Add widgets here to appear in your footer sidebar.', NA_THEME_TEXT_DOMAIN),
                'before_widget' => '',
                'after_widget'  => '',
                'before_title'  => '<h2 class="widget-title">',
                'after_title'   => '</h2>',
            )
        );
    }
    /**
     * Register Google fonts
     *
     * @return string Google fonts URL for the theme.
     */
    function fonts_url()
    {
        $fonts_url = '';
        $font     = get_theme_mod('font', "");
        $font_variants     = (array) get_theme_mod('variant', array());
        $header_font     = get_theme_mod('header-font', "");
        $header_variants     = (array) get_theme_mod('header-variant', array());

        $fonts = array();
        if (trim($font, " 0") != "") {
            $fonts = array_merge($fonts, (array) ($font . ":" . implode(",", $font_variants)));
            $custom_css = "
				html, body, div, p, a, *{
					font-family: {$font}, Arial, tahoma, sans-serif;
				}";
            wp_add_inline_style('custom-fonts', $custom_css);
        }
        if (trim($header_font) != "" && false) {
            $fonts = array_merge($fonts, (array) ($header_font . ":" . implode(",", $header_variants)));
            $custom_css = "
				h1, h2, h3, h4, h5, h6, .entry-title{
					font-family: {$header_font}, Arial, tahoma, sans-serif;
				}";
            wp_add_inline_style('custom-fonts', $custom_css);
        }
        if ($fonts) {
            $fonts_url = add_query_arg(
                array(
                    'family' => urlencode(implode('|', $fonts))
                ),
                'https://fonts.googleapis.com/css'
            );
        }

        return $fonts_url;
    }

    function head()
    {
        if ($this->browser_color) {
        ?>
            <meta name="theme-color" content="<?php echo $this->browser_color; ?>">
            <meta name="msapplication-navbutton-color" content="<?php echo $this->browser_color; ?>">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-status-bar-style" content="<?php echo $this->browser_color; ?>">
        <?php
        }
        ?>
        <script type="text/javascript">
            var options = {
                ajax: "<?php echo admin_url('admin-ajax.php') ?>",
                mobile: <?php echo ($this->mobile_breakpoint != '' ? strval(intval($this->mobile_breakpoint)) : '767'); ?>
            };
            var app = {
                ready: function(fn) {
                    if (document.readyState != "loading") {
                        fn();
                    } else {
                        document.addEventListener("DOMContentLoaded", fn);
                    }
                },
                on: function(event, fn) {
                    document.body.addEventListener(event, fn);
                }
            };
        </script>
        <script src="<?php echo \get_template_directory_uri(); ?>/assets/js/react.production.min.js"></script>
        <script src="<?php echo \get_template_directory_uri(); ?>/assets/js/react-dom.production.min.js"></script>
        <?php
    }

    function remove_json_api()
    {

        // Remove the REST API lines from the HTML Header
        remove_action('wp_head', 'rest_output_link_wp_head', 10);
        remove_action('wp_head', 'wp_oembed_add_discovery_links', 10);

        // Remove the REST API endpoint.
        remove_action('rest_api_init', 'wp_oembed_register_route');

        // Turn off oEmbed auto discovery.
        add_filter('embed_oembed_discover', '__return_false');

        // Don't filter oEmbed results.
        remove_filter('oembed_dataparse', 'wp_filter_oembed_result', 10);

        // Remove oEmbed discovery links.
        remove_action('wp_head', 'wp_oembed_add_discovery_links');

        // Remove oEmbed-specific JavaScript from the front-end and back-end.
        remove_action('wp_head', 'wp_oembed_add_host_js');
    }
    /**
     * Enqueue scripts and styles.
     * 
     * @return void
     */
    public function scripts()
    {
        wp_deregister_script('jquery');
        //bootstrap grid styles for this theme
        wp_enqueue_style('na_theme-bootstrap', get_template_directory_uri() . '/assets/css/bootstrap-grid.min.css', array(), '1.0');

        // Add custom fonts, used in the main stylesheet
        $fonts = $this->fonts_url();
        wp_enqueue_style('na_theme-fonts', $fonts, array(), null);

        // font awesome icons
        wp_enqueue_style('font-awesome', get_template_directory_uri() . '/assets/css/font-awesome.min.css', array(), '3.2');
        wp_enqueue_style('font-na-theme', get_template_directory_uri() . '/assets/fonts/na-theme/stylesheet.css', array(), '3.2');


        //custom styles for this theme
        if ($this->menu) {
            wp_enqueue_style('na_menu', get_template_directory_uri() . '/assets/css/menu/' . $this->menu, array('na_theme-main'), '1.0');
        } else {
            wp_enqueue_style('na_menu', get_template_directory_uri() . '/assets/css/menu/default.css', array('na_theme-main'), '1.0');
        }
        if (class_exists('woocommerce')) {
            wp_enqueue_style('na_woocommerce', get_template_directory_uri() . '/assets/css/woocommerce.css', array('na_theme-main', 'woocommerce-general'), '1.0');
        }

        if (function_exists('pll_current_language') && \pll_current_language() == "ar") {
            wp_enqueue_style('na_theme-rtl', get_template_directory_uri() . '/rtl.css', '1.0');
        }
        if (is_singular() && comments_open() && get_option('thread_comments')) {
            wp_enqueue_script('comment-reply');
        }

        wp_enqueue_script('na_theme-scripts', get_template_directory_uri() . '/assets/js/theme.js', array(), '1.0.0', true);
        wp_enqueue_script('na_theme-custom', get_template_directory_uri() . '/assets/js/custom.js', array('na_theme-scripts'), '1.0.0', true);

        if ($this->homepage_scrolling != "") {
            wp_add_inline_script('na_theme-scripts', 'options.scrolling = ' . strval($this->homepage_scrolling) . ';');
            wp_enqueue_script('na_theme-tweenmax', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/TweenMax.min.js', array(), '1.0.0', true);
            wp_enqueue_script('na_theme-scrollmagic', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/ScrollMagic.js', array(), '1.0.0', true);
            wp_enqueue_script('na_theme-gsap-animation', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/animation.gsap.js', array(), '1.0.0', true);
            wp_enqueue_script('na_theme-gsap-scrollto-plugin', get_template_directory_uri() . '/assets/js/plugins/scrollmagic/ScrollToPlugin.min.js', array('jquery'), '1.0.0', true);
        }
        wp_localize_script(
            'na_theme-script',
            'screenReaderText',
            array(
                'expand'   => '<span class="screen-reader-text">' . __('expand child menu', NA_THEME_TEXT_DOMAIN) . '</span>',
                'collapse' => '<span class="screen-reader-text">' . __('collapse child menu', NA_THEME_TEXT_DOMAIN) . '</span>',
            )
        );

        wp_enqueue_style('na_theme-main', get_template_directory_uri() . '/assets/css/style.css', array(), '1.0');

        // Load our main stylesheet.
        wp_enqueue_style('na_theme-style', get_stylesheet_uri(), array('na_theme-main'));
    }

    public function add_type_attribute($tag, $handle, $src)
    {
        // if not your script, do nothing and return original $tag
        if ('na_theme-admin-scripts' !== $handle) {
            return $tag;
        }
        // change the script tag by adding type="module" and return it.
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
        return $tag;
    }

    public function admin_scripts()
    {

        //admin styles for this theme
        $parts = self::get_template_parts();
        $x = [];
        foreach ($parts as $key => $value) {
            $v = str_replace(['.php', '-'], ['', ' '], basename($value));
            $key = str_replace('.php', '', basename($value));
            $x[] = ['label' => ucwords($v), 'value' => $key];
        }

        if (is_admin()) {
            global $pagenow;

            wp_enqueue_style('na_theme-admin', get_template_directory_uri() . '/admin/css/admin.css', array(), '1.0');

            $attachedMedia = [];
            if (($pagenow == 'post.php')) {
                $attachedMedia = array_values(array_map(function ($image) {
                    $src = wp_get_attachment_image_src($image->ID, 'thumbnail');
                    return array('url' => $src[0], 'id' => $image->ID);
                }, get_attached_media('image', intval($_GET['post'] ?? 0))));
            }

            wp_localize_script(
                'na_theme-blocks-scripts',
                'naThemeData',
                [
                    'templates' => $x,
                    'post_id' => intval($_GET['post'] ?? 0, 0),
                    'images' => $attachedMedia
                ]
            );
        }
    }
    /**
     * Add a `screen-reader-text` class to the search form's submit button.
     *
     * @param  string $html Search form HTML.
     * @return string Modified search form HTML.
     */
    function search_form_modify($html)
    {
        return $html;
    }

    function excerpt_more($more)
    {
        $link = sprintf(
            '<div class="excerpt-actions"><a href="%1$s" class="btn btn-default more-link">%2$s &raquo;</a></div>',
            esc_url(get_permalink(get_the_ID())),
            __('Read More', 'na_theme')
        );
        return $link;
    }
    function get_excerpt_limited_words($string, $limit)
    {
        $stripped_string = strip_tags($string); // if there are HTML or PHP tags
        $string_array = explode(' ', $stripped_string);
        $truncated_array = array_splice($string_array, 0, $limit);
        $truncated_string = implode(' ', $truncated_array);

        return $this->truncate($truncated_string, $limit * 4);
    }

    function truncate($string, $limit, $break = ".", $pad = "...")
    {
        // return with no change if string is shorter than $limit
        if (strlen($string) <= $limit) {
            return $string;
        }

        // is $break present between $limit and the end of the string?
        if (false !== ($breakpoint = strpos($string, $break, $limit))) {
            if ($breakpoint < strlen($string) - 1) {
                $string = substr($string, 0, $breakpoint) . $pad;
            }
        }

        return $string;
    }
    function get_excerpt($excerpt)
    {
        if (has_excerpt() && !is_attachment() && !is_admin() || trim($excerpt) != '') {
            $excerpt = $this->get_excerpt_limited_words($excerpt, 40);
            $excerpt .= sprintf(
                '<div class="excerpt-actions"><a href="%1$s" class="btn btn-secondary more-link">%2$s</a></div>',
                esc_url(get_permalink(get_the_ID())),
                __('Read More', 'na_theme')
            );
        }
        return $excerpt;
    }
    function shortcode_permalinks($atts, $content)
    {
        extract(
            shortcode_atts(
                array(
                    'id' => 1,
                    'text' => "",
                    'class' => "",
                ),
                $atts
            )
        );

        if (empty($text)) {
            $text = $content;
        }
        $id = function_exists('pll_get_post') ? \pll_get_post($id) : $id;
        if (!empty($text)) {
            $url = get_permalink($id);
            return sprintf('<a class="%s" href="%s">%s</a>', $class, $url, $text);
        } else {
            return get_permalink($id);
        }
    }
    function the_post_thumbnail()
    {
        if (post_password_required() || is_attachment() || !has_post_thumbnail()) {
            return;
        }

        if (is_singular()) :
        ?>

            <div class="post-thumbnail">
                <?php the_post_thumbnail(); ?>
            </div><!-- .post-thumbnail -->

        <?php else : ?>

            <a class="post-thumbnail" href="<?php the_permalink(); ?>" aria-hidden="true">
                <?php
                the_post_thumbnail('post-thumbnail', array('alt' => get_the_title()));
                ?>
            </a>

        <?php endif; // End is_singular()
    }
    function get_post_thumbnail($post = null, $size = 'post-thumbnail', $icon = false)
    {
        $post = get_post($post);
        if (!$post) {
            return false;
        }
        $post_thumbnail_id = get_post_thumbnail_id($post);
        $size = apply_filters('post_thumbnail_size', $size);
        if ($post_thumbnail_id) {
            if (in_the_loop()) {
                update_post_thumbnail_cache();
            }
            $src = wp_get_attachment_image_src($post_thumbnail_id, $size, $icon);
            return $src[0];
        } else {
            return false;
        }
    }
    function get_woocommerce_archive_thumbnail($category = null, $size = 'thumbnail_id', $default = '')
    {
        global $wp_query;
        if (!$category) {
            $cat = $wp_query->get_queried_object();
            $category = $cat->term_id;
        }
        // get the thumbnail id using the queried category term_id
        $thumbnail_id = get_term_meta($cat->term_id, $size, true);
        if (!$thumbnail_id) {
            return $default;
        }
        // get the image URL
        $image = wp_get_attachment_url($thumbnail_id);

        return $image;
    }
    function the_entry_meta()
    {
        if (is_sticky() && is_home() && !is_paged()) {
            printf('<span class="sticky-post">%s</span>', __('Featured', 'twentyfifteen'));
        }

        $format = get_post_format();
        if (current_theme_supports('post-formats', $format)) {
            printf(
                '<span class="entry-format">%1$s<a href="%2$s">%3$s</a></span>',
                sprintf('<span class="screen-reader-text">%s </span>', _x('Format', 'Used before post format.', 'twentyfifteen')),
                esc_url(get_post_format_link($format)),
                get_post_format_string($format)
            );
        }

        if (in_array(get_post_type(), array('post', 'attachment'))) {
            $time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

            if (get_the_time('U') !== get_the_modified_time('U')) {
                $time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
            }

            $time_string = sprintf(
                $time_string,
                esc_attr(get_the_date('c')),
                get_the_date(),
                esc_attr(get_the_modified_date('c')),
                get_the_modified_date()
            );

            printf(
                '<span class="posted-on"><span class="screen-reader-text">%1$s </span><a href="%2$s" rel="bookmark">%3$s</a></span>',
                _x('Posted on', 'Used before publish date.', 'twentyfifteen'),
                esc_url(get_permalink()),
                $time_string
            );
        }

        if ('post' == get_post_type()) {
            if (is_singular() || is_multi_author()) {
                printf(
                    '<span class="byline"><span class="author vcard"><span class="screen-reader-text">%1$s </span><a class="url fn n" href="%2$s">%3$s</a></span></span>',
                    _x('Author', 'Used before post author name.', 'twentyfifteen'),
                    esc_url(get_author_posts_url(get_the_author_meta('ID'))),
                    get_the_author()
                );
            }

            $categories_list = get_the_category_list(_x(', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen'));
            if ($categories_list) {
                printf(
                    '<span class="cat-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
                    _x('Categories', 'Used before category names.', 'twentyfifteen'),
                    $categories_list
                );
            }

            $tags_list = get_the_tag_list('', _x(', ', 'Used between list items, there is a space after the comma.', 'twentyfifteen'));
            if ($tags_list) {
                printf(
                    '<span class="tags-links"><span class="screen-reader-text">%1$s </span>%2$s</span>',
                    _x('Tags', 'Used before tag names.', 'twentyfifteen'),
                    $tags_list
                );
            }
        }

        if (is_attachment() && wp_attachment_is_image()) {
            // Retrieve attachment metadata.
            $metadata = wp_get_attachment_metadata();

            printf(
                '<span class="full-size-link"><span class="screen-reader-text">%1$s </span><a href="%2$s">%3$s &times; %4$s</a></span>',
                _x('Full size', 'Used before full size attachment link.', 'twentyfifteen'),
                esc_url(wp_get_attachment_url()),
                $metadata['width'],
                $metadata['height']
            );
        }

        if (!is_single() && !post_password_required() && (comments_open() || get_comments_number())) {
            echo '<span class="comments-link">';
            /* translators: %s: post title */
            comments_popup_link(sprintf(__('Leave a comment<span class="screen-reader-text"> on %s</span>', 'twentyfifteen'), get_the_title()));
            echo '</span>';
        }
    }

    public function __get($name)
    {
        switch (strtolower($name)) {
            case 'logo':
            case 'logo_dark':
            case 'loading_logo':
            case 'favicon':
            case 'logo_footer':
                $logo = get_theme_mod($name, $default = '');
                $src = wp_get_attachment_image_src($logo, 'full');
                return $src ? $src[0] : null;
            default:
                return $this->mergeTags(get_theme_mod($name, $default = ''));
        }
    }
    public function mergeTags($out)
    {
        if (!$out || $out == '') {
            return $out;
        }
        return str_replace(['{{theme_url}}'], [get_stylesheet_directory_uri()], $out);
    }
    public function get($name, $default = '')
    {
        return get_theme_mod($name, $default = '');
    }

    public function dynamic_sidebar_before($index, $empty)
    {
        $sidebars = array('footer-1', 'footer-2', 'footer-3', 'footer-4', 'footer-5', 'footer-6', 'footer-7', 'footer-8');
        //echo $index;
        if (in_array($index, $sidebars)) {
            $sidebars = get_option('na_sidebars');
            if (!$sidebars) {
                $sidebars = array();
            }
        ?>
            <div class="sidebar-columns">
                <form action="<?php echo admin_url('admin-ajax.php'); ?>" method="post">
                    <input type="hidden" name="sidebar" value="<?php echo $index; ?>" />
                    <input type="hidden" name="action" value="na_save_sidebars" />
                    <select class="na-sidebar-columns" title="Number of columns" name="columns">
                        <option value="-1">Auto</option>
                        <option value="0">Hidden</option>
                        <?php for ($i = 1; $i <= 12; $i++) : ?>
                            <option <?php echo isset($sidebars[$index]) && $sidebars[$index][0] == $i ? 'selected="selected"' : ''; ?> value="<?php echo $i; ?>"><?php echo $i; ?></option>
                        <?php endfor; ?>
                    </select>
                </form>
            </div>
        <?php
        }
    }

    function unattach_attachment()
    {
        $attachment_id = intval($_POST['attachment_id'] ?? -1);
        if ($attachment_id === -1) {
            echo wp_json_encode(array('status' => 'error', 'message' => 'Invalid attachment'));
            wp_die();
        }
        $update_attachment = array(
            'ID' => $attachment_id,
            'post_parent' => 0
        );
        wp_update_post($update_attachment);
        echo wp_json_encode(array('status' => 'success', 'message' => 'Attachment deleted'));
        wp_die();
    }

    function attach_attachment()
    {
        $attachment_id = intval($_POST['attachment_id'] ?? -1);
        $post_id = intval($_POST['post_id'] ?? -1);
        if ($attachment_id === -1 || $post_id === -1) {
            echo wp_json_encode(array('status' => 'error', 'message' => 'Invalid attachment'));
            wp_die();
        }
        $update_attachment = array(
            'ID' => $attachment_id,
            'post_parent' => $post_id
        );
        wp_update_post($update_attachment);
        echo wp_json_encode(array('status' => 'success', 'message' => 'Attachment deleted'));
        wp_die();
    }

    public function save_sidebars()
    {
        $columns = $_POST['columns'];
        $sidebar = $_POST['sidebar'];
        $sidebars = get_option('na_sidebars');
        if (!$sidebars) {
            $sidebars = array();
        }
        $sidebars[$sidebar] = array($columns);
        update_option('na_sidebars', $sidebars);
        echo json_encode(array('status' => 'success'));
        wp_die();
    }

    public function classes($tag, $class)
    {
        if (basename(get_page_template()) == 'page-map.php') {
            echo $class;
            return;
        }
        switch ($tag) {
            case 'header':
                $class = trim($class) . " pattern-1";
                break;
            case 'content':
                break;
            default:
                break;
        }
        echo $class;
    }
    public static function get_template_parts()
    {
        $parts = array();
        $child_files_array = glob(get_stylesheet_directory() . "/template-parts/*.php");
        if ($child_files_array && !empty($child_files_array)) {
            foreach ($child_files_array as $key => &$value) {
                $name = str_replace('.php', '', basename($value));
                $parts[$name] = $name;
            }
        }

        $naTheme_root = get_template_directory();
        $files_array = glob("$naTheme_root/template-parts/*.php");

        foreach ($files_array as $key => &$value) {
            $name = str_replace('.php', '', basename($value));
            $parts[$name] = $name;
        }

        return $parts;
    }

    public function page_attributes_misc_attributes($post)
    {
        if ($post->post_type != 'page') {
            return;
        }
        $x = self::get_template_parts();

        $part = get_post_meta($post->ID, '_wp_page_template_part', true);
        $layout = get_post_meta($post->ID, '_wp_page_template_layout', true);
        $id = get_post_meta($post->ID, '_wp_section_id', true);
        $class = get_post_meta($post->ID, '_wp_section_class', true);
        ?>
        <hr />
        <p class="post-attributes-label-wrapper">
            <label class="post-attributes-label">Part</label>

            <select name="page_template_part">
                <option <?php echo $part == '' ? 'selected' : ''; ?> value="">Default</option>
                <?php foreach ($x as $key => $value) { ?>
                    <option <?php echo $part == $key ? 'selected' : ''; ?> value="<?php echo $key; ?>"><?php echo $value; ?></option>
                <?php } ?>
            </select><small class="help">Select the template part, this applies to sections and inner content area.</small>
        </p>
        <hr />
        <?php if ($post->post_parent > 0) : ?>
            <p class="post-attributes-label-wrapper">
                <label class="post-attributes-label">Section ID</label>
                <input name="section_id" type="text" value="<?php echo $id; ?>" />
                <small class="help">Overrides the section id, Applies to this section, if empty it will use the page slug.</small>
            </p>
            <hr />
            <p class="post-attributes-label-wrapper">
                <label class="post-attributes-label">Section Class</label>
                <input name="section_class" type="text" value="<?php echo $class; ?>" />
                <small class="help">Adds a section class.</small>
            </p>
            <hr />
            <p class="post-attributes-label-wrapper">
                <label class="post-attributes-label">Section Template Layout</label>
                <select name="page_template_layout">
                    <option <?php echo $layout == 'none' ? 'selected' : ''; ?> value="none">None</option>
                    <option <?php echo $layout == 'container' ? 'selected' : ''; ?> value="container">Boxed</option>
                    <option <?php echo $layout == 'container boxed-offset' || $layout == 'boxed-offset' ? 'selected' : ''; ?> value="container boxed-offset">Boxed Offset</option>
                    <option <?php echo $layout == 'container-fluid' ? 'selected' : ''; ?> value="container-fluid">Fluid</option>
                </select>
                <small class="help">Select the template layout.</small>
            </p>
        <?php endif; ?>
    <?php
    }
    function save_page_template_part($post_ID, $post, $update)
    {
        if (isset($_POST['page_template_part'])) {
            update_post_meta($post_ID, '_wp_page_template_part', $_POST['page_template_part']);
        }
        if (isset($_POST['page_template_layout'])) {
            update_post_meta($post_ID, '_wp_page_template_layout', $_POST['page_template_layout']);
        }
        if (isset($_POST['section_id'])) {
            update_post_meta($post_ID, '_wp_section_id', $_POST['section_id']);
        }
        if (isset($_POST['section_class'])) {
            update_post_meta($post_ID, '_wp_section_class', $_POST['section_class']);
        }
    }
    function get_template_part($post_id, $default)
    {
        $part = get_post_meta($post_id, '_wp_page_template_part', true);
        if (trim($part) == '') {
            return $default;
        }
        return $part;
    }
    function get_template_layout($post_id, $default)
    {
        $part = $this->get_meta($post_id, '_wp_page_template_layout');
        return $part != '' ? $part : $default;
    }
    function get_template_layout_before($post_id)
    {
        $part = $this->get_template_layout($post_id, 'container');
        switch ($part) {
            case 'container-fluid':
                echo '<div class="row"><div class="col-12">';
                break;
            case 'container':
                echo '<div class="row"><div class="col-12">';
                break;
            case 'container boxed-offset':
            case 'boxed-offset':
                echo '<div class="row"><div class="col-md-10 offset-md-1">';
                break;
            default:
                break;
        }
    }
    function get_template_layout_after($post_id)
    {
        $part = $this->get_template_layout($post_id, 'container');
        switch ($part) {
            case 'container-fluid':
            case 'container':
            case 'container boxed-offset':
                echo '</div></div>';
                break;
            default:
                break;
        }
    }
    function get_section_id($post_id, $default)
    {
        $part = get_post_meta($post_id, '_wp_section_id', true);
        return $part && trim($part) != '' ? trim($part) : $default;
    }
    public function woocommerce_before_shop_loop()
    {
    ?>
        <div class="col-md-9 col-sm-9 col-xs-12">
        <?php

    }

    public function woocommerce_after_shop_loop()
    {
        ?>
        </div>
        </div>
    <?php

    }

    public function woocommerce_before_main_content()
    {
    ?>
        <div class="container">
        <?php
    }
    public function woocommerce_after_main_content()
    {
        ?>
        </div>
<?php
    }
    public function enable($module)
    {
        if (is_array($module)) {
            foreach ($module as $key) {
                if (isset($this->module_classes[$key])) {
                    if (class_exists($this->module_classes[$key])) {
                        $class = new \ReflectionClass($this->module_classes[$key]);
                        $class->newInstanceArgs([$this]);
                    }
                    continue;
                }
                if (isset($this->modules[$key])) {
                    include_once $this->modules[$key];
                }
            }
        } elseif (isset($this->modules[$module])) {
            if (isset($this->module_classes[$key]) && class_exists($this->module_classes[$key])) {
                $class = new \ReflectionClass($this->module_classes[$key]);
                $class->newInstanceArgs([$this]);
            } else {
                include_once $this->modules[$module];
            }
        }
    }
    public function enable_search($post_type)
    {
        $this->search[] = $post_type;
    }
    public function enable_preset($name)
    {
        if (file_exists(get_template_directory() . '/preset/' . $name . '/loader.php')) {
            include get_template_directory() . '/preset/' . $name . '/loader.php';
        }
    }
    public function search_filter($query)
    {
        if ($query->is_search && !is_admin() && !empty($this->search)) {
            $query->set('post_type', $this->search);
        }
        return $query;
    }

    public function register($module, $loader)
    {
        $this->modules[$module] = $loader;
    }


    public function registerClass($module, $class)
    {
        $this->module_classes[$module] = $class;
    }

    /**
     * Redirect Author Link to homepage
     *
     * @since 1.0.0
     * @date  2018-04-24
     * 
     * @return string
     */
    public function redirect_author_link()
    {
        return home_url('/');
    }
    /**
     * Disable the author page and redirect it to homepage
     *
     * @since 1.0.0
     * @date  2018-04-24
     * 
     * @return void
     */
    public function disable_author_page()
    {
        if (is_author()) {
            wp_redirect(home_url('/'), 301);
            exit;
        }
    }

    /**
     * Remove 'Archives', 'Categories' labels from titles
     *
     * @since 1.0.0
     * @date  2018-04-24
     * @param string $title
     * 
     * @return string
     */
    public function get_the_archive_title($title)
    {
        if (is_category()) {
            $title = single_cat_title('', false);
        } elseif (is_tag()) {
            $title = single_tag_title('', false);
        } elseif (is_author()) {
            $title = '<span class="vcard">' . get_the_author() . '</span>';
        }
        return $title;
    }


    public function widget_form_extend($instance, $widget)
    {
        $row = '';
        if (!isset($instance['classes'])) {
            $instance['classes'] = null;
        }
        $row .= "<br/>Class:\t<input type='text' name='widget-{$widget->id_base}[{$widget->number}][classes]' id='widget-{$widget->id_base}-{$widget->number}-classes' class='widefat' value='{$instance['classes']}'/>\n";
        $row .= "</p>\n";
        echo $row;
        return $instance;
    }


    public function widget_update($instance, $new_instance)
    {
        $instance['classes'] = $new_instance['classes'];
        return $instance;
    }

    public function dynamic_sidebar_params($params)
    {
        global $wp_registered_widgets;
        $widget_id    = $params[0]['widget_id'];
        $widget_obj    = $wp_registered_widgets[$widget_id];
        $widget_opt    = get_option($widget_obj['callback'][0]->option_name);
        $widget_num    = $widget_obj['params'][0]['number'];
        if (isset($widget_opt[$widget_num]['classes']) && !empty($widget_opt[$widget_num]['classes'])) {
            $params[0]['before_widget'] = preg_replace('/class="/', "class=\"{$widget_opt[$widget_num]['classes']} ", $params[0]['before_widget'], 1);
        }
        return $params;
    }

    public function get_meta($post_id, $name = '')
    {
        $meta_name = '';
        $meta_name = "_meta_{$name}";
        if ($a = get_post_meta($post_id, $meta_name, true)) {
            return $a;
        } else {
            $a = get_post_meta($post_id, $name, true);
            return $a ?? false;
        }
        return false;
    }
}
global $naTheme;
$naTheme = new \NaTheme\Inc\Theme();
new \NaTheme\Inc\User\Filter();
new \NaTheme\Inc\Editor\Editor();



add_action(
    'widgets_init',
    function () {
        return register_widget(new \NaTheme\Inc\Widgets\Posts());
    }
);

$naTheme->registerClass('services', '\NaTheme\Inc\Services\Services');
$naTheme->registerClass('team', '\NaTheme\Inc\Team\Team');
$naTheme->registerClass('events', '\NaTheme\Inc\Events\Shortcode');
$naTheme->registerClass('news', '\NaTheme\Inc\News\Shortcode');
$naTheme->registerClass('menu', '\NaTheme\Inc\Menu\Shortcode');
$naTheme->registerClass('healthcare', '\NaTheme\Inc\Healthcare\Healthcare');
$naTheme->registerClass('testimonials', '\NaTheme\Inc\Testimonials\Shortcode');
$naTheme->registerClass('map', '\NaTheme\Inc\Map\Map');


$naTheme->register('slider', get_template_directory() . '/inc/slider/loader.php');

$naTheme->register('case-studies', get_template_directory() . '/inc/case-studies/shortcode.php');
$naTheme->register('carousel', get_template_directory() . '/inc/carousel/shortcode.php');
$naTheme->register('posts', get_template_directory() . '/inc/posts/shortcodes.php');
$naTheme->register('attachment', get_template_directory() . '/inc/attachment/loader.php');
$naTheme->register('switcher', get_template_directory() . '/inc/switcher/loader.php');
$naTheme->register('popup', get_template_directory() . '/inc/popup/loader.php');

do_action('theme_init', $naTheme);



?>