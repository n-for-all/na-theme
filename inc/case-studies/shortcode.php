<?php
class Case_Studies_Shortcode extends NA_METABOXES
{
    public function __construct()
    {
        parent::__construct(array('case-study'), 'Case Study', 'normal', 'high') ;

        $this->actions();
        $this->shortcodes();
    }
    public function actions()
    {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        // add_action('wp_footer', array($this, 'inline_scripts'));

    }
    public function shortcodes()
    {
        add_shortcode('case-studies', array(&$this, 'shortcode'));
    }
    public function scripts()
    {
        wp_enqueue_style('case-studies-shortcode', get_stylesheet_directory_uri() . '/inc/case-studies/css/styles.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('wp-util');
        wp_enqueue_script('underscore');
    }
    public function inline_scripts()
    {
    }
    public function init()
    {
        $labels = array(
            'name'               => _x('Case Studies', 'post type general name', 'na-theme'),
            'singular_name'      => _x('Case Studies', 'post type singular name', 'na-theme'),
            'menu_name'          => _x('Case Studies', 'admin menu', 'na-theme'),
            'name_admin_bar'     => _x('Case Studies', 'add new on admin bar', 'na-theme'),
            'add_new'            => _x('Add New', 'timeline-media', 'na-theme'),
            'add_new_item'       => __('Add New Case Study', 'na-theme'),
            'new_item'           => __('New Case Study', 'na-theme'),
            'edit_item'          => __('Edit Case Study', 'na-theme'),
            'view_item'          => __('View Case Studies', 'na-theme'),
            'all_items'          => __('All Case Studies', 'na-theme'),
            'search_items'       => __('Search Case Studiess', 'na-theme'),
            'parent_item_colon'  => __('Parent Case Studiess:', 'na-theme'),
            'not_found'          => __('No Case Studies found.', 'na-theme'),
            'not_found_in_trash' => __('No Case Studies found in Trash.', 'na-theme')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('Description.', 'na-theme'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'case-study' ),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes')
        );

        register_post_type('case-study', $args);

        $labels = array(
            'name'                       => _x('Case Studiess', 'na-theme'),
            'singular_name'              => _x('Case Studiess', 'na-theme'),
            'search_items'               => __('Search Case Studiess'),
            'popular_items'              => __('Popular Case Studiess'),
            'all_items'                  => __('All Case Studiess'),
            'parent_item'                => null,
            'parent_item_colon'          => null,
            'edit_item'                  => __('Edit Case Studies'),
            'update_item'                => __('Update Case Studies'),
            'add_new_item'               => __('Add New Case Studies'),
            'new_item_name'              => __('New Case Studies'),
            'separate_items_with_commas' => __('Separate case-studies with commas'),
            'add_or_remove_items'        => __('Add or remove case-studies'),
            'choose_from_most_used'      => __('Choose from the most used case-studies'),
            'not_found'                  => __('No case-studies found.'),
            'menu_name'                  => __('Case Studiess'),
        );

        $args = array(
            'hierarchical'          => true,
            'labels'                => $labels,
            'show_ui'               => true,
            'show_admin_column'     => true,
            'update_count_callback' => '_update_post_term_count',
            'query_var'             => true,
            'rewrite'               => array( 'slug' => 'case-studies' ),
        );

        register_taxonomy('case-studies', 'case-study', $args);
    }
    public function shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'category' => '',
            'columns' => '3'
        ), $atts, 'case-studies-shortcode');
        $categories = (array)explode(",", $atts['category']);
        $args = array(
            'post_type' => 'case-study',
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );
        $field_type = is_numeric($categories[0]) ? 'term_id' : 'slug';
        if (!empty($atts['category'])) {
            $args = array(
                'post_type' => 'case-study',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'case-studies',
                        'field' => $field_type,
                        'terms' => $categories,
                    ),
                ),
                'orderby' => 'menu_order',
                'order' => 'ASC'
             );
        }
        $output = "";
        $query = new WP_Query($args);
        if ($query->have_posts()) {
            $output = '<ul class="na-case-studies na-case-studies-columns-'.$atts['columns'].'">';
            while ($query->have_posts()) {
                $query->the_post();
                $meta = $this->get_meta(get_the_ID(), 'case-studies');
                $style = array();
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $style[] = "background-image:url($image[0])";
                }
                $logos = array();
                if(isset($meta['logo'])){
                    foreach((array)$meta['logo']  as $logo){
                        $l = wp_get_attachment_image_src($logo, 'full');
                        if($l){
                            $logos[] = sprintf('<li><img src="%s" /></li>', $l[0]);
                        }
                    }
                }
                $output .= '<li>
                <div class="case-studies-inner">
                    <a data-id="'.get_the_ID().'" class="case-studies-image case-studies-button" style="'.implode(";", $style).'" href="'.get_the_permalink().'">
                        <span class="case-studies-text">
                            <span class="case-studies-header">
                                <h3 class="case-studies-title">'.get_the_title().'</h3>
                                '.(isset($meta['tagline']) && trim($meta['tagline']) != '' ? '<span class="case-studies-tagline">'.$meta['tagline'].'</span>':'').'
                            </span>
                            <span class="btn case-studies-link">'._('Learn more').'</span>
                        </span>
                    </a>
                    '.(!empty($logos) ? '<span class="case-studies-logo"><ul>'.implode('', $logos).'</ul></span>':'').'
                </div>
                </li>';
            }
            $output .= '</ul>';
        }
        wp_reset_postdata();
        return $output;
    }
    public function show_metabox($post)
    {
        ?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Tagline</label></th>
					<td><?php $this->_metabox_text($post->ID, 'tagline', 'case-studies'); ?>
					<p class="description">The tagline.</p></td>
				</tr>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Tagline</label></th>
					<td><?php $this->_metabox_image($post->ID, 'logo', 'case-studies'); ?>
					<p class="description">The logo.</p></td>
				</tr>
			</tbody>
		</table>
		<?php
    }
}
new Case_Studies_Shortcode();
?>
