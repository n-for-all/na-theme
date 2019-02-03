<?php
if (!function_exists('woocommerce_template_loop_product_thumbnail')) {
    /**
     * Get the product thumbnail for the loop.
     */
    function woocommerce_template_loop_product_thumbnail()
    {
        global $post;
        if (has_post_thumbnail()) {
            $props = wc_get_product_attachment_props(get_post_thumbnail_id(), $post);
            echo sprintf('<a href="%s" class="woocommerce-list-image" style="background-image:url(%s)" title="%s"></a>', get_the_permalink(), $props['src'], $props['title']
            );
        } elseif (wc_placeholder_img_src()) {
            echo sprintf('<div class="woocommerce-list-image" style="background-image:url(%s)" title="%s"></div>', wc_placeholder_img_src(), ''
            );
        }
    }
}

add_filter('single_product_large_thumbnail_size', function ($size) {
    return 'full';
});

add_filter('default_checkout_billing_country', function ($_fields) {
    return 'AE';
});
add_filter('default_checkout_shipping_country', function ($_fields) {
    return 'AE';
});
add_filter('woocommerce_checkout_fields', function ($_fields) {
    $fields = &$_fields['billing'];
    $fields['billing_country'] = array_replace($fields['billing_country'], array(
        'type' => 'select',
        'options' => array(
            'AE' => __('United Arab Emirates'),
        ),
        'class' => array('form-row-first', 'address-field', 'update_totals_on_change'),
    ));
    $billing_city = $fields['billing_city'] = array_replace($fields['billing_city'], array(
        'type' => 'select',
        'options' => array(
            'Dubai' => __('Dubai'),
            'Abu Dhabi' => __('Abu Dhabi', 'wps'),
            'Ajman' => __('Ajman', 'wps'),
            'Fujairah' => __('Fujairah', 'wps'),
            'Ras al-Khaimah' => __('Ras al-Khaimah', 'wps'),
            'Sharjah' => __('Sharjah', 'wps'),
            'Umm al-Quwain' => __('Umm al-Quwain', 'wps'),
        ),
        'priority' => 45,
        'class' => array('form-row-last', 'address-field'),
    ));
    unset($fields['billing_city']);
    $fields = array_insert($fields, array('billing_city' => $billing_city), 'billing_country');

    unset($fields['billing_state']);
    unset($fields['billing_postcode']);
    unset($fields['billing_company']);

    $fields['billing_phone']['required'] = true;

    $shipping_fields = &$_fields['shipping'];
    unset($shipping_fields['shipping_state']);

    return $_fields;
});

function array_insert($arr, $insert, $_position)
{
    if (is_string($_position)) {
        $position = array_search($_position, array_keys($arr));
    }
    $i = 0;
    foreach ($arr as $key => $value) {
        $ret[$key] = $value;
        if ($i == $position) {
            $ret = array_merge($ret, $insert);
        }
        ++$i;
    }

    return $ret;
}

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
// add_filter('woocommerce_product_tabs', function ($tabs) {
//     unset($tabs['additional_information']);    // Remove the additional information tab
//     $tabs['description']['title'] = "Ingredients";    // Remove the additional information tab
//
//     return $tabs;
// }, 98);
add_filter('woocommerce_currency_symbol', function ($currency_symbol, $currency) {
    switch ($currency) {
          case 'AED': $currency_symbol = 'AED'; break;
     }

    return $currency_symbol;
}, 10, 2);
add_filter('loop_shop_per_page', 'new_loop_shop_per_page', 20);

function new_loop_shop_per_page($cols)
{
    // $cols contains the current number of products per page based on the value stored on Options -> Reading
    // Return the number of products you wanna show per page.
    $cols = 32;

    return $cols;
}

remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');

remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart');
// remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
// remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
// add_filter( 'woocommerce_get_breadcrumb', '__return_false' );
function exclude_product_cat_children($wp_query)
{
    if (isset($wp_query->query_vars['product_cat']) && $wp_query->is_main_query()) {
        $wp_query->set('tax_query', array(
                                    array(
                                        'taxonomy' => 'product_cat',
                                        'field' => 'slug',
                                        'terms' => $wp_query->query_vars['product_cat'],
                                        'include_children' => false,
                                    ),
                                 )
    );
    }
}
add_filter('pre_get_posts', 'exclude_product_cat_children');

// Change number or products per row to 3
add_filter('loop_shop_columns', 'loop_columns');
if (!function_exists('loop_columns')) {
    function loop_columns()
    {
        return 3; // 3 products per row
    }
}
//add_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_single_excerpt', 5);
/**
 *
 * Action to show all products under product cat if the product category is the parent
 *
 * @var [type]
 */

add_action('parse_query', function (&$query) {
    if (!is_admin() || !is_home() || !is_single()) {
        if ($query->is_main_query() && $query->is_archive()) {
            $queried_object = get_queried_object();
            $term_id = $queried_object->term_id;
            $tax_query = [];
            if ($queried_object && 0 == $queried_object->parent) {
                $query->set('posts_per_page', 9);
                $query->query_vars['product_cat'] = '';
                unset($query->query_vars['product_cat']);

                $tax_query[] =
                    array(
                        'taxonomy' => 'product_cat',
                        'field' => 'id',
                        'terms' => [1],
                        'operator' => 'NOT IN',
                        'include_children' => true,
                    )
                ;

                $query->set('tax_query', $tax_query);
                $query->set('post_type', 'product');
            }
        }
    }
}, 1);

?>
