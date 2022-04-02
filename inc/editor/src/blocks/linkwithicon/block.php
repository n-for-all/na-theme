<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/linkwithicon',
    'title' => 'Link with icon & text',
    'category' => 'na-theme-blocks',
    'description' => 'Set background image with link.',
    'keywords' =>
    array(
        0 => 'image',
        1 => 'background',
        2 => 'link',
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
    'editorStyle' => 'wp-block-linkwithicon-text-editor',
    'style' => 'wp-block-linkwithicon-text',
);
