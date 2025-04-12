<?php

global $naTheme;

$count = 0;
$sidebars = array('footer-1', 'footer-2', 'footer-3', 'footer-4', 'footer-5', 'footer-6', 'footer-7', 'footer-8');
foreach ($sidebars as $sidebar) {
    $count += intval(is_active_sidebar($sidebar));
}

$columns = $count > 0 ? intval(12 / $count) : 4;
?>

<section class="pt-8 bg-white site-footer">
    <div class="px-4 py-4 mx-auto 2xl:container sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:gap-24 lg:pb-14">
            <div class="block w-full lg:max-w-full max-lg:mx-auto">
                <div class="flex flex-col w-full gap-8 lg:max-w-xs ">
                    <?php if ($naTheme->logo_footer) : ?>
                        <a href="<?php echo home_url("/"); ?>"><img src="<?php echo esc_url($naTheme->logo_footer); ?>" alt="" /></a>
                    <?php endif; ?>
                    <?php dynamic_sidebar('footer-1'); ?>
                </div>
            </div>
            <div
                class="flex flex-col w-full col-span-2 gap-6 mx-auto lg:flex-row lg:justify-between sm:gap-10 xl:gap-24">
                <?php if (is_active_sidebar('footer-2')) : ?>
                    <div class="flex-1 footer-2">
                        <?php dynamic_sidebar('footer-2'); ?>
                    </div>
                <?php endif; ?>
                <?php if (is_active_sidebar('footer-3')) : ?>
                    <div class="flex-1 footer-3">
                        <?php dynamic_sidebar('footer-3'); ?>
                    </div>
                <?php endif; ?>
                <?php if (is_active_sidebar('footer-4')) : ?>
                    <div class="flex-1 footer-4">
                        <?php dynamic_sidebar('footer-4'); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <?php if (is_active_sidebar('footer-5') || is_active_sidebar('footer-6') || is_active_sidebar('footer-7')) : ?>
        <div class="bg-white border-t border-gray-200">
            <div class="px-4 py-2 mx-auto 2xl:container sm:px-6 lg:px-8">
                <div class="flex flex-col-reverse items-center justify-between gap-5 md:flex-row first-letter:items-center">
                    <?php if (is_active_sidebar('footer-5')) : ?>
                        <div class="text-sm font-normal"><?php dynamic_sidebar('footer-5'); ?></div>
                    <?php endif; ?>
                    <?php if (is_active_sidebar('footer-6')) : ?>
                        <div class="text-sm font-normal"><?php dynamic_sidebar('footer-6'); ?></div>
                    <?php endif; ?>
                    <?php if (is_active_sidebar('footer-7')) : ?>
                        <div class="text-sm font-normal"><?php dynamic_sidebar('footer-7'); ?></div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <?php if (is_active_sidebar('footer-8')) : ?>
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8"><?php dynamic_sidebar('footer-8'); ?></div>
    <?php endif; ?>
</section>