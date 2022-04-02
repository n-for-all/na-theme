<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/counter',
    'title' => 'Html Counter',
    'category' => 'na-theme-blocks',
    'description' => 'Html Counter',
    'keywords' =>
    array('counter'),
    'textdomain' => 'default',
    'attributes' =>
    array(
        'duration' =>
        array(
            'type' => 'string',
            'default' => '1000',
        ),'start' =>
        array(
            'type' => 'string',
            'default' => '0',
        ),
        'step' =>
        array(
            'type' => 'string',
            'default' => '0.1',
        ),
        'end' =>
        array(
            'type' => 'string',
            'default' => '1',
        ),
        'prefix' =>
        array(
            'type' => 'string',
            'default' => '',
        ),
        'suffix' =>
        array(
            'type' => 'string',
            'default' => '',
        ),
        'seperator' =>
        array(
            'type' => 'string',
            'default' => '',
        )
    ),
    'supports' =>
    array(
        'anchor' => false,
        'html' => false,
    ),
    'editorStyle' => 'wp-block-counter-text-editor',
    'style' => 'wp-block-counter-text',
);
