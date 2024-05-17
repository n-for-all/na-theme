<?php

namespace NaTheme\Inc\Healthcare;

class Division
{
    private $metabox;
    public function __construct()
    {
        add_action('init', array(&$this, 'init'));
        add_shortcode('divisions-carousel', array(&$this, 'renderCarousel'));
        add_shortcode('divisions', array(&$this, 'render'));

        add_filter('manage_division_posts_columns', array(&$this, 'add_img_column'));
        add_filter('manage_division_posts_custom_column', array(&$this, 'manage_img_column'), 10, 2);

        add_filter('autocomplete', array(&$this, 'autocomplete'), 11, 1);
        add_action('the_post', array(&$this, 'post_object'));

        $this->metabox = new DivisionMetabox(array('division'), 'Divisions');

        $image = new DivisionImage("division-icon", "Icon", "icon", "division", 2);
        $image->set_metabox($this->metabox);

        $image = new DivisionDepartment("division-department", "Department", "department", "division", 2);
        $image->set_metabox($this->metabox);
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Divisions', 'post type general name', NA_THEME_TEXT_DOMAIN),
            'singular_name'      => _x('Division', 'post type singular name', NA_THEME_TEXT_DOMAIN),
            'menu_name'          => _x('Divisions', 'admin menu', NA_THEME_TEXT_DOMAIN),
            'name_admin_bar'     => _x('Division', 'add new on admin bar', NA_THEME_TEXT_DOMAIN),
            'add_new'            => _x('Add New', 'book', NA_THEME_TEXT_DOMAIN),
            'add_new_item'       => __('Add New Division', NA_THEME_TEXT_DOMAIN),
            'new_item'           => __('New Division', NA_THEME_TEXT_DOMAIN),
            'edit_item'          => __('Edit Division', NA_THEME_TEXT_DOMAIN),
            'view_item'          => __('View Division', NA_THEME_TEXT_DOMAIN),
            'all_items'          => __('Divisions', NA_THEME_TEXT_DOMAIN),
            'search_items'       => __('Search Divisions', NA_THEME_TEXT_DOMAIN),
            'parent_item_colon'  => __('Parent Divisions:', NA_THEME_TEXT_DOMAIN),
            'not_found'          => __('No divisions found.', NA_THEME_TEXT_DOMAIN),
            'not_found_in_trash' => __('No divisions found in Trash.', NA_THEME_TEXT_DOMAIN)
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => 'edit.php?post_type=doctor',
            'query_var'          => true,
            'rewrite'            => array('slug' => 'division'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'excerpt', 'editor', 'thumbnail', 'page-attributes')
        );

