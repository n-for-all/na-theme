<?php
/**
 * The template used for displaying page content
 *
 * @package WordPress
 * @subpackage Twenty_Sixteen
 * @since Twenty Sixteen 1.0
 */
global $theme, $post;
?>
<?php
/**
 * Featured Image
 */
$featured_image = $theme->get_post_thumbnail(null, 'full');
?>
<h3 class="fixed page-fixed-title">THE ART OF LIVING, WELL</h3>
<div class="inner-section <?php echo $featured_image? 'has-featured-image': ''; ?>">
	<header class="<?php $theme->classes('header', 'entry-header'); ?>">
		<?php
		if($featured_image):
		?>
		<figure class="entry-image" style="background-image:url(<?php echo $featured_image; ?>)">
			<img src="<?php echo $featured_image; ?>" />
		</figure>
		<?php endif; ?>
		<div class="entry-title-container">
			<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
		</div>
	</header><!-- .entry-header -->
	<?php
	$args = array(
		'post_parent' => get_the_ID(),
		'post_type'   => 'page',
		'posts_per_page' => -1,
		'post_status' => 'publish',
		'orderby'			=> 'menu_order',
		'order'	=> 'ASC'
	);
	$_children = get_posts( $args );
	$i = 0;
	$start_scroller = false;
	global $_class, $theme;
	if($_children && sizeof($_children) > 0){
	foreach($_children as $post){
		//print_r($post);
		setup_postdata($post);
		$_class = 'section ';
		$_class .= $i % 2 == 0 ? 'even' : 'odd';
		$_class .= " section-scroll section-".$post->post_type;
		$_class .= " ".$theme->get_template_part($post->ID, 'content-page-notitle');
		$_class .= " subsection";

		$extraClass = get_post_meta($post->ID, '_wp_section_class', true);
		if($extraClass){
			$_class .= " ".$extraClass;
		}
		$background = $theme->get_post_thumbnail($post, 'full');
		if($background){
			$_class .= " has-post-thumbnail";
		}
		?>
		<section data-index="<?php echo $i; ?>" id="section-<?php echo $theme->get_section_id($post->ID, $post->post_name); ?>" class="<?php echo $_class; ?>" style="<?php echo $background ? 'background-image:url('.$background.');': '' ?>">
			<div class="full-height <?php echo $theme->get_template_layout($post->ID, 'container'); ?>">
				<?php get_template_part( 'template-parts/'.$theme->get_template_part($post->ID, 'content-page-notitle'));
				?>
			</div>
		</section>
		<?php
		$i ++;
	}

	wp_reset_postdata();
}else{
	?>
	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<?php if(function_exists('bcn_display')){ ?>
			<div class="breadcrumb">
				<?php  bcn_display(); ?>
			</div>
		<?php } ?>
		<div class="entry-content <?php echo $theme->get_template_layout(get_the_ID(), 'container'); ?>">
			<div class="entry-inner-content">
				<?php
				the_content();

				?>
			</div>
		</div><!-- .entry-content -->

	</article><!-- #post-## -->
<?php } ?>
</div>
<script>
jQuery(document).ready(function() {
	var logo = jQuery('#main-nav-collapse').eq(0);
	var title = jQuery('.page-fixed-title').eq(0);
	var toggle = null, toggle_title = null;
	var bounds = {top: logo.offset().top + logo.height()/3, bottom: logo.offset().top + logo.height() - logo.height()/3};
	var title_bounds = {top: title.offset().top + title.height()/3, bottom: title.offset().top + title.height() - title.height()/3};
	var jElements = jQuery('section');
	jQuery('section').each(function() {
		if(jQuery(this).hasClass('light')){
			this._light = true;
			jElements.push(this);

		}
		jQuery(this).css('height', jQuery(window).height() + 'px');
	})
	var scrollHandler = new window.scrollHandler(jElements, function(elements, viewport) {
		var new_toggle = null, new_toggle_title = null;
		jQuery(elements).each(function(_index, element){
			var top = element.offsetTop - viewport.top;
			var bottom = top + element.clientHeight;
			if(top < bounds.bottom && bounds.top < bottom){
				new_toggle = element;
			}
			if(top < title_bounds.bottom && title_bounds.top < bottom){
				new_toggle_title = element;
			}
		});
		if(toggle != new_toggle && new_toggle){
			if(new_toggle._light) {
				logo.addClass('slight');
			}else{
				logo.removeClass('slight');
			}
		}
		if(toggle_title != new_toggle_title && new_toggle_title){
			if(new_toggle_title._light) {
				title.addClass('slight');
			}else{
				title.removeClass('slight');
			}
		}
		if(!new_toggle){
			logo.removeClass('slight');
		}
		if(!new_toggle_title){
			title.removeClass('slight').addClass('hide');
		}else{
			title.removeClass('hide');
		}
		toggle = new_toggle;
	}, '#main >.inner-section')
});
</script>
