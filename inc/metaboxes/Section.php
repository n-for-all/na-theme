<?php

namespace NaTheme\Inc\Metaboxes;

class Section extends \NaTheme\Inc\Metaboxes\GutenbergMetabox
{
    public function __construct()
    {
        parent::__construct(['page'], 'section', 'Section');
        $this->register_text_box('_wp_section_class', 'Class');
        $this->register_select_box('_wp_page_template_layout', 'Template Layout', [
            'container' => 'Container',
            'container-fluid' => 'Full Container',
            'boxed-offset' => 'Boxed Offset',
            'container boxed-offset' => 'Boxed Offset With Container',
            'container-none' => 'None',
        ]);
    }
}
