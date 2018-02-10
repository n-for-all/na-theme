<?php

class Na_Theme_Shortcodes {
	function __construct(){
		add_shortcode( 'services',  array(&$this, 'services_shortcode') );
		add_shortcode( 'na_product_categories',  array(&$this, 'product_categories_shortcode') );
		add_shortcode( 'na_distributers',  array(&$this, 'distributers_shortcode') );
		add_shortcode( 'na_pages',  array(&$this, 'pages_shortcode') );
		add_shortcode( 'na_events',  array(&$this, 'events_shortcode') );
		add_shortcode( 'na_events_list',  array(&$this, 'events_list_shortcode') );
		add_shortcode( 'na_recent_events',  array(&$this, 'recent_event') );
		add_shortcode( 'na_menu_items',  array(&$this, 'menu_items_shortcode') );
		add_shortcode( 'services-list',  array(&$this, 'services_list_shortcode') );
	}
	public function distributers_shortcode($atts){
		$atts = shortcode_atts( array(
			'ids' => "",
		), $atts, 'events' );
		$args = array('post_type' => 'distributer', 'posts_per_page' => -1, 'order' => 'ASC', 'meta_key' => 'country',
            'orderby' => 'meta_value',);
		if($atts['ids']){
			$args['post__in'] = explode(",", $atts['ids']);
		}
		$pages = get_posts( $args );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($pages) && count($pages) > 0){
			foreach($pages as $page){
				$thumbnail_id = get_post_thumbnail_id($page->ID);
				$header = '';
				$subtitle = get_post_meta($page->ID, 'sub_title', true);
				if($subtitle){
					$subtitle = '<span class="subtitle">'.$subtitle.'</span>';
				}
				$country = get_post_meta($page->ID, 'country', true);
				if($country){
					$country = '<span data-slug="'.sanitize_title($country).'" class="country">'.$country.'</span>';
				}
				$phone_1 = get_post_meta($page->ID, 'phone_1', true);
				if($phone_1){
					$header .= '<label><i class="fa fa-phone"></i><span class="phone_1">'.$phone_1.'</span></label>';
				}
				$phone_2 = get_post_meta($page->ID, 'phone_2', true);
				if($phone_2){
					$header .= '<label><i class="fa fa-phone"></i><span class="phone_2">'.$phone_2.'</span></label>';
				}
				$email = get_post_meta($page->ID, 'email', true);
				if($email){
					$email = explode(",", $email);
					$email = array_map(function($value){
						return '<a href="mailto:'.$value.'" class="email"><i class="fa fa-envelope"></i>'.$value.'</a>';
					}, $email);
					$header .= '<label>'.implode(" ", $email).'</label>';
				}
				$name = get_post_meta($page->ID, 'contact_name', true);
				if($name){
					$header .= '<label><i class="fa fa-user"></i><span class="name">'.$name.'</span></label>';
				}
				$website = get_post_meta($page->ID, 'website', true);
				if($website){
					$header .= '<label><i class="fa fa-earth"></i><a href="http://'.ltrim($website, 'http://').'">'.$website.'</a></label>';
				}
		        $image = wp_get_attachment_url($thumbnail_id);
				$menu[] = '<li id="'.sanitize_title($country).'">'.$country.'<h3>'.$page->post_title. ($subtitle ? $subtitle : "").'</h3><div class="na-distributer-content">'.$header.'</div></li>';
			}
		}
		$output .= '<section class="na-product-distributers" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-distributers-list">'.implode("", $menu)."</ul></div></div></div></section>
		<script>jQuery(document).ready(function(){ var countries = []; jQuery('.country').each(function(){ countries[jQuery(this).data('slug')] =jQuery(this).html(); });
		var keys = []; for(var key in countries) keys.push(key);
    	keys = keys.sort();
for(var index in keys){
	jQuery('#countries').append('<option value=\"'+keys[index]+'\">'+countries[keys[index]]+'</option>');
}
var ocountry = '';
jQuery('body').on('change', '#countries', function(){
	jQuery(ocountry).removeClass('active');
	var country = jQuery(this).find('option:selected').val();
	jQuery('.na-product-distributers-list').addClass('filtering');
	jQuery('body, html').animate({scrollTop: jQuery('#'+country).offset().top - 150}, 1500);
	jQuery('#'+country).addClass('active');
	ocountry = '#'+country;
});
	});</script>
		";

