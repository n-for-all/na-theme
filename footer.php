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
    </div>
    <!-- .site-content -->
    <!-- Start footer -->
    <footer class="site-footer">
        <?php include('inc/sidebars/footer.php'); ?>
        <section class="subfooter">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                    <?php
                        /**
                         * Fires before the footer text for footer customization.
                         *
                         */
                        do_action( 'credits' );
                    ?>
                    </div>
                </div>
            </div>
        </section>
    </footer>
    <div id="searchform"> <a href="#" class="search-close">&#215; close</a>
        <?php echo get_search_form(); ?>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
