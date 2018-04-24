<?php

require_once( ABSPATH . 'wp-admin/includes/class-walker-nav-menu-edit.php' );

class Na_Walker_Nav_Menu_Edit extends Walker_Nav_Menu_Edit {
  public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
    $item_id = esc_attr( $item->ID );

    parent::start_el( $output, $item, $depth, $args, $id);

    $slug = get_post_meta( $item_id, '_menu_item_hash_slug',true) ? true: false;
    $text = get_post_meta( $item_id, '_menu_item_hash_hash',true);
    $html = 'id="menu-item-settings-'.$item_id.'"><p class="field-hash-attribute field-attr-hash description description-wide">
					<label style="background-color:#EBF5F9;display:block;padding:8px" for="edit-menu-item-attr-hash-'.$item_id.'">'._( 'Hash Attribute' ).'<br />
						<input type="text" id="edit-menu-item-attr-hash-'.$item_id.'" class="widefat edit-menu-item-attr-hash" name="menu-item-attr-hash['.$item_id.'][hash]" value="'.$text.'" />
            <br />
						<label><input type="checkbox" id="edit-menu-item-attr-hash-slug-'.$item_id.'" class="widefat edit-menu-item-attr-hash" name="menu-item-attr-hash['.$item_id.'][slug]" '.($slug ? 'checked="checked"': '').'value="1" /> Use slug for hash</label><br/>
            <span class="description">'._( '- if set, it will open the link in the same page using javascript' ).'</span>
            <br/>
					</label>
				</p>';


    ob_start();
    do_action( 'wp_nav_menu_item_custom_fields', $item_id, $item, $depth, $args );
    $html .= ob_get_clean();
$output = $this->str_replace_first('id="menu-item-settings-'.$item_id.'">', $html, $output);
  }
  function str_replace_first($search, $replace, $subject) {
    $pos = strpos($subject, $search);
    if ($pos !== false) {
        return substr_replace($subject, $replace, $pos, strlen($search));
    }
    return $subject;
  }
}
add_action('wp_update_nav_menu', 'na_wp_update_nav_menu', 10, 1);
function na_wp_update_nav_menu($nav_menu_selected_id){
  if(isset($_POST['menu-item-attr-hash']) && is_array($_POST['menu-item-attr-hash'])){
    foreach($_POST['menu-item-attr-hash'] as $id => $value){
      if(isset($value['slug'])){
        $pst = get_post($id);
        update_post_meta( $id, '_menu_item_hash_slug', 1);
        delete_post_meta( $id, '_menu_item_hash_hash');
      }else{
        delete_post_meta( $id, '_menu_item_hash_slug');
        if(trim($value['hash']) != ""){
          update_post_meta( $id, '_menu_item_hash_hash', sanitize_title($value['hash']));
        }else{
          delete_post_meta( $id, '_menu_item_hash_hash');
        }
      }
    }
  }
}
add_filter('wp_edit_nav_menu_walker', 'na_edit_menu_walker', 10, 2);
function na_edit_menu_walker($walker, $menu_id){
  return 'Na_Walker_Nav_Menu_Edit';
}
add_filter('wp_get_nav_menu_items', 'na_wp_get_nav_menu_items', 10, 3);
function na_wp_get_nav_menu_items($items, $menu, $args){
  $object_ids = array();
  foreach($items as $item){
    $object_ids[] = $item->object_id;
  }
  $psts = get_posts(array('post_type' => 'any', 'post__in' => $object_ids));
  foreach($items as $item){
    foreach($psts as $pst){
      if($pst->ID == $item->object_id){
        $item->slug = $pst->post_name;
      }
    }
    if(is_user_logged_in()){
        $user = wp_get_current_user();
        $item->title = str_replace('{display_name}', $user->display_name, $item->title);
    }
  }

  return $items;
}
add_filter('nav_menu_link_attributes', 'na_nav_menu_link_attributes', 10, 4);
function na_nav_menu_link_attributes($atts, $item, $args, $depth){
  $slug = get_post_meta( $item->ID, '_menu_item_hash_slug', true);
  if($slug){
    if(isset($item->slug)){
      $atts['href'] = home_url('/')."#".$item->slug;
      $atts['data-anchor'] = $atts['href'];
      $atts['data-object'] = $item->object_id;
    }
  }else{
    $hash = get_post_meta( $item->ID, '_menu_item_hash_hash', true);
    if(trim($hash) != ""){
      $atts['href'] = '#'.str_replace('#', '', $hash);
      $atts['data-anchor'] = $atts['href'];
      $atts['data-object'] = $item->object_id;
    }
  }
  return $atts;
}
?>