		wp_reset_postdata();
		return $output;
	}
	public function product_categories_shortcode($atts){
		$atts = shortcode_atts( array(
			'ids' => "",
		), $atts, 'events' );

		$terms = get_terms( 'product_cat', array(
		    'hide_empty' => false,
		) );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($terms) && count($terms) > 0){
			foreach($terms as $term){
				$thumbnail_id = get_woocommerce_term_meta($term->term_id, 'thumbnail_id', true);
		        // get the image URL for parent category
		        $image = wp_get_attachment_url($thumbnail_id);
				$menu[] = '<li><a href="'.get_term_link($term).'" style="background-image:url('.$image.')"><div><h3>'.$term->name.'</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
			}
		}
		$output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">'.implode("", $menu)."</ul></div></div></div></section>";

		wp_reset_postdata();
		return $output;
	}
	public function menu_items_shortcode($atts){
		$atts = shortcode_atts( array(
			'menu' => "",
			'parent' => -1
		), $atts, 'menu_items' );
		$args = array();
		if($atts['parent'] > 0){
			$args['menu_item_parent'] = $atts['parent'];
		}

		$menu_name = $atts['menu'];
		$locations = get_nav_menu_locations();
		$menu_id = $locations[ $menu_name ] ;

		$menu = wp_get_nav_menu_object( $menu_id, $args  );
		$items = wp_get_nav_menu_items( $menu_id );

		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($items) && count($items) > 0){
			foreach($items as $item){
				if($args['menu_item_parent'] && $args['menu_item_parent'] == $item->menu_item_parent){
					$menu[] = $this->show_menu_items($item);
				}elseif(!isset($args['menu_item_parent'])){
					$menu[] = $this->show_menu_items($item);
				}
			}
		}
		$output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">'.implode("", $menu)."</ul></div></div></div></section>";

		wp_reset_postdata();
		return $output;
	}
	public function show_menu_items($item){
		$menu = '';
		if($item->type == 'post_type'){
			$thumbnail_id = get_post_thumbnail_id($item->object_id);
			$image = wp_get_attachment_url($thumbnail_id);
			$menu = '<li><a href="'.get_permalink($item->object_id).'" style="background-image:url('.$image.')"><div><h3>'.$item->title.'</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
		}elseif($item->type == 'taxonomy'){
			$image = '';
			if($item->object == 'product_cat'){
				$thumbnail_id = get_woocommerce_term_meta($item->object_id, 'thumbnail_id', true);
				$image = wp_get_attachment_url($thumbnail_id);
			}
			// get the image URL for parent category
			$menu = '<li><a href="'.get_term_link(intval($item->object_id), $item->object).'" style="background-image:url('.$image.')"><div><h3>'.$item->title.'</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
		}elseif($item->type == 'custom'){
			$image = '';
			// get the image URL for parent category
			$menu = '<li><a href="'.$item->url.'" style="background-image:url('.$image.')"><div><h3>'.$item->title.'</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
		}
		return $menu;
	}
	public function pages_shortcode($atts){
		$atts = shortcode_atts( array(
			'ids' => "",
		), $atts, 'events' );

		$pages = get_posts( array('post_type' => 'page', 'post__in' => explode(",", $atts['ids']) ));
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($pages) && count($pages) > 0){
			foreach($pages as $page){
				$thumbnail_id = get_post_thumbnail_id($page->ID);
		        $image = wp_get_attachment_url($thumbnail_id);
				$menu[] = '<li><a href="'.get_permalink($page->ID).'" style="background-image:url('.$image.')"><div><h3>'.$page->post_title.'</h3><span class="btn btn-default btn-lg">View Products</span></div></a></li>';
			}
		}
		$output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">'.implode("", $menu)."</ul></div></div></div></section>";

		wp_reset_postdata();
		return $output;
	}
	public function events_shortcode($atts){
		$atts = shortcode_atts( array(
			'ids' => "",
		), $atts, 'events' );
		$args = array('post_type' => 'event' );
		if($atts['ids']){
			$args['post__in'] = explode(",", $atts['ids']);
		}
		$pages = get_posts( $args );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($pages) && count($pages) > 0){
			foreach($pages as $page){
				$thumbnail_id = get_post_thumbnail_id($page->ID);
		        $image = wp_get_attachment_url($thumbnail_id);
				$menu[] = '<li><div style="background-image:url('.$image.')"><div><h3>'.$page->post_title.'</h3>'.apply_filters('the_content', $page->post_content).'</div></div></li>';
			}
		}
		$output .= '<section class="na-product-categories" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-categories-list">'.implode("", $menu)."</ul></div></div></div></section>";

		wp_reset_postdata();
		return $output;
	}
	public function recent_event($atts){
		$atts = shortcode_atts( array(
			'id' => "",
		), $atts, 'events' );
		$args = array('post_type' => 'event', 'orderby' => 'date', 'order' => 'DESC', 'posts_per_page' => 1  );
		if($atts['id']){
			$args['tax_query'] = array(
				array(
					'taxonomy' => 'events',
					'field' => 'id',
					'terms' => $atts['id']
				)
			);
		}
		$pages = get_posts( $args );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		$image = "";
		if(!is_wp_error($pages) && count($pages) > 0){
			foreach($pages as $page){
				$thumbnail_id = get_post_thumbnail_id($page->ID);
		        $image = wp_get_attachment_url($thumbnail_id);
		        $logo = get_field('logo', $page->ID);
				$menu[] = '<div><h3>'.$page->post_title.'</h3><img src="'.$logo['url'].'" /><br/><br/>'.apply_filters('the_content', $page->post_content).'</div>';
			}
		}
		$output .= '
		<section id="our-events">
		<div class="container-fluid">
			<div class="row row-flex">
				<div class="col-md-6 col-sm-6 col-xs-12 event-image" style="background-image:url('.$image.')"></div>
				<div class="col-md-6 col-sm-6 col-xs-12"><div class="event-content">'.implode("", $menu).'</div>
				</div>
			</div>
			<div class="row row-cta">
				<div class="col-md-12"><a href="/events" class="btn btn-lg btn-green">View all events</a></div>
			</div>
		</div>
		</section>';

		wp_reset_postdata();
		return $output;
	}
	public function events_list_shortcode($atts){
		$atts = shortcode_atts( array(
			'parent' => "",
		), $atts, 'events' );
		$args = array('hide_empty' => false );
		if($atts['parent']){
			$args['parent'] = $atts['parent'];
		}
		$pages = get_posts( $args );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		$terms = get_terms( 'events', $args );
		$output = "";
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		if(!is_wp_error($terms) && count($terms) > 0){
			foreach($terms as $term){
				$thumbnail = get_field('image', $term->taxonomy."_".$term->term_id);
				$menu[] = '<li><div style="background-image:url('.$thumbnail['url'].')"><div><h3>'.$term->name.'</h3><a class="btn btn-default" href="'.get_term_link($term->term_id).'">View Events</a></div></div></li>';
			}
		}
		$output .= '<section class="na-product-events" ><div class="container-fluid"><div class="row"><div class="col-md-12"><ul class="na-product-events-list">'.implode("", $menu)."</ul></div></div></div></section>";

		wp_reset_postdata();
		return $output;
	}
	public function services_list_shortcode($atts){
		$atts = shortcode_atts( array(
			'ids' => "",
		), $atts, 'events' );
		$ids = explode(",", $atts['ids']);
		$args = array(
			 'posts_per_page' => -1,
			 'post_type' => 'service',
			 'post__in' => $ids,
			 'post_status' => 'publish'
		);
		$menu = array();
		//$services = get_posts( $args );
		$inner = "";
		foreach($ids as $id){
			$service = get_post($id);
			$icon = get_field('icon', $service->ID, true);
			$menu[] = '<li><a href="'.get_permalink($service->ID).'"><img src="'.$icon['url'].'" alt="icon-allergy" class="alignnone size-full wp-image-49" ><span>'.$service->post_title.'</span></a></li>';
		}
		$output .= '<ul class="services-list">'.implode("", $menu)."</ul>";
		$count ++;

		wp_reset_postdata();
		return $output;
	}
	protected function services_shortcode($atts){
		$atts = shortcode_atts( array(
			'per_page' => -1,
			'term_count' => 10
		), $atts, 'events' );
		$terms = get_terms('department', array(
			'number' => $atts['term_count']
		));
		$output = "";
		$count = 0;

		$output = '<div class="department-services">';
		if(is_wp_error($terms)){
			return;
		}
		foreach($terms as $term){
			$output .= '<div class="department-'.($count != 0 ? $count % 2 == 0 ? "yellow" : "green" : "blue").'">';
			$args = array(
				 'posts_per_page' => $atts['per_page'],
				 'post_type' => 'service',
				 'department' => $term->slug,
				 'post_status' => 'publish'
			);
			$menu = array();
			$services = get_posts( $args );
			$inner = "";
			foreach($services as $service){
				$menu[] = '<li><a href="#service-'.$service->ID.'"><img src="/wp-content/uploads/2016/02/icon-allergy.png" alt="icon-allergy" class="alignnone size-full wp-image-49" style="border-radius: 50%;background-color: #1ea49c;height:90px;padding:10px"><br/>'.$service->post_title.'</a></li>';
				$inner .= '<article id="service-'.$service->ID.'" class="'.implode(' ', get_post_class('', $service->ID)).'">';
				if($thumb_id = has_post_thumbnail($service->ID) && false){
					$image = wp_get_attachment_image_src(get_post_thumbnail_id($service->ID), 'medium');
					$inner .= '<div class="row"><div class="col-md-4"><img src="'.$image[0].'" /></div><div class="col-md-8"><h3><a href="'.get_permalink($service->ID).'">'.apply_filters('the_title', $service->post_title).'</a></h3>';
					$inner .= $service->post_content ;
					$inner .= '</div></div>';
				}else{
					$inner .= '<div class="row"><div class="col-md-12"><a href="#" class="service-more">Read More</a><h3><a href="'.get_permalink($service->ID).'">'.apply_filters('the_title', $service->post_title).'</a></h3>';
					$inner .= '<div class="description">'.$service->post_content.'</div>';
					$inner .= '</div></div>';
				}
				$inner .= '</article>';
			}
			$output .= '<div id="department-'.$term->term_id.'" class="tab tab-'.$count.'">';
			$output .= '<h1 class="title department-title">'.$term->name.'</h1>';
			$output .= '<ul class="tab-menu tab-department">'.implode("", $menu).'</ul><div class="tab-content">'.$inner."</div>";
			$output .= '</div>';
			$count ++;
		}
		$output .= "</div>";
		wp_reset_postdata();
		return $output;
	}
}
//initialize the shortcodes
new Na_Theme_Shortcodes();
?>
