<?php

namespace NaTheme\Inc\News;

class Shortcode extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function __construct()
    {
        parent::__construct(array('article'), 'Article', 'normal', 'high');

        $this->actions();
        $this->shortcodes();
        if (is_admin()) {
            parent::after_save(array($this, 'on_save'));
            $this->add_term_metabox('news');
        }
    }

    public function actions()
    {
        add_action('init', array($this, 'init'));
    }

    public function shortcodes()
    {
        add_shortcode('news-list', array(&$this, 'shortcode'));
        add_shortcode('news', array(&$this, 'shortcodeCarousel'));
    }

    public function on_term_add($taxonomy)
    {
?>
        <div class="form-field term-slug-wrap">
            <label for="tag-slug">Date from</label>
            <label><?php $this->_term_metabox_checkbox('date_from_today', 'news'); ?> Use today</label>
            <?php $this->_term_metabox_custom('date', 'date_from', 'news'); ?>
            <p>The date from the taxonomy will manage, keep empty to use none</p>
        </div>
        <div class="form-field term-slug-wrap">
            <label for="tag-slug">Date To</label>
            <label><?php $this->_term_metabox_checkbox('date_to_today', 'news'); ?> Use today</label>
            <?php $this->_term_metabox_custom('date', 'date_to', 'news'); ?>
            <p>The date to the taxonomy will manage, keep empty to use none</p>
        </div>
        <div class="form-field term-image-wrap">
            <label for="tag-slug">Image/Icon</label>
            <?php $this->_term_metabox_image(false, 'image', false); ?>
            <p>Add an image for this service</p>
        </div>
    <?php
    }
    /**
     * On Term Update
     *
     * @date 2023-12-10
     *
     * @param WP_Term $term
     * @param string $taxonomy
     *
     * @return void
     */
    public function on_term_update($term, $taxonomy)
    {
        if ($taxonomy != 'news') {
            return;
        }
    ?>
        <tr class="form-field term-slug-wrap">
            <th scope="row"><label for="tag-slug">Date from</label></th>
            <td><label><?php $this->_term_metabox_checkbox('date_from_today', 'news', $term->term_id); ?> Use today</label>
                <?php $this->_term_metabox_custom('date', 'date_from', 'news', $term->term_id); ?>
                <p class="description">The date from the taxonomy will manage, keep empty to use none</p>
            </td>
        </tr>
        <tr class="form-field term-slug-wrap">
            <th scope="row"><label for="tag-slug">Date To</label></th>
            <td><label><?php $this->_term_metabox_checkbox('date_to_today', 'news', $term->term_id); ?> Use today</label>
                <?php $this->_term_metabox_custom('date', 'date_to', 'news', $term->term_id); ?>
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

    /**
     * Get Meta
     *
     * @date 2023-12-10
     *
     * @param string  $post_id
     * @param string  $group
     * @param boolean $sanitize
     *
     * @return void
     */
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
        unregister_post_type('article');
        $labels = array(
            'name'               => _x('News', 'post type general name', 'na-theme'),
            'singular_name'      => _x('News', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('News', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('News', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Article', 'na-theme'),
            'new_item'           => __('New Article', 'na-theme'),
            'edit_item'          => __('Edit Article', 'na-theme'),
            'view_item'          => __('View News', 'na-theme'),
            'all_items'          => __('All News', 'na-theme'),
            'search_items'       => __('Search News', 'na-theme'),
            'parent_item_colon'  => __('Parent News:', 'na-theme'),
            'not_found'          => __('No News found.', 'na-theme'),
            'not_found_in_trash' => __('No News found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'has_archive'        => 'articles',
            'rewrite'            => array('slug' => 'article'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('article', $args);

        $labels = array(
            'name'                       => _x('News', 'na-theme'),
            'singular_name'              => _x('News', 'na-theme'),
            'search_items'               => __('Search News'),
            'popular_items'              => __('Popular News'),
            'all_items'                  => __('All News'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit News'),
            'update_item'                => __('Update News'),
            'add_new_item'               => __('Add New News'),
            'new_item_name'              => __('New News'),
            'separate_items_with_commas' => __('Separate news with commas'),
            'add_or_remove_items'        => __('Add or remove news'),
            'choose_from_most_used'      => __('Choose from the most used news'),
            'not_found'                  => __('No news found.'),
            'menu_name'                  => __('News'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array('slug' => 'news'),
        );

        register_taxonomy('news', 'article', $args);
    }
    public function on_save($post_id, $meta, $meta_na)
    {
        if (isset($meta['news']['range'])) {
            $ranges = (array)$meta['news']['range'];
            usort($ranges, function ($a, $b) {
                $dateTimestamp1 = strtotime($a['date']);
                $dateTimestamp2 = strtotime($b['date']);

                return $dateTimestamp1 < $dateTimestamp2 ? -1 : 1;
            });
            update_post_meta($post_id, '_news_from', strtotime($ranges[0]['date']));
            update_post_meta($post_id, '_news_to', strtotime($ranges[count($ranges) - 1]['date']));
        }
    }

    public function shortcodeCarousel($atts)
    {
        $atts = shortcode_atts(array(
            'autoplay' => false,
            'bullets' => true,
            'pagination' => false,
            'columns' => '3',
            'minWidth' => '0',
            'vertical' => false,
            'type' => 'carousel',
            'height' => 'auto',
            'slider' => '',
            'no-arrows' => false,
            'label' => '',
            'category' => '',
            'outer' => false,
            'columns' => '1',
            'orderby' => 'post_date',
            'exclude' => '',
            'limit' => -1,
            'order' => 'DESC',
        ), $atts, 'article-shortcode');
        $categories = (array) explode(",", $atts['category']);
        $args = array(
            'post_type' => 'article',
            'posts_per_page' => $atts['limit'],
            'post__not_in' => trim($atts['exclude']) != '' ? explode(',', $atts['exclude']) : [],
            'orderby' => $atts['orderby'],
            'order' => $atts['order']
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'article',
                'posts_per_page' => '-1',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'news',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'posts_per_page' => $atts['limit'],
                'post__not_in' => trim($atts['exclude']) != '' ? explode(',', $atts['exclude']) : [],
                'orderby' => $atts['orderby'],
                'order' => $atts['order']
            );
        }
        $output = [];
        $query = new \WP_Query($args);
        if ($query->have_posts()) {

            while ($query->have_posts()) {
                global $post;
                $query->the_post();

                $outer = '';

                $label = $atts['label'] != '' ? $atts['label'] : __('Read more');
                $image = "";
                if (has_post_thumbnail()) {
                    $thumbnail = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $image = \sprintf('<div alt="%s" style="%s" class="w-full h-56 bg-center bg-cover"></div>', get_the_title(), "background-image:url($thumbnail[0])");
                }
                $class = $atts['slider'] == 1 ? 'w-full' : '';

                $dates = $this->get_article_date(get_the_ID());
                $outer = sprintf('
                <article class="overflow-hidden transition border border-gray-100 rounded-3xl %s">
                    %s
                    <div class="p-4 bg-white sm:p-6">
                        <time datetime="2022-10-10" class="block text-xs text-gray-500">%s</time>

                        <a href="%s">
                            <h3 class="mt-1 text-xl font-semibold text-gray-900">%s</h3>
                        </a>

                        <div class="mt-2 text-gray-500 line-clamp-3 text-sm/relaxed">%s</div>
                        <a href="%s" class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 group">
                            %s
                            <span aria-hidden="true" class="block transition-all group-hover:ms-0.5 rtl:rotate-180">
                            →
                            </span>
                        </a>
                    </div>
                </article>
                ', $class, $image, $dates, get_permalink(), get_the_title(), get_the_excerpt(), get_permalink(), $label);
                $output[] = $outer;
            }
        }
        wp_reset_postdata();
        if ($atts['slider'] == 1) {
            global $slider;
            $settings = array(
                'autoplay' => $atts['autoplay'],
                'bullets' => $atts['bullets'],
                'pagination' => $atts['pagination'],
                'no-arrows' => $atts['no-arrows'] ?? false,
                'columns' => $atts['columns'] ?? 3,
                'minWidth' => $atts['minWidth'],
                'vertical' => $atts['vertical'],
                'class' => sprintf("na-news na-news-columns-%s", $atts['columns']),
                'type' => 'carousel',
                'height' => $atts['height']
            );
            $slides = [];
            foreach ($output as $value) {
                $slides[] = ['content' => $value];
            }
            return $slider->addSlider($slides, $settings);
        }

        return sprintf('<div class="na-news na-news-columns-%s grid gap-3 grid-cols-1 lg:grid-cols-%s w-full">%s</div>', $atts['columns'], $atts['columns'], implode('', $output));
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'category' => '',
            'columns' => '4',
            'orderby' => 'post_date',
            'exclude' => '',
            'limit' => -1,
            'order' => 'DESC',
        ), $atts, 'news-shortcode');
        $categories = (array)explode(",", $atts['category']);
        $categories = array_filter($categories);
        $args = array(
            'post_type' => 'article',
            'orderby' => $atts['orderby'],
            'order' => $atts['order']
        );

        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'article',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'news',
                        'field' => 'term_id',
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
        }
        if (empty($categories)) {
            $categories = get_terms(array(
                'taxonomy' => 'news',
                'hide_empty' => false,
            ));
        } else {
            foreach ($categories as &$category) {
                $category = get_term($category, 'news');
            }
        }
        $tabs = [];
        $output = "";
        $first = true;
        foreach ($categories as $cat) {
            $tabs[] = sprintf('<a href="%s" class="%s">%s</a>', '#news-' . $cat->term_id, ($first == true ? 'active' : ''), $cat->name);
            $term_meta = $this->get_term_meta($cat->term_id, 'news', 'news');
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
                    'key'     => '_news_from',
                    'value'   => intval($date_from),
                    'compare' => '>=',
                    'type' => 'NUMERIC'
                );
            }
            if ($date_to) {
                $meta_query[] = array(
                    'key'     => '_news_to',
                    'value'   => intval($date_to),
                    'compare' => '<=',
                    'type' => 'NUMERIC'
                );
            }
            $args = array(
                'post_type' => 'article',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'news',
                        'field' => 'term_id',
                        'terms' => $cat->term_id,
                    ),
                ),
                'posts_per_page' => $atts['limit'],
                'post__not_in' => trim($atts['exclude']) != '' ? explode(',', $atts['exclude']) : [],
                'orderby' => $atts['orderby'],
                'order' => $atts['order']
            );
            if (!empty($meta_query)) {
                $args['meta_query'] = $meta_query;
            }
            add_filter('get_meta_sql', array($this, 'filter_query'), 10, 1);
            $query = new \WP_Query($args);
            remove_filter('get_meta_sql',  array($this, 'filter_query'));
            if ($query->have_posts()) {
                $output .= '<ul id="news-' . $cat->term_id . '" class="' . ($first == true ? 'active' : '') . ' na-news na-article-tab na-news-columns-' . $atts['columns'] . '">';
                while ($query->have_posts()) {
                    $query->the_post();

                    $meta = $this->get_meta(get_the_ID(), 'news');

                    $style = array();
                    if (has_post_thumbnail()) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                        $style[] = "background-image:url($image[0])";
                    }
                    $dates = $this->get_article_date(get_the_ID());

                    $link = isset($meta['use_popup']) ? '#!article/' . get_the_ID() : get_the_permalink();
                    $output .= '<li>
                    <div class="news-inner">
                        <a data-id="' . get_the_ID() . '" class="news-image news-button" style="' . implode(";", $style) . '" href="' . $link . '">
                            <div class="news-header">
                                <span class="news-title">' . get_the_title() . '</span>
                                ' . (isset($meta['location']) && $meta['location'] != '' ? '<span class="news-location">' . $meta['location'] . '</span>' : '') . '
                            </div>
                            ' . $dates . '
                        </a>
                        <div class="news-content">' . get_the_excerpt() . '</div>
                    </div>
                    </li>';
                }
                $output .= '</ul>';
            }
            $first = false;
        }
        wp_reset_postdata();
        return sprintf('<div class="news news-container">%s%s</div>', count($tabs) > 1 ? '<div class="news-tabs">' . implode('', $tabs) . '</div>' : '', $output);
    }
    public function get_article_date($id)
    {
        $meta = $this->get_meta($id, 'news');
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
                    $dates .= '<div class="article-date-range">' . $from . ($from != '' && $to != '' ? '<span class="news-to-label">to</span>' : '') . $to . '</div>';
                }
                $dates = '<div class="article-range">' . $dates . '</div>';
                break;
            default:
                for ($i = 0; $i < sizeof((array)$meta['range']); $i++) {
                    $from = '';
                    if (isset($meta['range'][$i]['date'])) {
                        list($year, $month, $day) = explode('-', date('Y-M-d', strtotime($meta['range'][$i]['date'])));
                        $from = '<span><span class="day">' . $day . '</span><span class="month">' . $month . '</span><span class="year">' . $year . '</span></span>';
                    }
                    $dates .= '<div class="article-date-single">' . $from . '</div>';
                }
                $dates = '<div class="article-range">' . $dates . '</div>';
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
                    <td><?php $this->_metabox_radio($post->ID, ['single' => 'Single Dates', 'range' => 'Range of Dates'], 'type', 'news'); ?>
                        <p class="description">The news type.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name"></label></th>
                    <td><?php $this->_metabox_checkbox($post->ID, 'Use only popup, no internal page', 'use_popup', 'news'); ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name"></label></th>
                    <td>
                        <?php $this->_metabox_repeater_start('range', 'news') ?>
                        <div><label>Date</label></div>
                        <?php $this->_metabox_custom($post->ID, 'date', 'date', 'news'); ?>
                        <?php $this->_metabox_repeater_end() ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Location</label></th>
                    <td><?php $this->_metabox_text($post->ID, 'location', 'news'); ?>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Images</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'news'); ?>
                    </td>
                </tr>
            </tbody>
        </table>
<?php
    }
}
?>