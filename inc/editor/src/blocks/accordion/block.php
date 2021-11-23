<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/accordion',
    'title' => 'Accordion',
    'category' => 'na-theme-blocks',
    'description' => 'Create an accordion with title and text.',
    'keywords' =>
    array(
        0 => 'image',
        1 => 'accordion',
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
    'editorStyle' => 'wp-block-accordion-text-editor',
    'style' => 'wp-block-accordion-text',
);
