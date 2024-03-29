<?php

namespace NaTheme\Inc\Events;

class Shortcode extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function __construct()
    {
        parent::__construct(array('event'), 'Event', 'normal', 'high');

        $this->actions();
        $this->shortcodes();
        if (is_admin()) {
            parent::after_save(array($this, 'on_save'));
            $this->add_term_metabox('events');
        }
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('wp_footer', array($this, 'inline_scripts'));

        add_action('wp_ajax_event', array($this, 'get_event'));
        add_action('wp_ajax_nopriv_event', array($this, 'get_event'));
    }
    public function shortcodes()
    {
        add_shortcode('events', array(&$this, 'shortcode'));
        add_shortcode('events-slider', array(&$this, 'shortcodeCarousel'));
        add_shortcode('events-carousel', array(&$this, 'shortcodeCarousel'));
    }
    public function scripts()
    {
        wp_enqueue_style('events-shortcode', get_template_directory_uri() . '/inc/events/css/events.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
        wp_enqueue_script('events-js-shortcode', get_template_directory_uri() . '/inc/events/js/events.js', array(), '1.0.0', 'screen');
    }
    public function inline_scripts()
    {
?>
        <script type="text/javascript">
            var events_ajax = "<?php echo admin_url('admin-ajax.php'); ?>";
        </script>
        <script id="tmpl-event" type="text/template">
            <?php include 'template/popup.php'; ?>
        </script>
    <?php
    }
    public function on_term_add($taxonomy)
    {
    ?>
        <div class="form-field term-slug-wrap">
            <label for="tag-slug">Date from</label>
            <label><?php $this->_term_metabox_checkbox('date_from_today', 'events'); ?> Use today</label>
            <?php $this->_term_metabox_custom('date', 'date_from', 'events'); ?>
            <p>The date from the taxonomy will manage, keep empty to use none</p>
        </div>
        <div class="form-field term-slug-wrap">
            <label for="tag-slug">Date To</label>
            <label><?php $this->_term_metabox_checkbox('date_to_today', 'events'); ?> Use today</label>
            <?php $this->_term_metabox_custom('date', 'date_to', 'events'); ?>
            <p>The date to the taxonomy will manage, keep empty to use none</p>
        </div>
        <div class="form-field term-image-wrap">
            <label for="tag-slug">Image/Icon</label>
            <?php $this->_term_metabox_image(false, 'image', false); ?>
            <p>Add an image for this service</p>
        </div>
    <?php
    }
    public function on_term_update($term, $taxonomy)
    {
        if ($taxonomy != 'events') {
            return;
        }
    ?>
        <tr class="form-field term-slug-wrap">
            <th scope="row"><label for="tag-slug">Date from</label></th>
            <td><label><?php $this->_term_metabox_checkbox('date_from_today', 'events', $term->term_id); ?> Use today</label>
                <?php $this->_term_metabox_custom('date', 'date_from', 'events', $term->term_id); ?>
                <p class="description">The date from the taxonomy will manage, keep empty to use none</p>
            </td>
        </tr>
        <tr class="form-field term-slug-wrap">
            <th scope="row"><label for="tag-slug">Date To</label></th>
            <td><label><?php $this->_term_metabox_checkbox('date_to_today', 'events', $term->term_id); ?> Use today</label>
                <?php $this->_term_metabox_custom('date', 'date_to', 'events', $term->term_id); ?>
                <p class="description">The date to the taxonomy will manage, keep empty to use none</p>
            </td>
        </tr>
        <tr class="form-field form-required term-image-wrap">
            <th scope="row"><label for="name">Image</label></th>
            <td><?php $this->_term_metabox_image($term->term_id, 'image', false); ?>
                <p class="description">Add/update an image for this service.</p>
            </td>
        </tr>
    <?php
    }
    public function get_event()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if ($post->post_type == 'event') {
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                    'image' => $image ? $image[0] : '',
                    'meta'  => $this->get_meta(get_the_ID(), 'events', true)
                );
                $output = array('status' => 'success', 'post' => $pst);
            }
        }
        echo json_encode($output);
        die();
    }
    protected function get_meta($post_id, $group = '', $sanitize = false)
    {
        $meta = parent::get_meta($post_id, $group);
        if (!$sanitize) {
            return $meta;
        }
        if (isset($meta['range'])) {
            $ranges = array();
            foreach ((array)$meta['range'] as $range) {
                $ranges[] = array('date' => date('F j, Y', strtotime($range['date'])));
            }
            $meta['range'] = $ranges;
        }
        if (isset($meta['image'])) {
            $images = [];
            foreach ((array)$meta['image'] as $image) {
                $src = wp_get_attachment_image_src($image, 'full');
                $src_thumb = wp_get_attachment_image_src($image, 'thumbnail');
                $images[] = array('full' => $src[0], 'thumbnail' => $src_thumb[0]);
            }
            $meta['image'] = $images;
        }
        return $meta;
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Events', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Events', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Events', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Events', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Event', 'na-theme'),
            'new_item'           => __('New Event', 'na-theme'),
            'edit_item'          => __('Edit Event', 'na-theme'),
            'view_item'          => __('View Events', 'na-theme'),
            'all_items'          => __('All Events', 'na-theme'),
            'search_items'       => __('Search Events', 'na-theme'),
            'parent_item_colon'  => __('Parent Events:', 'na-theme'),
            'not_found'          => __('No Events found.', 'na-theme'),
            'not_found_in_trash' => __('No Events found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'event'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('event', $args);

        $labels = array(
            'name'                       => _x('Events', 'na-theme'),
            'singular_name'              => _x('Events', 'na-theme'),
            'search_items'               => __('Search Events'),
            'popular_items'              => __('Popular Events'),
            'all_items'                  => __('All Events'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Events'),
            'update_item'                => __('Update Events'),
            'add_new_item'               => __('Add New Events'),
            'new_item_name'              => __('New Events'),
            'separate_items_with_commas' => __('Separate events with commas'),
            'add_or_remove_items'        => __('Add or remove events'),
            'choose_from_most_used'      => __('Choose from the most used events'),
            'not_found'                  => __('No events found.'),
            'menu_name'                  => __('Events'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array('slug' => 'events'),
        );

        register_taxonomy('events', 'event', $args);
    }
    public function on_save($post_id, $meta, $meta_na)
    {
        if (isset($meta['events']['range'])) {
            $ranges = (array)$meta['events']['range'];
            usort(
                $ranges,
                function ($a, $b) {
                    $dateTimestamp1 = strtotime($a['date']);
                    $dateTimestamp2 = strtotime($b['date']);

                    return $dateTimestamp1 < $dateTimestamp2 ? -1 : 1;
                }
            );
            update_post_meta($post_id, '_events_from', strtotime($ranges[0]['date']));
            update_post_meta($post_id, '_events_to', strtotime($ranges[count($ranges) - 1]['date']));
        }
    }

    public function shortcodeCarousel($atts)
    {
        $atts = shortcode_atts(
            array(
                'autoplay' => false,
                'bullets' => true,
                'pagination' => false,
                'columns' => '4',
                'minWidth' => '0',
                'vertical' => false,
                'type' => 'carousel',
                'height' => 'auto',
                'slider' => '1',
                'category' => '',
                'outer' => false,
                'columns' => '1'
            ),
            $atts,
            'event-shortcode'
        );
        $categories = (array) explode(",", $atts['category']);
        $args = array(
            'post_type' => 'event',
            'posts_per_page' => '-1',
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'event',
                'posts_per_page' => '-1',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'events',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
        }
        $output = [];
        $query = new \WP_Query($args);
        if ($query->have_posts()) {

            while ($query->have_posts()) {
                global $post;
                $query->the_post();
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }

                $label = $atts['label'] != '' ? $atts['label'] : __('Learn more');

                $dates = $this->get_event_date(get_the_ID());
                $outer = sprintf(
                    '<div class="event-header">
                        <h3 class="event-title">%s</h3><div class="event-meta">%s</div>
                    </div>',
                    get_the_title(),
                    $dates
                );
                $has_content = trim(get_the_content()) != '';
                $link =  sprintf('<a href="%s" class="btn btn-default event-button">%s</a>', get_permalink(), $label);


                $excerpt = $post->post_excerpt;
                $output[] = [sprintf(
                    '<div class="event">
                        <div class="event-image"><span style="%s" class="image"></span></div>
                        <div class="event-inner %s">%s%s%s</div>
                    </div>',
                    implode(";", $style),
                    $has_content ? '' : 'no-content',
                    $outer,
                    sprintf('<div class="event-content">%s</div>', $excerpt),
                    $link
                ), $post];
            }
        }
        wp_reset_postdata();
        if ($atts['slider'] == 1) {
            global $slider;
            $settings = array(
                'autoplay' => $atts['autoplay'],
                'bullets' => $atts['bullets'],
                'pagination' => $atts['pagination'],
                'columns' => $atts['columns'] ?? 1,
                'minWidth' => $atts['min-width'],
                'vertical' => $atts['vertical'],
                'class' => sprintf("na-events-slider", $atts['columns']),
                'type' => 'carousel',
                'height' => $atts['height']
            );
            $slides = [];
            foreach ($output as $value) {
                $slides[] = ['content' => $value[0], 'post' => $value[1]];
            }
            return $slider->addSlider($slides, $settings);
        }
        return $output = sprintf('<ul class="na-events na-events-columns-%s">%s</ul>', $atts['columns'], '<li>' . implode('</li><li>', $output) . '</li>');
    }

    public function create_tabs($tabs)
    {
        $options = [];
        $nav = [];
        foreach ($tabs as $index => $cat) {
            $nav[] = sprintf('<a href="%s" @click="tab = %s" class="px-1 pb-3 text-sm font-medium border-b-2 shrink-0" :class="tab == %2$s ? \'border-sky-500 text-sky-500\' : \'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700\'">%s</a>', '#events-' . $cat->term_id, $index, $cat->name);
            $options[] = sprintf('<option value="%s">%s</option>', $cat->term_id, $cat->name);
        }
        return sprintf('
        <div class="mb-3 events-tabs">
            <div class="sm:hidden">
                <label class="sr-only">Events</label>
                <select class="w-full border-gray-200 rounded-md">
                %s
                </select>
            </div>

            <div class="hidden sm:block">
                <div class="border-b border-gray-200">
                    <nav class="flex gap-6 -mb-px" aria-label="Tabs">
                        %s
                    </nav>
                </div>
            </div>
        </div>', \implode("\n", $options), \implode("\n", $nav));
    }

    public function create_event($atts)
    {
        $outer = '';

        $label = $atts['label'] != '' ? $atts['label'] : __('Read more');
        $image = "";
        if (has_post_thumbnail()) {
            $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
            $image = \sprintf('<div alt="%s" style="%s" class="w-full h-56 bg-center bg-cover"></div>', get_the_title(), "background-image:url($thumbnail[0])");
        }

        $meta = $this->get_meta(get_the_ID(), 'events');
        $location = (isset($meta['location']) && $meta['location'] != '' ? '<div class="mt-1">' . $meta['location'] . '</div>' : '');
        $class = isset($atts['slider']) && $atts['slider'] == 1 ? 'w-full' : '';

        $dates = $this->get_event_date(get_the_ID());
        if ($dates && trim($dates) != '') {
            $dates = sprintf('<time datetime="%s" class="block text-xs text-gray-500">%1$s</time>', $dates);
        }
        $outer = sprintf('
                <div class="overflow-hidden transition border border-gray-100 rounded-3xl %s">
                    %s
                    <div class="p-4 bg-white sm:p-6">
                        %s

                        <a href="%s">
                            <h3 class="mt-1 text-xl font-semibold text-gray-900">%s</h3>
                        </a>
                        %s
                        <div class="mt-2 text-gray-500 line-clamp-3 text-sm/relaxed">%s</div>
                        <a href="%4$s" class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 group">
                            %s
                            <span aria-hidden="true" class="block transition-all group-hover:ms-0.5 rtl:rotate-180">
                            →
                            </span>
                        </a>
                    </div>
                </div>
                ', $class, $image, $dates, get_permalink(), $location, get_the_title(), get_the_excerpt(), $label);
        return $outer;
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(
            array(
                'label' => '',
                'category' => '',
                'columns' => '4',
                'orderby' => 'post_date',
                'limit' => -1,
                'order' => 'DESC',
            ),
            $atts,
            'events-shortcode'
        );
        $categories = (array)explode(",", $atts['category']);
        $categories = array_filter($categories);
        $args = array(
            'post_type' => 'event',
            'orderby' => $atts['orderby'],
            'order' => $atts['order']
        );

        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'event',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'events',
                        'field' => 'term_id',
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
        }
        if (empty($categories)) {
            $categories = get_terms(
                array(
                    'taxonomy' => 'events',
                    'hide_empty' => false,
                )
            );
        } else {
            foreach ($categories as &$category) {
                $category = get_term($category, 'events');
            }
        }
        $tabs = [];
        $output = "";
        $first = true;
        foreach ($categories as $index => $cat) {
            $tabs[] = $cat;
            $term_meta = $this->get_term_meta($cat->term_id, 'events', 'events');
            $date_from = $date_to = null;
            if (isset($term_meta['date_from_today'])) {
                $date_from = time();
            } elseif (isset($term_meta['date_from']) && trim($term_meta['date_from']) != '') {
                $date_from = strtotime($term_meta['date_from']);
            }
            if (isset($term_meta['date_to_today'])) {
                $date_to = time();
            } elseif (isset($term_meta['date_to']) && trim($term_meta['date_to']) != '') {
                $date_to = strtotime($term_meta['date_to']);
            }
            $meta_query = array();
            if ($date_from) {
                $meta_query[] = array(
                    'key'     => '_events_from',
                    'value'   => intval($date_from),
                    'compare' => '>=',
                    'type' => 'NUMERIC'
                );
            }
            if ($date_to) {
                $meta_query[] = array(
                    'key'     => '_events_to',
                    'value'   => intval($date_to),
                    'compare' => '<=',
                    'type' => 'NUMERIC'
                );
            }
            $args = array(
                'post_type' => 'event',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'events',
                        'field' => 'term_id',
                        'terms' => $cat->term_id,
                    ),
                ),
                'posts_per_page' => $atts['limit'],
                'orderby' => $atts['orderby'],
                'order' => $atts['order']
            );
            if (!empty($meta_query)) {
                $args['meta_query'] = $meta_query;
            }
            add_filter('get_meta_sql', array($this, 'filter_query'), 10, 1);
            $query = new \WP_Query($args);
            remove_filter('get_meta_sql',  array($this, 'filter_query'));
            
            $part = [];
            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $query->the_post();
                    $style = array();
                    if (has_post_thumbnail()) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                        $style[] = "background-image:url($image[0])";
                    }

                    $part[] = $this->create_event($atts);
                }

                $output .= sprintf('<div class="na-news na-news-columns-%s grid gap-3 grid-cols-1 lg:grid-cols-%1$s w-full" :class="{\'hidden\': tab != %s}">%s</div>', $atts['columns'], $index, implode('', $part));

            }
        }
        wp_reset_postdata();
        return sprintf('<div class="events" x-data="{\'tab\': 0}">%s%s</div>', count($tabs) > 1 ? $this->create_tabs($tabs) : '', $output);
    }
    public function get_event_date($id)
    {
        $meta = $this->get_meta($id, 'events');
        if (!$meta || $meta == '') {
            return '';
        }
        $dates = '';
        switch ($meta['type']) {
            case 'range':
                for ($i = 0; $i < sizeof((array)$meta['range']); $i = $i + 2) {
                    $from = '';
                    if (isset($meta['range'][$i]['date'])) {
                        list($year, $month, $day) = explode('-', date('Y-M-d', strtotime($meta['range'][0]['date'])));
                        $from = '<span><span class="day">' . $day . '</span><span class="month">' . $month . '</span><span class="year">' . $year . '</span></span>';
                    }
                    $to = '';
                    if (isset($meta['range'][$i + 1]['date'])) {
                        list($year, $month, $day) = explode('-', date('Y-M-d', strtotime($meta['range'][1]['date'])));
                        $to = '<span><span class="day">' . $day . '</span><span class="month">' . $month . '</span><span class="year">' . $year . '</span></span>';
                    }
                    $dates .= '<div class="event-date-range">' . $from . ($from != '' && $to != '' ? '<span class="events-to-label">to</span>' : '') . $to . '</div>';
                }
                $dates = '<div class="event-range">' . $dates . '</div>';
                break;
            default:
                for ($i = 0; $i < sizeof((array)$meta['range']); $i++) {
                    $from = '';
                    if (isset($meta['range'][$i]['date'])) {
                        list($year, $month, $day) = explode('-', date('Y-M-d', strtotime($meta['range'][$i]['date'])));
                        $from = '<span><span class="day">' . $day . '</span><span class="month">' . $month . '</span><span class="year">' . $year . '</span></span>';
                    }
                    $dates .= '<div class="event-date-single">' . $from . '</div>';
                }
                $dates = '<div class="event-range">' . $dates . '</div>';
                break;
        }
        return $dates;
    }
    public function filter_query($sql)
    {
        $pos = strpos($sql['where'], 'AND');
        if ($pos !== false) {
            $sql['where'] = substr_replace($sql['where'], 'OR', $pos, strlen('AND'));
        }
        return $sql;
    }
    public function show_metabox($post)
    {
    ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Type</label></th>
                    <td><?php $this->_metabox_radio($post->ID, ['single' => 'Single Dates', 'range' => 'Range of Dates'], 'type', 'events'); ?>
                        <p class="description">The events type.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name"></label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('range', 'events') ?>
                        <div><label>Date</label></div>
                        <?php $this->_metabox_custom($post->ID, 'date', 'date', 'events'); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name"></label></th>
                    <td><?php $this->_metabox_checkbox($post->ID, 'Use only popup, no internal page', 'use_popup', 'events'); ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Location</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'location', 'events'); ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Images</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'events'); ?>
                    </td>
                </tr>
            </tbody>
        </table>
<?php
    }
}
?>