        register_post_type('division', $args);
    }
    public function add_img_column($columns)
    {
        $columns['img'] = 'Image';
        return $columns;
    }
    public function manage_img_column($column_name, $post_id)
    {
        if ($column_name == 'img') {
            echo get_the_post_thumbnail($post_id, 'thumbnail');
        }
        return $column_name;
    }

    function post_object(&$post_object)
    {
        if ($post_object->post_type == 'division') {
            $post_object->image = $this->metabox->get_image($post_object->ID);
            $post_object->icon = $this->metabox->get_icon($post_object->ID);
            $post_object->department = $this->metabox->get_department($post_object->ID);
        }
    }

    public function renderCarousel($atts)
    {
        $atts = shortcode_atts(array(
            'id' => 0,
            'category' => 0,
            'container' => 'container',
            'height' => '100%',
            'type' => '',
            'max' => false,
            'vertical' => 0,
            'autoplay' => 0,
            'thumbnails' => 0,
            'bullets' => 0,
            'min-width' => 0,
            'columns' => 1
        ), $atts);
        if ($atts['id'] != 0) {
            $atts['category'] = $atts['id'];
        }
        $divisions = get_posts(
            array(
                'post_type' => 'division',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'suppress_filters' => false,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'divisions',
                        'field' => is_numeric($atts['category']) ? 'term_id' : 'slug',
                        'terms' => $atts['category']
                    )
                )
            )
        );
        $settings = array();
        $_divisions = array();
        if (count($divisions) > 0) {
            $settings = array(
                'autoplay' => $atts['autoplay'],
                'container' => $atts['container'],
                'bullets' => $atts['bullets'],
                'thumbnails' => $atts['thumbnails'],
                'columns' => $atts['columns'],
                'vertical' => $atts['vertical'],
                'minWidth' => $atts['min-width'] > 0 ? $atts['min-width'] : 200,
                'type' => $atts['type'],
                'height' => $atts['height']
            );
            foreach ($divisions as $division) :
                $image = '';
                if (has_post_thumbnail($division->ID)) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id($division->ID), "full")[0];
                }

                $content = sprintf('<div class="na-division-text">%s</div>', apply_filters('the_content', $division->post_content));
                $_divisions[] = array('content' => sprintf('<div style="background-image:url(%s)" class="na-division-inner">
                        %s
    				</div>', $image, $settings['container'] == 'container' ? sprintf('<div class="container"><div class="row"><div class="col-md-12">%s</div></div></div>', $content) : $content), 'post' => $division);
                if ($atts['max'] && $atts['max'] < count($_divisions)) {
                    break;
                }
            endforeach;
        }
        return $this->addDivision($_divisions, $settings);
    }
    public function render($atts)
    {
        $atts = shortcode_atts(array(
            'limit' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        ), $atts);

        $order = $atts['order'] ?? 'ASC';
        $sort = $_GET['sort'] ?? 'a-z';
        if ($sort == 'z-a') {
            $order = 'DESC';
        }

        $divisions = get_posts(
            array(
                'post_type' => 'division',
                'posts_per_page' => $atts['limit'],
                'orderby' => 'title',
                'order' => $order,
                'suppress_filters' => false
            )
        );

        ob_start();


?>
        <div class="flex division-list">
            <div class="">
                <div class="pr-10">
                    <?php include_once(get_template_directory() . '/inc/healthcare/templates/parts/department-filters.php'); ?>
                </div>
            </div>
            <div class="flex-1">
                <div class="flex items-center mb-5 doctors-search">
                    <div class="flex-1 mr-4 border border-gray-300 rounded-sm bg-gray-50 form-group search-group">
                        <div data-live-search="true" endpoint="<?php echo add_query_arg('action', 'doctors_autocomplete', admin_url('admin-ajax.php')); ?>" alllabel="<?php _e('Search all for \'%s\'', 'na-theme'); ?>" searchinglabel="<?php _e('Searching...', 'na-theme'); ?>" placeholder="<?php _e('Search for doctors, division or specialty...', 'na-theme'); ?>"></div>
                    </div>
                    <div class="flex items-center form-group">
                        <label class="mr-2 text-sm"><?php _e('Sort', 'na-theme'); ?></label>
                        <select name="sort" class="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 form-control form-select sort-divisions">
                            <option value="a-z" <?php echo $order == 'ASC' ? 'selected' : ''; ?>><?php _e('Name: A-Z', 'na-theme'); ?></option>
                            <option value="z-a" <?php echo $order == 'DESC' ? 'selected' : ''; ?>><?php _e('Name: Z-A', 'na-theme'); ?></option>
                        </select>
                    </div>
                </div>
                <ul class="relative grid gap-3 md:grid-cols-2 lg:grid-cols-3 filter-divisions">
                    <?php
                    if (count($divisions) > 0) {
                        global $post;
                        $limit = 9;
                        $count = 0;
                        foreach ($divisions as $post) :
                            setup_postdata($post);
                            $image = \has_post_thumbnail() ? \wp_get_attachment_image_src(\get_post_thumbnail_id(), 'full') : [];
                            $icon = $post->icon;
                            $department = get_post($post->department);
                            $depTitle = $department ? $department->post_title : '';

                    ?>
                            <li class="relative division-item <?php echo $count >= $limit ? "hidden" : ""; ?>" data-id="<?php echo $post->ID; ?>" data-department="<?php echo $post->department; ?>">
                                <a href="<?php the_permalink(); ?>" style="<?php echo $image ? "background-image:url({$image[0]})" : '' ?>" class="left-0 right-0 block w-full h-full bg-gray-100 bg-center bg-cover pt-72 image"></a>
                                <div class="absolute bottom-0 w-full p-4 content bg-white/80">
                                    <div class="flex items-center">
                                        <?php echo $icon ? "<img class='h-10 mr-2' src=\"{$icon[0]}\" />" : ''; ?>
                                        <div class="flex flex-col">
                                            <a href="<?php the_permalink(); ?>" class="text-xl font-medium transition-all division-title opacity-80 hover:opacity-100"><?php the_title(); ?></a>
                                            <?php if ($department) : ?><a href="<?php echo get_permalink($department); ?>" class="text-base transition-all opacity-50 hover:opacity-100"><?php echo $depTitle; ?></a><?php endif; ?>
                                        </div>
                                    </div>
                                    <?php if (\has_excerpt()) : ?><div class="hidden mt-4 text"><?php the_excerpt(); ?></div><?php endif; ?>
                                </div>
                            </li>
                    <?php
                            $count++;
                        endforeach;
                        wp_reset_postdata();
                    }
                    ?>
                </ul>
                <?php if (count($divisions) > $limit) : ?>
                    <div class="relative z-10 flex items-end justify-center w-full pt-10 -mt-16 bg-white-gradient show-more-divisions">
                        <a href="#" class="inline-flex items-center justify-center px-4 py-2 m-2 mx-auto text-blue-800 transition-all bg-blue-300 border border-blue-300 rounded-sm hover:bg-transparent hover:text-blue-300 more-items">
                            <svg fill="currentColor" class="w-5 h-5 mr-2" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 0c-8.836 0-16 7.163-16 16s7.163 16 16 16c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 30.032c-7.72 0-14-6.312-14-14.032s6.28-14 14-14 14 6.28 14 14-6.28 14.032-14 14.032zM23 15h-6v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1v6h-6c-0.552 0-1 0.448-1 1s0.448 1 1 1h6v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6h6c0.552 0 1-0.448 1-1s-0.448-1-1-1z"></path>
                            </svg> <?php _e('Show More', 'na-theme'); ?>
                        </a>
                        <a href="#" class="inline-flex items-center justify-center hidden px-4 py-2 m-2 mx-auto text-blue-800 transition-all bg-blue-300 border border-blue-300 rounded-sm hover:bg-transparent hover:text-blue-300 less-items">
                            <svg fill="currentColor" class="w-5 h-5 mr-2" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 0c-8.836 0-16 7.163-16 16s7.163 16 16 16c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 30.032c-7.72 0-14-6.312-14-14.032s6.28-14 14-14 14 6.28 14 14-6.28 14.032-14 14.032zM23 15h-6v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1v6h-6c-0.552 0-1 0.448-1 1s0.448 1 1 1h6v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6h6c0.552 0 1-0.448 1-1s-0.448-1-1-1z"></path>
                            </svg> <?php _e('Show Less', 'na-theme'); ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <script>
            app.ready(function() {
                var baseLimit = <?php echo $limit; ?>;
                var divisions = document.querySelectorAll('.filter-divisions > li.division-item');
                var selected = "";

                if (divisions.length) {
                    var showMore = document.querySelector('div.show-more-divisions');
                    var toggleDivisions = function(departmentId, limit) {
                        var count = 0;
                        divisions.forEach(function(division, index) {
                            if (!departmentId || departmentId == "") {
                                division.classList.remove('hidden');
                                if (count >= limit) {
                                    division.classList.add('hidden');
                                }
                                count++;
                                return;
                            }
                            var department = division.getAttribute('data-department');
                            if (department == selected && count < limit) {
                                division.classList.remove('hidden');
                                count++;
                            } else {
                                division.classList.add('hidden');
                            }
                        });
                        if (showMore) {
                            showMore.classList.remove('hidden');
                            if (count >= limit && limit == baseLimit) {
                                showMore.querySelector("a.more-items").classList.remove('hidden');
                                showMore.querySelector("a.less-items").classList.add('hidden');
                            } else if (count < limit && limit == baseLimit) {
                                showMore.querySelector("a.more-items").classList.add('hidden');
                                showMore.querySelector("a.less-items").classList.add('hidden');
                                showMore.classList.add('hidden');
                            } else {
                                showMore.querySelector("a.more-items").classList.add('hidden');
                                showMore.querySelector("a.less-items").classList.remove('hidden');
                            }
                        }
                    }
                    app.on("department.filter", function(e) {
                        selected = e.detail;
                        toggleDivisions(selected, baseLimit);
                    });

                    if (showMore) {
                        showMore.querySelector("a.more-items").addEventListener('click', function(e) {
                            e.preventDefault();
                            toggleDivisions(selected, divisions.length);
                        });
                        showMore.querySelector("a.less-items").addEventListener('click', function(e) {
                            e.preventDefault();
                            toggleDivisions(selected, baseLimit);
                        });
                    }

                    var sortSelect = document.querySelector('select.sort-divisions');
                    if (sortSelect) {
                        var sort = function(e) {
                            var value = e.target.value;
                            var container = document.querySelector('.filter-divisions');
                            var key = function(a) {
                                return a.querySelector(".division-title").textContent.trim()
                            };

                            Array.from(container.children)
                                .sort(function(a, b) {
                                    return value == "a-z" ? key(a).localeCompare(key(b)) : -1 * key(a).localeCompare(key(b))
                                })
                                .forEach(function(child) {
                                    container.appendChild(child)
                                });
                        }
                        sortSelect.addEventListener('change', function(e) {
                            sort(e);
                        });
                    }

                }

            });
        </script>
    <?php
        return ob_get_clean();
    }
    public function addDivision($divisions, $settings)
    {
        if (count($divisions) > 0) {
            $id = uniqid('divisions_');
            ob_start();
            if (isset($settings['thumbnails']) && $settings['thumbnails']) {
                $settings['sync'] = $id . '_thumbnails';
            }
            include('template/divisions.tpl.php');

            return ob_get_clean();
        }
    }

    public function autocomplete(&$values)
    {
        $search = $_GET['q'];

        $main_args = array(
            'post_type' => 'division',
            'post_status' => 'publish',
            'posts_per_page' => 20
        );
        $args = $main_args;
        $args['s'] = $search;

        $query = new \WP_Query($args);
        if ($search != '') {
            $meta_args = $main_args;
            $meta_args['meta_query'] = array(
                'relation' => 'OR',
                array(
                    'key' => '_meta_department',
                    'value' => $search,
                    'compare' => 'LIKE'
                )
            );
            if (isset($args['tax_query'])) {
                $meta_args['tax_query'] = $args['tax_query'];
            }
            $meta_query = new \WP_Query($meta_args);
            $query->posts = array_unique(array_merge($query->posts, $meta_query->posts), SORT_REGULAR);
            $query->post_count = count($query->posts);
        }

        $json = [];
        global $post;
        if ($query->have_posts()) :
            $json[] = ['label' => 'Division', 'type' => 'title'];
            while ($query->have_posts()) : $query->the_post();
                $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'thumbnail');
                $department = get_post($post->department);
                $json[] = ['label' => get_the_title(), 'image' => $image[0], 'description' => $department ? $department->post_title : '', 'url' => get_permalink()];
            endwhile;
        endif;

        return array_merge($values, $json);
    }
}
class DivisionMetabox extends \NaTheme\Inc\Metaboxes\Metabox
{
    public function show_metabox($post)
    {
        $posts = \get_posts(['post_type' => 'department', 'posts_per_page' => -1]);
        $options = [];
        if ($posts && !\is_wp_error($posts)) {
            $options = ['Select Department'];
            foreach ($posts as $pst) {
                $options[$pst->ID] = $pst->post_title;
            }
        } else {
            $options[] = 'No departments found';
        }
    ?>
        <table class="form-table">
            <tbody>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose department</label></th>
                    <td><?php $this->_metabox_select($post->ID, $options, 'department'); ?>
                        <p class="description">Choose your department.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose icon</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'icon', 'division', false); ?>
                        <p class="description">Choose the division icon.</p>
                    </td>
                </tr>
                <tr class="form-field form-required term-name-wrap">
                    <th scope="row"><label for="name">Choose listing image</label></th>
                    <td><?php $this->_metabox_image($post->ID, 'image', 'division', false); ?>
                        <p class="description">Choose the division listing image.</p>
                    </td>
                </tr>
            </tbody>
        </table>
        <?php

    }
    public function get_image($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'image', 'division', 'full');
        return $p;
    }
    public function get_icon($post_id)
    {
        $p = $this->_metabox_image_value($post_id, 'icon', 'division', 'full');
        return $p;
    }
    public function get_department($post_id)
    {
        $p = $this->_metabox_select_value($post_id, 'department');
        return array_pop($p);
    }
}


class DivisionImage extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;
    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }
    public function show_content($column, $post_id)
    {
        $image = $this->metabox->_metabox_image_value($post_id, 'icon', 'division');

        if ($image) {
        ?>
            <img src="<?php echo $image[0]; ?>" style="height:50px" />
        <?php

        }
    }
}



class DivisionDepartment extends \NaTheme\Inc\Metaboxes\Admin\PostColumn
{
    private $metabox = null;
    public function set_metabox($metabox)
    {
        $this->metabox = $metabox;
        return $this;
    }
    public function show_content($column, $post_id)
    {
        $image = $this->metabox->_metabox_select_value($post_id, 'department');

        if (!empty($image)) {
            $id = $image[0];
            $post = get_post($id);
        ?>
            <a href="<?php echo get_edit_post_link($id); ?>"><?php echo $post->post_title; ?></a>
<?php
        }
    }
}

?>