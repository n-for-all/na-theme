<?php

global $theme;

$count = 0;
$sidebars = array('footer-1', 'footer-2', 'footer-3', 'footer-4', 'footer-5', 'footer-6', 'footer-7', 'footer-8');
foreach($sidebars as $sidebar) {
	$count += intval(is_active_sidebar( $sidebar ));
}

$columns = $count > 0 ? intval(12/$count): 0;
$options = get_option('na_sidebars');
if(!$options){
	$options = array();
}
?>
<section class="footer-widgets widget-area">
	<div class="container">
		<?php if($theme->logo_footer): ?>
		    <div class="row">
		      <div class="col-md-12"><div class="sidebar sidebar-logo"><a href="<?php echo home_url("/"); ?>"><img src="<?php echo esc_url( $theme->logo_footer ); ?>" alt="" /></div></a></div>
		    </div>
		<?php endif; ?>
		<?php if($count > 0) :
			$create_row = true;
			$end_row = false;
			$col_count = 0;
			$row_count = 1;
			?>
			<?php foreach($sidebars as $sidebar) { ?>
				<?php if ( is_active_sidebar( $sidebar ) ) {
						$cols = isset($options[$sidebar]) ? $options[$sidebar][0]: $columns;
						$col_count += $cols;

						if($col_count > 12){
							echo '</div>';
							$col_count = 0;
							$create_row = true;
						}
						if($create_row){
							echo sprintf('<div class="row row-%s">', $row_count);
							$create_row = false;
							$row_count ++;
						}
					?>
					<div class="col-lg-<?php echo $cols; ?> col-sm-<?php echo $cols >= 6 ? '12': $cols; ?> col-xs-12">
						<div class="sidebar <?php echo $sidebar; ?>">
					  		<?php dynamic_sidebar($sidebar); ?>
						</div>
					</div>
				<?php } ?>
			<?php } ?>
			<?php echo '</div>'; ?>
		<?php endif; ?>
	</div>
</section>
