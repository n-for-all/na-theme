<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/button',
    'title' => 'Html Counter',
    'category' => 'na-theme-blocks',
    'description' => 'Html Button',
    'keywords' =>
    array('button', 'link'),
    'textdomain' => 'default',
    'attributes' =>
    array(
        'label' =>
        array(
            'type' => 'string',
            'default' => 'Read More',
        ),'className' =>
        array(
            'type' => 'string',
            'default' => '',
        ),
        'href' =>
        array(
            'type' => 'string',
            'default' => '#',
        ),
        'atts' =>
        array(
            'type' => 'string',
            'default' => '',
        )
    ),
    'supports' =>
    array(
        'anchor' => true,
        'html' => true,
    ),
    'editorStyle' => 'wp-block-button-link-editor',
    'style' => 'wp-block-button-link',
);
