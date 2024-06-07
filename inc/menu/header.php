<?php

/**
 * Main menu
 */
?>
<?php if (has_nav_menu('primary')) : ?>
    <!-- Start nav-collapse -->
    <div class="absolute left-0 items-center hidden w-full ml-0 ml-auto bg-white navbar-collapse md:flex md:relative md:top-0 top-full md:w-auto md:bg-transparent" :class="{'hidden':!open}">
        <div class="items-center md:flex collapse-inner">
            <?php
            // Primary navigation menu.
            wp_nav_menu(array(
                'menu_class'     => 'nav nav-menu nav-primary md:flex md:ml-auto mr-2',
                'theme_location' => 'primary',
                'container'            => ''
            ));
            if (has_nav_menu('primary-right')) :
                // Primary navigation menu.
                wp_nav_menu(array(
                    'menu_class'     => 'nav nav-menu navbar-right nav-primary-right md:flex md:space-x-3 md:ml-2 mt-5 md:mt-0 px-4 md:px-0',
                    'theme_location' => 'primary-right',
                    'container'            => ''
                ));
            endif; ?>

        </div>
        <?php do_action('na-theme.nav.primary.after'); ?>
    </div>
<?php elseif (has_nav_menu('primary-right')) : ?>
    <!-- Start nav-collapse -->
    <div class="absolute left-0 items-center hidden w-full ml-0 ml-auto bg-white navbar-collapse md:flex md:relative md:top-0 top-full md:w-auto md:bg-transparent" :class="{'hidden':!open}'>
        <div class="items-center md:flex collapse-inner">
            <?php
            // Primary navigation menu.
            wp_nav_menu(array(
                'menu_class'     => 'nav nav-menu navbar-right nav-primary-right md:flex space-x-3 ml-auto',
                'theme_location' => 'primary-right',
                'container'            => ''
            ));
            ?>
        </div>
        <?php do_action('na-theme.nav.primary-right.after'); ?>
    </div>
<?php endif; ?>