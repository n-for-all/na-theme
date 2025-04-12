<?php

/**
 * Single Product tabs
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/tabs/tabs.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see 	https://docs.woocommerce.com/document/template-structure/
 * @author  WooThemes
 * @package WooCommerce/Templates
 * @version 2.4.0
 */
if (!defined('ABSPATH')) {
    exit;
}
/**
 * Filter tabs and allow third parties to add their own.
 *
 * Each tab is an array containing title, callback and priority.
 * @see woocommerce_default_product_tabs()
 */
$i = 0;
$tabs = apply_filters('woocommerce_product_tabs', array());
if (!empty($tabs)) : ?>
    <script>
        var wooTabs = {
            tab: '',
            init: function() {
                var me = this;
                var checkHash = function() {
                    var hash = window.location.hash;
                    if (hash) {
                        var handler = hash.replace('#!', '').split('/');
                        if (handler.length > 0 && handler[0] == 'tabs' && handler[1]) {
                            me.tab = handler[1];
                        }
                    }
                };
                window.addEventListener('hashchange', checkHash);
                checkHash();
            },
            isSelected: function(tab, index) {
                return this.tab === tab || (this.tab == '' && index == 0);
            },
        };
    </script>
    <div class="mb-5 woocommerce-tabs wc-tabs-wrapper" x-data="wooTabs">
        <ul class="flex flex-wrap mb-2 space-y-0 font-medium text-center list-none na-tabs na-wc-tabs dark:border-gray-700 dark:text-gray-400" role="tablist">
            <?php foreach ($tabs as $key => $tab) : ?>
                <li class="tab-nav mr-2 <?php echo esc_attr($key); ?>_tab" id="tab-title-<?php echo esc_attr($key); ?>" role="tab" aria-controls="tab-<?php echo esc_attr($key); ?>">
                    <a href="#!tabs/<?php echo esc_attr($key); ?>" class="inline-block p-4 text-gray-600 rounded-t-sm hover:bg-white hover:no-underline dark:bg-gray-800" :class="isSelected('<?php echo esc_attr($key); ?>', <?php echo "$i"; ?>) ? 'bg-white': ''"><?php echo apply_filters('woocommerce_product_' . $key . '_tab_title', esc_html($tab['title']), $key); ?></a>
                </li>
            <?php
                $i++;
            endforeach; ?>
        </ul>
        <?php 
        $i = 0;
        foreach ($tabs as $key => $tab) : ?>
            <div x-show="isSelected('<?php echo esc_attr($key); ?>', <?php echo "$i"; ?>)" class="p-4 bg-white <?php echo esc_attr($key); ?> <?php echo $i == 0 ? 'active' : '' ?>" role="tabpanel" aria-labelledby="tab-title-<?php echo esc_attr($key); ?>">
                <div class="tab-inner-content"><?php call_user_func($tab['callback'], $key, $tab); ?></div>
            </div>
        <?php
            $i++;
        endforeach; ?>
    </div>

<?php endif; ?>