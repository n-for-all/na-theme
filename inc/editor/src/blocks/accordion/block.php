<?php

return array(
    'apiVersion' => 2,
    'name' => 'na-theme-blocks/accordion',
    'title' => 'Accordion',
    'category' => 'na-theme-blocks',
    'description' => 'Create an accordion with title and text.',
    'keywords' => array(
        0 => 'toggle',
        1 => 'accordion',
    ),
    'textdomain' => 'default',
    'attributes' => array(
        'openByDefault' => array(
            'type' => 'boolean',
        )
    ),
    'supports' => array(
        'anchor' => false,
        'html' => false,
    ),
    'editorStyle' => 'wp-block-accordion-text-editor',
    'style' => 'wp-block-accordion-text',
);
