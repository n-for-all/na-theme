<?php

if (!defined('ABSPATH')) {
    exit;
}

$products = wc_get_products($args);
?>

<div class="mt-8 md:px-6 xl:px-0 lg:mt-16">
    <div class="flex flex-col justify-between mb-4 lg:items-center lg:flex-row md:mb-6">
        <div>
            <h2 class="mb-5 font-extrabold text-gray-900 md:mb-4"><?php echo $title; ?></h2>
            <p class="text-sm text-gray-600"><?php echo $description; ?>
            </p>
        </div>
        <div class="">
            <a href="/shop" class="inline-flex items-center gap-2 px-6 py-3 text-sm text-gray-900 transition-all duration-500 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100">
                <span>
                    View All Plugins
                </span>
                <svg class="w-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </a>
        </div>
    </div>
    <div class="grid items-center grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <?php foreach ($products as $product) :
        ?>
            <div class="w-full h-full gap-2 px-4 py-4 transition-all duration-300 bg-white border border-gray-300 rounded-sm hover:-translate-y-1">
                <a class="flex flex-col text-gray-800 lg:flex-row lg:items-center hover:no-underline" href="<?php echo get_permalink($product->get_id()); ?>">
                    <?php $image = wp_get_attachment_image_src(get_post_thumbnail_id($product->get_id()), 'large'); ?>
                    <span class="flex flex-shrink-0 w-full bg-center bg-cover lg:w-48 aspect-video" style="background-image: url(<?php echo $image[0]; ?>)" alt="product image">
                    </span>
                    <span class="mt-5 lg:mt-0 lg:ml-4">
                        <h3 class="mb-3 text-base font-bold lg:text-lg font-alt">
                            <?php echo $product->get_title(); ?>
                        </h3>
                        <span class="flex items-center gap-3 text-red-900">
                            <?php if ($product->get_price() > 0): ?>
                                <span class="text-xl font-bold lg:text-lg">
                                    <?php echo get_woocommerce_currency_symbol() . wc_format_decimal($product->get_price(), 2); ?>
                                </span>
                                <?php if ($product->get_sale_price() > 0 && $product->get_sale_price() < $product->get_regular_price()): ?>
                                    <span class="text-xl text-gray-500 line-through strike lg:text-lg"><?php echo get_woocommerce_currency_symbol() . wc_format_decimal($product->get_sale_price(), 2); ?></span>
                                <?php endif; ?>
                            <?php else: ?>
                                <span class="text-xl font-bold lg:text-lg">
                                    Free
                                </span>
                            <?php endif; ?>
                        </span>
                    </span>
                </a>
            </div>
        <?php endforeach; ?>
    </div>

</div>