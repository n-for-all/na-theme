<?php

/**
 *  Na Theme Customizer functionality.
 */
require_once 'inc/menu_walker.class.php';

class Na_Theme_Admin
{
    public function __construct()
    {
        $this->actions();
    }

    public function actions()
    {
        add_action('customize_register', array(&$this, 'customize_register'), 11, 1);
        //add_action( 'customize_preview_init', array(&$this, 'customizer_live_preview') );
        add_action('customize_controls_enqueue_scripts', array(&$this, 'customizer_scripts'));
    }

    public function customizer_live_preview()
    {
    }

    public function customizer_scripts()
    {
        wp_enqueue_script(
            'na-themecustomizer',            //Give the script an ID
            get_template_directory_uri() . '/admin/js/theme-customizer.js', //Point to file
            array('jquery', 'customize-preview'),    //Define dependencies
            '',                        //Define a version (optional)
            true                        //Put script in footer?
        );
    }

    public function list_all_menu_css()
    {
        $naTheme_root = get_template_directory();
        $files_array = glob("$naTheme_root/assets/css/menu/*.css");
        $x = array();
        foreach ($files_array as $key => &$value) {
            $x[basename($value)] = basename($value);
        }

        return $x;
    }

    public function list_all_btn_styles()
    {
        $x = array(
            'toggle-style-1' => 'Style 1',
            'toggle-style-2' => 'Style 2',
            'toggle-style-3' => 'Style 3',
            'toggle-style-4' => 'Style 4',
        );

        return $x;
    }

