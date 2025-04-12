<?php

/**
 * The template for displaying the footer
 *
 * Contains the closing of the "site-content" div and all content after.
 *
 * @package WordPress
 * @subpackage Na_Theme
 * @since Na_Theme 1.0
 */
?>

<!-- Start footer -->
<footer class="site-footer">
    <?php include(locate_template('/inc/sidebars/footer.php')); ?>
    <div class="subfooter">
        <div class="px-4 mx-auto 2xl:container sm:px-6 lg:px-8">
            <?php
            /**
             * Fires before the footer text for footer customization.
             *
             */
            do_action('credits');
            ?>
        </div>
    </div>
</footer>
</div>
<!-- end #wrapper -->
<div id="searchform">
    <?php include(locate_template('/searchform.php'));?>
</div>
<?php wp_footer(); ?>
</body>

</html>