<?php
if (! function_exists('woocommerce_template_loop_product_thumbnail')) {
    /**
     * Get the product thumbnail for the loop.
     *
     * @subpackage	Loop
     */
    function woocommerce_template_loop_product_thumbnail()
    {
        global $post;
        if (has_post_thumbnail()) {
            $props = wc_get_product_attachment_props(get_post_thumbnail_id(), $post);
            echo sprintf('<div class="woocommerce-list-image" style="background-image:url(%s)" title="%s"></div>', $props['url'], $props['title']
            ) ;
        } elseif (wc_placeholder_img_src()) {
            echo sprintf('<div class="woocommerce-list-image" style="background-image:url(%s)" title="%s"></div>', wc_placeholder_img_src(), ''
            ) ;
        }
    }
}

add_filter('single_product_large_thumbnail_size', function ($size) {
    return 'full';
});


/*add_action('woocommerce_product_thumbnails', function () {
    global $product;
    $size = $product->get_attribute( 'Size' );
    $price = $product->get_attribute( 'Price' );
    $s = explode("|", $size);
    $sp = explode("|", $price);
    if(count($s)>0){
        ?>
    <ul class="size-attribute size-attribute-<?php echo count($s); ?>">
        <?php
        foreach($s as $key => $k){
            ?>
            <li>
                <?php echo trim($k); ?>
                    <?php echo isset($sp[$key]) ? ' - '.trim($sp[$key]): ''; ?>
            </li>
            <?php
        }
        ?>
    </ul>
    <?php
    }
}, 30);*/
/*add_action('woocommerce_before_shop_loop', function () {
    global $wp_query;
    $cat = $wp_query->get_queried_object();
    if ($cat instanceof WP_Term) {
        $children = array();
        if ($cat->taxonomy == 'product_tag') {
            $children = get_terms('product_tag', array(
            'hide_empty' => false,
        ));
        } else {
            $children = get_term_children($cat->term_id, $cat->taxonomy);
        }

        if ($children) {
            ?>
        <ul class="woocommerce-subterms">
            <li><span>By Health Concern</span></li>
            <?php
            foreach ($children as $child) {
                ?>
                <li><a class="<?php echo $cat->term_id == $child->term_id ? 'active': ''; ?>" href="<?php echo get_term_link($child->term_id);
                ?>"><?php echo $child->name;
                ?></a></li>
                <?php

            }
            ?>
        </ul>
        <?php

        }
    }
    if ($cat instanceof WP_Post_Type) {
        $children = array();
            $children = get_terms('product_tag', array(
            'hide_empty' => false,
        ));


        if ($children) {
            ?>
            <ul class="woocommerce-subterms">
                <li><span>By Health Concern</span></li>
                <?php
            foreach ($children as $child) {
                ?>
                    <li><a href="<?php echo get_term_link($child->term_id);
                ?>"><?php echo $child->name;
                ?></a></li>
                    <?php

            }
            ?>
            </ul>
            <?php

        }
    }
});*/
add_action('woocommerce_before_main_content', function () {
    ?>
                <div class="container">
                    <?php
});
add_action('woocommerce_after_main_content', function () {
    ?>
                </div>
                <?php
});
add_filter('woocommerce_product_tabs', function ($tabs) {
    unset($tabs['additional_information']);    // Remove the additional information tab
    $tabs['description']['title'] = "Ingredients";    // Remove the additional information tab

    return $tabs;
}, 98);
add_filter('woocommerce_currency_symbol', function ($currency_symbol, $currency) {
    switch ($currency) {
          case 'AED': $currency_symbol = 'AED'; break;
     }
    return $currency_symbol;
}, 10, 2);
add_filter( 'loop_shop_per_page', 'new_loop_shop_per_page', 20 );

function new_loop_shop_per_page( $cols ) {
  // $cols contains the current number of products per page based on the value stored on Options -> Reading
  // Return the number of products you wanna show per page.
  $cols = 32;
  return $cols;
}

remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');

remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart');
// remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
remove_action('woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30);
// remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
// add_filter( 'woocommerce_get_breadcrumb', '__return_false' );
function exclude_product_cat_children($wp_query) {
if ( isset ( $wp_query->query_vars['product_cat'] ) && $wp_query->is_main_query()) {
    $wp_query->set('tax_query', array( 
                                    array (
                                        'taxonomy' => 'product_cat',
                                        'field' => 'slug',
                                        'terms' => $wp_query->query_vars['product_cat'],
                                        'include_children' => false
                                    ) 
                                 )
    );
  }
}  
add_filter('pre_get_posts', 'exclude_product_cat_children');

// Change number or products per row to 3
add_filter('loop_shop_columns', 'loop_columns');
if (!function_exists('loop_columns')) {
	function loop_columns() {
		return 3; // 3 products per row
	}
}
//add_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_single_excerpt', 5);

?>