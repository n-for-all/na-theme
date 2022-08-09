<?php

namespace NaTheme\Inc\Editor;

class Editor
{

    public function __construct()
    {
        add_action('enqueue_block_editor_assets', [$this, 'editor_assets']);
        add_action('enqueue_block_assets', [$this, 'block_assets']);

        add_filter('block_categories_all', array($this, 'add_category'), 10, 2);
        add_action('init', array($this, 'register_blocks'));
    }


    /**
     * Enqueue the block's assets for the editor.
     *
     * `wp-blocks`: includes block type registration and related functions.
     * `wp-element`: includes the WordPress Element abstraction for describing the structure of your blocks.
     * `wp-i18n`: To internationalize the block's text.
     *
     * @since 1.0.0
     * 
     * @return void
     */
    public function editor_assets()
    {
        // Scripts.
        wp_enqueue_script(
            'na-theme-blocks', // Handle.
            get_template_directory_uri() . '/inc/editor/build/index.js', // Block.js: We register the block here.
            array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor'), // Dependencies, defined above.
        );

        // Styles.
        wp_enqueue_style(
            'na-theme-blocks-editor', // Handle.
            get_template_directory_uri() . '/admin/css/editor.css', // Block editor CSS.
            array('wp-edit-blocks')
        );
    }


    /**
     * Enqueue the block's assets for the frontend.
     *
     * @since 1.0.0
     * 
     * @return void
     */
    public function block_assets()
    {
        // Styles.
        wp_enqueue_style(
            'basic-frontend', // Handle.
            get_template_directory_uri() . '/inc/editor/build/css/style.css', // Block editor CSS.
            array('wp-blocks')
        );
    }

    public function add_category($block_categories, $editor_context)
    {
        if (!empty($editor_context->post)) {
            array_push(
                $block_categories,
                array(
                    'slug'  => 'na-theme',
                    'title' => __('Na Theme', 'na-theme'),
                    'icon'  => null,
                )
            );
        }
        return $block_categories;
    }

    /**
     * Registers block type
     * 
     * @return void
     */
    public function register_blocks()
    {
        /**
         * Filters default attributes of the block.
         *
         * @since 1.0.0
         *
         * @param array $default_attributes Default attributes of block.
         */

        $backgroundData = include_once dirname(__FILE__) . '/src/blocks/background/block.php';
        $linkwithiconData = include_once dirname(__FILE__) . '/src/blocks/linkwithicon/block.php';
        $counterData = include_once dirname(__FILE__) . '/src/blocks/counter/block.php';

        $blocks = [
            'background' => [
                'attributes' => $backgroundData['attributes'],
                'template' => 'background',
                'title' => 'Background',
            ],
            'linkwithicon' => [
                'attributes' => $linkwithiconData['attributes'],
                'template' => 'linkwithicon',
                'title' => 'Link With Icon',
            ],
            'counter' => [
                'attributes' => $counterData['attributes'],
                'template' => 'counter',
                'title' => 'Counter',
            ],
            'grid' => [
                'attributes' => array(
                    'columns' => array(
                        'type' => 'number',
                        'default' => 2,
                    ),
                ),
                'template' => 'grid',
                'title' => 'Grid',
            ],
            'container' => [
                'attributes' => array(
                    'isFluid' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'fluidBreakpoint' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'marginAfter' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                ),
                'template' => 'container',
            ],
            'row' => [
                'attributes' => array(
                    'template' => array(
                        'type' => 'string',
                        'default' => '1-1',
                    ),
                    'noGutters' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'alignment' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'verticalAlignment' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'editorStackColumns' => array(
                        'type' => 'boolean',
                        'default' => '',
                    ),
                    'horizontalGutters' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'verticalGutters' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                ),
                'template' => 'row',
            ],
            'column' => [
                'attributes' =>   array(
                    'sizeXxl' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeXl' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeLg' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeMd' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeSm' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeXs' => array(
                        'type' => 'number',
                        'default' => 12,
                    ),
                    'equalWidthXxl' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'equalWidthXl' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'equalWidthLg' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'equalWidthMd' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'equalWidthSm' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'equalWidthXs' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'bgColor' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'padding' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'centerContent' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'contentVerticalAlignment' => array(
                        'type' => 'string',
                        'default' => false,
                    ),
                ),
                'template' => 'column',
            ], 'grid-column' => [
                'attributes' =>   array(
                    'sizeXxl' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeXl' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeLg' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeMd' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeSm' => array(
                        'type' => 'number',
                        'default' => 0,
                    ),
                    'sizeXs' => array(
                        'type' => 'number',
                        'default' => 12,
                    ),
                    'bgColor' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'padding' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'centerContent' => array(
                        'type' => 'boolean',
                        'default' => false,
                    ),
                    'contentVerticalAlignment' => array(
                        'type' => 'string',
                        'default' => false,
                    ),
                ),
                'template' => 'grid-column',
            ],
            'tabs' => [
                'attributes' => array(
                    'editorStackColumns' => array(
                        'type' => 'boolean',
                        'default' => '',
                    ),
                ),
                'template' => 'tabs',
            ],
            'tab' => [
                'attributes' =>   array(
                    'padding' => array(
                        'type' => 'string',
                        'default' => '',
                    ),
                    'label' => array(
                        'type' => 'string',
                        'default' => '',
                    )
                ),
                'template' => 'tab',
            ]
        ];
        foreach ($blocks as $name => $block) {
            register_block_type(
                'na-theme-blocks/' . $name,
                array(
                    'render_callback' => function ($block_attributes, $content) use ($block) {

                        return $this->get_template($block['template'], $block_attributes, $content);
                    },
                    'attributes' => $block['attributes'],
                    'title' => $block['title'] ?? '',
                )
            );
        }
    }

    public function get_template($template_name, $attributes, $content = '')
    {
        $located = dirname(__FILE__) . '/templates/' . $template_name . '.php';

        if (!file_exists($located)) {
            /* translators: %s template */
            _doing_it_wrong(__FUNCTION__, sprintf(esc_html__('%s does not exist.', 'na-theme'), '<code>' . esc_html($located) . '</code>'), '1.0');
            return '';
        }

        ob_start();

        include $located;

        // Record output.
        $html = ob_get_contents();
        ob_end_clean();

        return $html;
    }
}
