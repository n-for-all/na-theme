<?php

/**
 * Main menu
 */
?>
<?php if (has_nav_menu('primary')) : ?>
    <!-- Start nav-collapse -->
    <div class="absolute left-0 items-center hidden w-full ml-0 bg-white shadow-lg lg:shadow-none lg:h-full navbar-collapse md:flex md:relative md:top-0 top-full md:bg-transparent" :class="{'hidden':!open}">
        <div class="items-center justify-between w-full lg:h-full collapse-inner md:flex">
            <?php
            // Primary navigation menu.
            wp_nav_menu(array(
                'menu_class'     => 'nav nav-menu bg-white nav-primary md:flex md:mr-auto lg:ml-10 lg:h-full space-y-0',
                'theme_location' => 'primary',
                'container'            => ''
            ));
            if (has_nav_menu('primary-right')) :
                // Primary navigation menu.
                wp_nav_menu(array(
                    'menu_class'     => 'nav nav-menu navbar-right nav-primary-right md:flex md:ml-2 mt-5 md:mt-0 px-4 md:px-0 h-full',
                    'theme_location' => 'primary-right',
                    'container'            => ''
                ));
            endif; ?>

        </div>
        <?php do_action('na-theme.nav.primary.after'); ?>
    </div>
<?php elseif (has_nav_menu('primary-right')) : ?>
    <!-- Start nav-collapse -->
    <div class="absolute left-0 items-center hidden w-full ml-0 ml-auto bg-white shadow-lg lg:shadow-none lg:h-full navbar-collapse md:flex md:relative md:top-0 top-full md:w-auto md:bg-transparent" :class="{'hidden':!open}'>
        <div class="items-center h-full md:flex collapse-inner">
            <?php
            // Primary navigation menu.
            wp_nav_menu(array(
                'menu_class'     => 'nav nav-menu navbar-right nav-primary-right md:flex space-x-3 ml-auto lg:h-full space-y-0',
                'theme_location' => 'primary-right',
                'container'            => ''
            ));
            ?>
        </div>
        <?php do_action('na-theme.nav.primary-right.after'); ?>
    </div>
<?php endif; ?>