    /**
     * Add postMessage support for site title and description for the Customizer.
     *
     * @param WP_Customize_Manager $wp_customize customizer object
     */
    public function customize_register($wp_customize)
    {
        require_once 'inc/fonts.class.php';

        $panel = 'na_theme';

        $wp_customize->add_panel($panel, array(
            'title' => __('Theme Options'),
            'description' => 'Change header styles, logo\'s, favicon and navigation menu\'s', // Include html tags such as <p>.
            'priority' => 1, // Mixed with top-level-section hierarchy.
        ));

        $section = 'header';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Header',
                'description' => 'Change header styles.',
                'priority' => 1,
                'panel' => $panel,
            )
        );
        $setting = 'navbar';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'radio',
            'choices' => array(
                '' => 'Normal',
                'fixed-top' => 'Fixed Top',
                'fixed-bottom' => 'Fixed Bottom',
            ),
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Header Navigation Style'),
            'description' => __(''),
        ));

        $setting = 'menu';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'radio',
            'choices' => $this->list_all_menu_css(),
            'default' => '',
            'priority' => 6, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Header Menu Style'),
            'description' => __(''),
        ));
        $setting = 'btn_menu_style';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'radio',
            'choices' => $this->list_all_btn_styles(),
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Header Btn Style'),
            'description' => __(''),
        ));
        $setting = 'menu_dark';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'checkbox',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Dark'),
            'description' => __('Dark Mode'),
        ));

        $setting = 'menu_expanded';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'checkbox',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Expanded'),
            'description' => __('Expand the menu by default'),
        ));
        $setting = 'show_scroll_icon';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'checkbox',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Show Scrolling Icon'),
            'description' => __('Only shown on the homepage sections template'),
        ));
        $setting = 'top_bar';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Top bar text'),
            'description' => __(''),
        ));
        $section = 'general';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Logo\'s',
                'description' => 'Change logo\'s, favicons and more.',
                'priority' => 1,
                'panel' => $panel,
            )
        );

        $setting = 'favicon';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, $setting, array(
            'label' => __('Favicon'),
            'description' => 'Change favicon.',
            'section' => $section,
            'mime_type' => 'image',
            'priority' => 1, // Within the section.
        )));

        $setting = 'logo';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, $setting, array(
            'label' => __('Logo'),
            'description' => 'Change main header logo.',
            'section' => $section,
            'mime_type' => 'image',
            'priority' => 1, // Within the section.
        )));
        $setting = 'logo_dark';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, $setting, array(
            'label' => __('Logo Dark'),
            'description' => 'Change main header dark logo.',
            'section' => $section,
            'mime_type' => 'image',
            'priority' => 1, // Within the section.
        )));
        $setting = 'loading_logo';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, $setting, array(
            'label' => __('Loading Logo'),
            'description' => 'Change loading logo.',
            'section' => $section,
            'mime_type' => 'image',
            'priority' => 1, // Within the section.
        )));

        $setting = 'logo_footer';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, $setting, array(
            'label' => __('Footer Logo'),
            'description' => 'Change footer logo.',
            'section' => $section,
            'mime_type' => 'image',
            'priority' => 1, // Within the section.
        )));

        $setting = 'glitch';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'checkbox',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Glitch'),
            'description' => __('glitch the logo'),
        ));
        $setting = 'browser_color';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, $setting, array(
            'label' => __('Chrome theme color.'),
            'description' => __('Applied to the chrome header on mobile.'),
            'section' => $section,
        )));

        $section = 'typography';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Typography',
                'description' => 'Change header fonts and variants',
                'priority' => 1,
                'panel' => $panel,
            )
        );

        /*$setting = 'fonts_header';
        $wp_customize->add_setting( $setting, array(
            'default'           => '',
            'type'              => 'theme_mod',
            'transport'					=>	'postMessage'
        ) );
        $wp_customize->add_control(  new Na_Fonts_Control(
            $wp_customize,
      $setting,
            array(
            'type' => 'select',
            'section' => $section, // Required, core or custom.
            'label' => __( 'Header Fonts' ),
            'description' => __( '' )
        )) );*/

        $setting = 'font';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
            'transport' => 'postMessage',
        ));
        $setting = 'variant';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
            'transport' => 'postMessage',
        ));
        $wp_customize->add_control(new Na_Fonts_Control(
            $wp_customize,
            'fonts',
            array(
                'type' => 'font',
                'section' => $section, // Required, core or custom.
                'settings' => array('font' => 'font', 'variant' => 'variant'),
                'label' => array(__('Customize Body Fonts:'), __('Font'), __('Font Variant')),
                'description' => __(''),
            )
        ));

        $setting = 'header-font';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
            'transport' => 'postMessage',
        ));
        $setting = 'header-variant';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
            'transport' => 'postMessage',
        ));
        $wp_customize->add_control(new Na_Fonts_Control(
            $wp_customize,
            'header-fonts',
            array(
                'type' => 'font',
                'section' => $section, // Required, core or custom.
                'settings' => array('header-font' => 'header-font', 'header-variant' => 'header-variant'),
                'label' => array(__('Customize Header Fonts:'), __('Font'), __('Font Variant')),
                'description' => __(''),
            )
        ));
        $section = 'theme_cache';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Cache',
                'description' => 'Disable the cache',
                'priority' => 1,
                'panel' => $panel,
            )
        );
        $setting = 'cache';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'checkbox',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Disable Cache'),
            'description' => __('This will change a random number on CSS and JS each time you refresh the page'),
        ));
        $social_panel = 'na_theme_social';
        $wp_customize->add_panel($social_panel, array(
            'title' => __('Theme Social API\'s'),
            'description' => 'Configure social network access', // Include html tags such as <p>.
            'priority' => 2, // Mixed with top-level-section hierarchy.
        ));
        $section = 'twitter_api';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Twitter API',
                'description' => 'Allow access to twitter services, to generate acess click <a href="https://apps.twitter.com/app/new" target="_blank">here</a>.',
                'priority' => 1,
                'panel' => $social_panel,
            )
        );
        $setting = 'twitter_key';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Consumer Key'),
            'description' => __(''),
        ));
        $setting = 'twitter_secret';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Consumer Secret'),
            'description' => __(''),
        ));
        $section = 'instagram_api';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Instagram API',
                'description' => 'Allow access to twitter services, to generate acess click <a href="https://www.instagram.com/developer/clients/manage/" target="_blank">here</a>.',
                'priority' => 1,
                'panel' => $social_panel,
            )
        );
        $setting = 'instagram_key';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Client Key'),
            'description' => __(''),
        ));
        $setting = 'instagram_secret';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Client Secret'),
            'description' => '<span class="instagram-redirect-uri"><span>Redirect URI: </span>' . home_url('instagram/auth') . '</span>Click this button after you add your client id and secret to authorize the access.<br/><a class="button button-primary" href="#" onclick="
            return api_authorize(\'' . home_url('instagram/auth') . '\')">Authorize</a><select id="insta-publish"><option value="code">Sandbox</option><option value="token">Live</option></select>',
        ));
        $section = 'copyright';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Copyright',
                'description' => '',
                'priority' => 1,
                'panel' => $panel,
            )
        );
        $setting = 'copyright';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));

        $wp_customize->add_control($setting, array(
            'type' => 'textarea',
            'default' => 'Copyright &copy; 2015. All rights reserved.',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Copyright'),
            'description' => __(''),
        ));


        $social_panel = 'na_theme_behaviour';
        $wp_customize->add_panel($social_panel, array(
            'title' => __('Theme Behaviour'),
            'description' => 'Configure theme behavious', // Include html tags such as <p>.
            'priority' => 3, // Mixed with top-level-section hierarchy.
        ));
        $section = 'homepage_behaviour';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Homepage Sections',
                'description' => '',
                'priority' => 1,
                'panel' => $social_panel,
            )
        );
        $setting = 'homepage_scrolling';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'radio',
            'default' => '',
            'priority' => 1, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Scrolling'),
            'description' => __(''),
            'choices' => array(
                '' => 'Normal',
                '1' => 'Full Screen',
                '2' => 'Slides Manual',
                '3' => 'Slides Natural',
                '4' => 'Slides Left and Right',
                '5' => 'Normal Sections',
            ),
        ));
        $section = 'mobile_behaviour';
        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Mobile',
                'description' => '',
                'priority' => 1,
                'panel' => $social_panel,
            )
        );

        $setting = 'mobile_breakpoint';
        $wp_customize->add_setting($setting, array(
            'default' => '',
            'type' => 'theme_mod',
        ));
        $wp_customize->add_control($setting, array(
            'type' => 'text',
            'default' => '',
            'priority' => 5, // Within the section.
            'section' => $section, // Required, core or custom.
            'label' => __('Mobile Media Query'),
            'description' => __('This will switch to mobile as soon as it reaaches a specific size, usually 768px, keep empty for 768px media query'),
        ));

        $section = 'sidebars';
        $setting = 'footer_sidebars';

        $wp_customize->add_section(
            $section,
            array(
                'title' => 'Sidebars',
                'description' => '',
                'priority' => 1,
                'panel' => $social_panel,
            )
        );
        
        $sidebars = array(
            'footer_1' => 'Footer 1',
            'footer_2' => 'Footer 2',
            'footer_3' => 'Footer 3',
            'footer_4' => 'Footer 4',
            'footer_5' => 'Footer 5',
            'footer_6' => 'Footer 6',
            'footer_7' => 'Footer 7',
            'footer_8' => 'Footer 8'
        );

        $choices = [];
        for ($i = 1; $i <= 12; $i++) {
            $choices[$i] = sprintf('Column %s', $i);
        }
        foreach ($sidebars as $key => $sidebar) {
            $wp_customize->add_setting($key, array(
                'default' => 4,
                'type' => 'theme_mod',
            ));
            $wp_customize->add_control($key, array(
                'type' => 'select',
                'priority' => 1, // Within the section.
                'section' => $section, // Required, core or custom.
                'label' => $sidebar,
                'description' => __('Column size for this footer column'),
                'choices' => $choices,
            ));
        }
    }
}
global $naTheme_admin;
$naTheme_admin = new Na_Theme_Admin();
