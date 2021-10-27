<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/background',
    'title' => 'Background & Text',
    'category' => 'na-theme-blocks',
    'description' => 'Set background image with text.',
    'keywords' =>
    array(
        0 => 'image',
        1 => 'background',
    ),
    'textdomain' => 'default',
    'attributes' =>
    array(
        'mediaPosition' =>
        array(
            'type' => 'string',
            'default' => 'left',
        ),
        'mediaId' =>
        array(
            'type' => 'number',
        ),
        'mediaUrl' =>
        array(
            'type' => 'string'
        ),
        'verticalAlignment' =>
        array(
            'type' => 'string',
        ),
        'imageFill' =>
        array(
            'type' => 'boolean',
        ),
    ),
    'supports' =>
    array(
        'anchor' => false,
        'html' => false,
    ),
    'editorStyle' => 'wp-block-background-text-editor',
    'style' => 'wp-block-background-text',
);
