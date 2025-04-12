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
            echo sprintf(
                '<a href="%s" class="block w-full overflow-hidden bg-center bg-cover aspect-video" style="background-image:url(%s)" title="%s"></a>',
                get_the_permalink(),
                $props['src'],
                $props['title']
            );
        } elseif (wc_placeholder_img_src()) {
            echo sprintf(
                '<a href="%s" class="block w-full overflow-hidden bg-center bg-cover aspect-video" style="background-image:url(%s)"></a>',
                get_the_permalink(),
                wc_placeholder_img_src()
            );
        }
    }
}

add_filter('single_product_large_thumbnail_size', function ($size) {
    return 'full';
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

add_filter('woocommerce_currency_symbol', function ($currency_symbol, $currency) {
    switch ($currency) {
        case 'AED':
            $currency_symbol = 'AED';
            break;
    }

    return $currency_symbol;
}, 10, 2);

add_filter('body_class', function ($classes) {
    $classes[] = 'woocommerce-block-theme-has-button-styles';
    return $classes;
});

remove_action('woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');
remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart');

remove_action('woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40);
add_action('woocommerce_single_product_summary', 'woocommerce_template_single_meta', 15);
function exclude_product_cat_children($wp_query)
{
    if (isset($wp_query->query_vars['product_cat']) && $wp_query->is_main_query()) {
        $wp_query->set(
            'tax_query',
            array(
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

remove_action('woocommerce_shop_loop_item_title', 'woocommerce_template_loop_product_title', 10);
add_action('woocommerce_shop_loop_item_title', function () {
    echo sprintf('<h2 class="mb-4" title="%s"><a href="%s">%s</a></h2>', esc_html(get_the_title()), get_the_permalink(), get_the_title());
}, 10);

// a fix for photswipe when the image data is not read correctly
add_filter('woocommerce_gallery_image_html_attachment_image_params', function ($imageParams, $attachment_id, $image_size, $main_image) {
    if ($imageParams['data-large_image_width'] == 0 || $imageParams['data-large_image_height'] == 0) {
        list($width, $height) = @getimagesize($imageParams['data-src']);
        $imageParams['data-large_image_width'] = $width > 0 ? $width : 1000;
        $imageParams['data-large_image_height'] = $height > 0 ? $height : 1000;
    }
    return $imageParams;
}, 10, 4);
add_action('woocommerce_before_main_content',  function () {
?>
    <div class="px-4 py-4 mx-auto 2xl:container sm:px-6 lg:px-8">
    <?php
}, 10);
add_action('woocommerce_after_main_content',  function () {
    ?>
    </div>
<?php
}, 10);


remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
remove_action('woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30);

add_action('woocommerce_before_shop_loop', function () {
?>
    <div class="flex flex-col justify-between mb-5 lg:items-center lg:flex-row">
        <div class=""><?php woocommerce_result_count(); ?></div>
        <div class="mt-2 lg:mt-0"><?php woocommerce_catalog_ordering(); ?></div>
    </div>
<?php
}, 20);

function wk_custom_product_filter()
{
    global $wp_query;
    $product_colors = get_terms(array(
        'taxonomy' => 'pa_color',
        'hide_empty' => false,
    ));
?>
    <div class="col-md-3 col-sm-3 col-xs-12">
        <form method="get" class="flex flex-col space-y-3">
            <select name="product_color">
                <option value="">Filter by Color</option>
                <?php foreach ($product_colors as $color) : ?>
                    <option value="<?php echo esc_attr($color->slug); ?>"><?php echo esc_html($color->name); ?></option>
                <?php endforeach; ?>
            </select>
            <input type="hidden" name="post_type" value="product" />
            <label class="inline-flex items-center mb-5 cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer">
                <div class="relative w-11 h-6 bg-gray-50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">Toggle me</span>
            </label>

            <label class="inline-flex items-center mb-5 cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer" checked>
                <div class="relative w-11 h-6 bg-gray-50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">Checked toggle</span>
            </label>

            <label class="inline-flex items-center mb-5 cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer" disabled>
                <div class="relative w-11 h-6 bg-gray-50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="text-sm font-medium text-gray-900 ms-3 dark:text-gray-300">Disabled toggle</span>
            </label>
            <button type="submit" class="btn btn-outline">Filter</button>
        </form>
    </div>
<?php
}
add_action('woocommerce_after_shop_loop_item_title', function () {
?>
    <div class="text-sm text-gray-600 md:text-base md:max-w-5xl">
        <?php echo get_the_excerpt(); ?>
    </div>
<?php
}, 20);
add_action('woocommerce_after_shop_loop_item_title', function () {
?>
    <div class="flex items-center justify-between mt-5">
        <?php
        woocommerce_template_loop_add_to_cart();
        ?>
    </div>
<?php
}, 20);
add_filter('woocommerce_enqueue_styles', function ($items) {
    // unset($items['woocommerce-layout']);
    // unset($items['woocommerce-general']);
    return $items;
})
?>