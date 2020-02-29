<?php

class Posts_Widget extends WP_Widget
{
    function __construct()
    {
        parent::__construct(false, $name = 'NA: Posts Dropdown');
    }
    function widget($args, $instance)
    {
        extract($args);
        $title = apply_filters('widget_title', $instance['title']);
        echo $before_widget;
        echo $before_title . $title . $after_title;
        $this->show($instance);
        echo $after_widget;
    }
    function form($instance)
    {
        $taxonomy = isset($instance['taxonomy']) ? $instance['taxonomy'] : '';
        $ids = isset($instance['id']) ? $instance['id'] : '';

?>
        <p>
            <label for="<?php echo $this->get_field_id('taxonomy'); ?>">
                <?php _e('Taxonomy'); ?> <input class="widefat" id="<?php echo $this->get_field_id('taxonomy'); ?>" name="<?php echo $this->get_field_name('taxonomy'); ?>" type="text" value="<?php echo $taxonomy; ?>" />
            </label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('id'); ?>">
                <?php _e('Id'); ?> <input class="widefat" id="<?php echo $this->get_field_id('id'); ?>" name="<?php echo $this->get_field_name('id'); ?>" type="text" value="<?php echo $ids; ?>" /><br /><small>Comma seperated set of id</small>
            </label>
        </p>

<?php
    }
    function show($instance)
    {
        $taxonomy_name = $instance['taxonomy'];
        $categories = (array) explode(',', $instance['id']);

        $allOutput = "";

        $taxonomies = [];
        $i = 0;
        foreach ($categories as $category) {
            $output = "";
            $field_type = is_numeric($category) ? 'term_id' : 'slug';
            $args = array(
                'posts_per_page' => '-1',
                'tax_query' => array(
                    array(
                        'taxonomy' => $taxonomy_name,
                        'field' => $field_type,
                        'terms' => [$category],
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );


            $taxonomy = get_term_by($field_type, $category, $taxonomy_name);
            $taxonomies[] = $taxonomy;

            $query = new WP_Query($args);


            if ($query->have_posts()) {
                $output = '<ul>';
                while ($query->have_posts()) {
                    $query->the_post();
                    $style = array();
                    if (has_post_thumbnail()) {
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                        $style[] = "background-image:url($image[0])";
                    }
                    $output .= '<li>
                    <span style="' . implode(";", $style) . '"></span>
                        <a href="' . get_permalink() . '" data-id="' . get_the_ID() . '" >
                            ' . get_the_title() . '
                        </a>
                    </li>';
                }
                $output .= '</ul>';
                $allOutput .= sprintf('<div class="na-posts-dropdown"><a href="#">%s</a>%s</div>', $taxonomy->name, $output);
            }
            $i++;
            wp_reset_postdata();
        }
        echo $allOutput;
    }
    function update($new_instance, $instance)
    {
        $old_instance = $instance;
        $old_instance['taxonomy'] = $new_instance['taxonomy'];
        $old_instance['id'] = $new_instance['id'];

        return $old_instance;
    }
}

?>