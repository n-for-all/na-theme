<?php

global $naTheme;

$count = 0;
$sidebars = array('footer-1', 'footer-2', 'footer-3', 'footer-4', 'footer-5', 'footer-6', 'footer-7', 'footer-8');
foreach ($sidebars as $sidebar) {
    $count += intval(is_active_sidebar($sidebar));
}

$columns = $count > 0 ? intval(12 / $count) : 4;
?>
<section class="footer-widgets widget-area">
    <div class="container">
        <?php if ($naTheme->logo_footer) : ?>
            <div class="row">
                <div class="col-md-12">
                    <div class="sidebar sidebar-logo"><a href="<?php echo home_url("/"); ?>"><img src="<?php echo esc_url($naTheme->logo_footer); ?>" alt="" /></div></a>
                </div>
            </div>
        <?php endif; ?>
        <?php if ($count > 0) :
            $create_row = true;
            $end_row = false;
            $col_count = 0;
            $row_count = 0;

            $template = [];
        ?>
            <?php foreach ($sidebars as $key => $sidebar) { ?>
                <?php if (is_active_sidebar($sidebar)) {
                    $id = $key + 1;
                    $current = $naTheme->{"footer_$id"};
                    $cols = $current ? $current : $columns;
                    $col_count += $cols;

                    if ($col_count > 12) {
                        $col_count = $cols;
                        $row_count++;
                    }
                    ob_start();
                    dynamic_sidebar($sidebar);
                    $content = ob_get_clean();
                    $template[$row_count][] = sprintf('<div class="col-lg-%s col-sm-%s col-xs-12 d-flex align-items-center">
                        <div class="sidebar %s">
                            %s
                        </div>
                    </div>', $cols, $cols >= 6 ? '12' : $cols, $sidebar, $content);
                } ?>
            <?php }
            foreach ($template as $row => $columns) {
                echo sprintf('<div class="row row-%s">%s</div>', $row + 1, implode("\n", $columns));
            }
            ?>
        <?php endif; ?>
    </div>
</section>