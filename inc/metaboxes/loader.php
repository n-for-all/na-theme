<?php

include_once(dirname(__FILE__)."/admin/post_columns.php");


abstract class NA_METABOXES {

	abstract protected function show_metabox($post);

	public $post_types = array('post', 'page');
	public $title = "";
	public $repeater = false;
	public $repeater_group = '';
	public $repeater_script = false;
	private $after_save = null;
	private $term_after_save = null;

	/**
	 * Hook into the appropriate actions when the class is constructed.
	 */
	public function __construct($post_types, $title) {

		$this->post_types = (array)$post_types;
		$this->title = $title;

		add_action( 'add_meta_boxes', array( &$this, 'add_meta_box' ) );
		add_action( 'save_post', array( &$this, 'save_data' ) );
		add_action( 'admin_enqueue_scripts', array(&$this, 'admin_enqueue_scripts'));
	}

	public function add_term_metabox($taxonomy){
		add_action( $taxonomy.'_add_form_fields', array(&$this, 'on_term_add'), 10, 2 );
		add_action( $taxonomy.'_edit_form_fields', array(&$this, 'on_term_update'), 10, 2 );
		add_action( 'created_'.$taxonomy, array(&$this, 'on_term_save'), 10, 2 );
		add_action( 'edited_'.$taxonomy, array(&$this, 'on_term_save'), 10, 2 );
	}
	public function on_term_add($taxonomy){}
	public function on_term_update($term, $taxonomy){}
	public function on_term_save($term_id, $term_taxonomy_id){
		$_meta = isset($_POST['_meta']) ? $_POST['_meta']: null;
		if(is_array($_meta) && sizeof($_meta) > 0) {
			foreach($_meta as $key => $value){
				update_term_meta( $term_id, '_meta_'.$key, $value );
			}
		}
		$_meta_na = isset($_POST['_meta_na']) ? $_POST['_meta_na']: null;
		if(is_array($_meta_na) && sizeof($_meta_na) > 0) {
			foreach($_meta_na as $key => $value){
				update_term_meta( $term_id, '_meta_na_'.$key, $value );
			}
		}

		if($this->term_after_save){
			call_user_func($this->term_after_save, $term_id, $_meta, $_meta_na);
		}
	}

	public function admin_enqueue_scripts(){
		wp_enqueue_media();
		wp_register_script('na-metabox', get_template_directory_uri() . '/inc/metaboxes/js/metabox.js', array('jquery'), '1.0.0');
        wp_enqueue_script('na-metabox');

		wp_register_style('na-metabox', get_template_directory_uri() . '/inc/metaboxes/css/styles.css', array(), '1.0', 'all');
        wp_enqueue_style('na-metabox');
	}
	/**
	 * Adds the meta box container.
	 */
	public function add_meta_box( $post_type ) {
		if ( in_array( $post_type, $this->post_types )) {
			$meta_box = array(
				'id' => 'page-settings',
				'page' => $post_type
			);
			add_meta_box(
				$meta_box['id']
				,$this->title
				,array( $this, '_inner_custom_box' )
				,$meta_box['page']
				,'advanced'
				,'high'
			);
			add_filter("postbox_classes_{$meta_box['page']}_{$meta_box['id']}", array(&$this, 'hook_meta_styles'), 1);
		}

	}
	function hook_meta_styles($classes){
		$classes[] = 'na-metabox';
		return $classes;
	}

	function after_save($callback) {
		$this->after_save = $callback;
	}
	function save_data($post_id) {

		// Check if our nonce is set.
		if ( ! isset( $_POST['na_metabox_inner_custom_box_nonce'] ) )
			return $post_id;

		$nonce = $_POST['na_metabox_inner_custom_box_nonce'];

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $nonce, 'na_metabox_inner_custom_box' ) )
		  return $post_id;

		// If this is an autosave, our form has not been submitted, so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
		  return $post_id;

		// Check the user's permissions.
		if ( 'page' == $_POST['post_type'] ) {

			if ( ! current_user_can( 'edit_page', $post_id ) )
				return $post_id;

		} else {

			if ( ! current_user_can( 'edit_post', $post_id ) )
				return $post_id;
		}

		/* OK, its safe for us to save the data now. */

		// Sanitize user input.
		$_meta = isset($_POST['_meta']) ? $_POST['_meta']: null;
		if(is_array($_meta) && sizeof($_meta) > 0) {
		// Update the meta field in the database.
			foreach($_meta as $key => $value){
				update_post_meta( $post_id, '_meta_'.$key, $value );
			}
		}
		$_meta_na = isset($_POST['_meta_na']) ? $_POST['_meta_na']: null;
		if(is_array($_meta_na) && sizeof($_meta_na) > 0) {
		// Update the meta field in the database.
			foreach($_meta_na as $key => $value){
				update_post_meta( $post_id, '_meta_na_'.$key, $value );
			}
		}

		if($this->after_save){
			call_user_func($this->after_save, $post_id, $_meta, $_meta_na);
		}
	}

	function create_nonce(){
		wp_nonce_field( 'na_metabox_inner_custom_box', 'na_metabox_inner_custom_box_nonce' );
	}
	function _inner_custom_box($post) {
		$this->create_nonce();
		/*
		* Use get_post_meta() to retrieve an existing value
		* from the database and use the value for the form.
		*/
		$this->show_metabox($post);
	}
	function _metabox_text($post_id, $_name, $group = ''){
		$p = $this->_metabox_text_value($post_id, $_name, $group, $this->repeater != '');
		if($group != ""){
			if($this->repeater){
				$name = "_meta[{$group}][{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta[{$group}][{$_name}]";
			}
		}else{
			if($this->repeater){
				$name = "_meta_na[{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta_na[{$_name}]";
			}
		}
		if($this->repeater){
			?><input type="text" value="{{{data.<?php echo $_name; ?>}}}" name="<?php echo $name; ?>" /><?php
		}else{
			?><input type="text" value="<?php echo $p; ?>" name="<?php echo $name; ?>" /><?php
		}
	}
	function _metabox_custom($post_id, $type, $_name, $group = ''){
		$p = $this->_metabox_text_value($post_id, $_name, $group, $this->repeater != '');
		if($group != ""){
			if($this->repeater){
				$name = "_meta[{$group}][{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta[{$group}][{$_name}]";
			}
		}else{
			if($this->repeater){
				$name = "_meta_na[{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta_na[{$_name}]";
			}
		}
		if($this->repeater){
			?><input type="<?php echo $type; ?>" value="{{{data.<?php echo $_name; ?>}}}" name="<?php echo $name; ?>" /><?php
		}else{
			?><input type="<?php echo $type; ?>" value="<?php echo $p; ?>" name="<?php echo $name; ?>" /><?php
		}
	}
	function _metabox_repeater_start($id, $group = '', $min = 0, $max = -1){

		if(!is_string($id) || $id == '' || !$id){
			throw new Exception('Repeater id must be a valid string');
		}
		$this->repeater_group = $group;
		$this->repeater = $id;
		?>
		<?php if(!$this->repeater_script): ?><script type="text/javascript">var repeater_values = [];</script><?php endif; ?>
			<div class="na-meta-repeater" data-repeater="<?php echo $this->repeater; ?>">
				<ul class="repeater-fields"></ul>
			</div>
			<script type="text/html" id="tmpl-repeater-<?php echo $this->repeater; ?>">
		<?php
		$this->repeater_script = true;
		return $this->repeater;
	}
	function _metabox_repeater_end(){
		global $post;
		$repeater_values = $this->_metabox_repeater_value($post->ID, $this->repeater, $this->repeater_group);
		?>
		</script>
		<script type="text/javascript">
			repeater_values[repeater_values.length] = {"id": "<?php echo $this->repeater; ?>", 'values': <?php echo json_encode($repeater_values); ?>};
		</script>
		<?php
		$this->repeater = null;
		$this->repeater_group = '';
	}
	function _metabox_checkbox($post_id, $label, $name, $group = ''){
		$p = $this->_metabox_text_value($post_id, $name, $group);
		if($group != ""){
			$name = "_meta[{$group}][{$name}]";
		}else{
			$name = "_meta_na[{$name}]";
		}
		?><label><input type="checkbox" <?php echo !empty($p) ? 'checked="checked"': ''; ?> value="1" name="<?php echo $name; ?>" /><?php echo $label; ?></label><?php
	}
	function _metabox_radio($post_id, $options, $name, $group = ''){
		$p = $this->_metabox_text_value($post_id, $name, $group);
		if($group != ""){
			$name = "_meta[{$group}][{$name}]";
		}else{
			$name = "_meta_na[{$name}]";
		}
		foreach($options as $key => $label):
		?><label><input type="radio" <?php echo $p == $key ? 'checked="checked"': '' ?> value="<?php echo $key; ?>" name="<?php echo $name; ?>" /><?php echo $label; ?></label> <?php
		endforeach;
	}
	function _metabox_select($post_id, $options, $name, $group = '', $multiple = false){
		$p = (array)$this->_metabox_select_value($post_id, $name, $group);
		if($group != ""){
			$name = "_meta[{$group}][{$name}]";
		}else{
			$name = "_meta_na[{$name}]";
		}
		if($multiple){
			$name = $name."[]";
		}
		?><select <?php echo $multiple ? 'multiple':''; ?> name="<?php echo $name; ?>"><?php
			foreach($options as $key => $label){
				?><option <?php echo (in_array($key, $p) ? 'selected="selected"':''); ?> value="<?php echo $key; ?>"><?php echo $label; ?></option>
				<?php
			}
			?>
		</select><?php
	}
	function _metabox_image($post_id, $name, $group = '', $multiple = true){
		$p = $this->_metabox_image_value($post_id, $name, $group);
		if($group != ""){
			$name = "_meta[{$group}][{$name}]";
		}else{
			$name = "_meta_na[{$name}]";
		}
		if($multiple){
			$name = $name."[]";
		}
		?>
		<div class="na-meta-image" data-multiple="<?php echo (int)$multiple; ?>" data-name="<?php echo $name; ?>">
			<div class="na-meta-msg"></div>
			<div class="na-meta-inner"><?php
			if($p) {
				if(is_array($p)){
					?><ul><?php
					foreach($p as $v){
					?>
					<li class="na-meta-image-item"><a class="na-meta-image-remove" href="#" onclick="jQuery(this).parent().remove();return false;">x</a><div class="na-meta-image-thumb"><div class="na-centered"><img src="<?php echo $v[0]; ?>" /></div><input type="hidden" name="<?php echo $name; ?>" class="na-meta-input" value="<?php echo $v[4]; ?>" /></div></li>
					<?php
					} ?></ul><?php
				}else{
					?><ul><?php
					$v = $p;
					?>
					<li class="na-meta-image-item"><a class="na-meta-image-remove" href="#" onclick="jQuery(this).parent().remove();return false;">x</a><div class="na-meta-image-thumb"><div class="na-centered"><img src="<?php echo $v[0]; ?>" /></div><input type="hidden" name="<?php echo $name; ?>" class="na-meta-input" value="<?php echo $v[4]; ?>" /></div></li>
					</ul><?php
				}
			}
			?></div>
			<button class="button button-secondary" disabled><?php $multiple ? _e('Add Images'): _e('Select Image'); ?></button>
		</div>
		<?php
	}
	function _term_metabox_custom($type, $_name, $group = '', $term_id = false){
		$p = '';
		if($term_id !== false){
			$p = $this->_metabox_term_text_value($term_id, $_name, $group);
		}
		if($group != ""){
			if($this->repeater){
				$name = "_meta[{$group}][{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta[{$group}][{$_name}]";
			}
		}else{
			if($this->repeater){
				$name = "_meta_na[{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta_na[{$_name}]";
			}
		}
		if($this->repeater){
			?><input type="<?php echo $type; ?>" value="{{{data.<?php echo $_name; ?>}}}" name="<?php echo $name; ?>" /><?php
		}else{
			?><input type="<?php echo $type; ?>" value="<?php echo $p; ?>" name="<?php echo $name; ?>" /><?php
		}
	}
	function _term_metabox_checkbox($_name, $group = '', $term_id = false){
		$p = '';
		if($term_id !== false){
			$p = $this->_metabox_term_text_value($term_id, $_name, $group);
		}
		if($group != ""){
			if($this->repeater){
				$name = "_meta[{$group}][{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta[{$group}][{$_name}]";
			}
		}else{
			if($this->repeater){
				$name = "_meta_na[{$this->repeater}][{{{data.index}}}][{$_name}]";
			}else{
				$name = "_meta_na[{$_name}]";
			}
		}
		if($this->repeater){
			?><input type="checkbox" <# data.<?php echo $_name; ?> == 1 ? 'checked="checked"': ''; #> value="1" name="<?php echo $name; ?>" /><?php
		}else{
			?><input type="checkbox" <?php echo $p == 1 ? 'checked="checked"': ''; ?> value="1" name="<?php echo $name; ?>" /><?php
		}
	}
	function _term_metabox_image($term_id, $name, $multiple = true, $group = ''){
        $p = false;
        if($term_id){
			$p = $this->_metabox_term_text_value($term_id, $name, $group);
		}
		if($group != ""){
			$name = "_meta[{$group}][{$name}]";
		}else{
			$name = "_meta_na[{$name}]";
		}
		if($multiple){
			$name = $name."[]";
		}
		
		?>
		<div class="na-meta-image" data-multiple="<?php echo (int)$multiple; ?>" data-name="<?php echo $name; ?>">
			<div class="na-meta-msg"></div>
			<div class="na-meta-inner"><?php
			if($p) {
				if(is_array($p)){
					?><ul><?php
					foreach($p as $v){
						$v = wp_get_attachment_image_src($p, 'thumbnail');
					?>
					<li class="na-meta-image-item"><a class="na-meta-image-remove" href="#" onclick="jQuery(this).parent().remove();return false;">x</a><div class="na-meta-image-thumb"><div class="na-centered"><img src="<?php echo $v[0]; ?>" /></div><input type="hidden" name="<?php echo $name; ?>" class="na-meta-input" value="<?php echo $p; ?>" /></div></li>
					<?php
					} ?></ul><?php
				}else{
					?><ul><?php
					$v = wp_get_attachment_image_src($p, 'thumbnail');

					?>
					<li class="na-meta-image-item"><a class="na-meta-image-remove" href="#" onclick="jQuery(this).parent().remove();return false;">x</a><div class="na-meta-image-thumb"><div class="na-centered"><img src="<?php echo $v[0]; ?>" /></div><input type="hidden" name="<?php echo $name; ?>" class="na-meta-input" value="<?php echo $p; ?>" /></div></li>
					</ul><?php
				}
			}
			?></div>
			<button class="button button-secondary" disabled><?php $multiple ? _e('Add Images'): _e('Select Image'); ?></button>
		</div>
		<?php
	}
	function _metabox_image_value($post_id, $name, $group = '', $size = 'thumbnail'){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$name}";
		}
		$output = array();
		if($a = get_post_meta($post_id, $meta_name, true)){
			if($group != ""){
				$a = isset($a[$name]) ? $a[$name]: '';
			}
			if(is_array($a)){
				foreach($a as $attachment_id){
					$image_attributes = wp_get_attachment_image_src( $attachment_id, $size ); // returns an array
					if( $image_attributes ) {
						$image_attributes[] = $attachment_id;
						$output[] = $image_attributes;
					}
				}
			}else{
				$image_attributes = wp_get_attachment_image_src( $a, $size ); // returns an array
				if( $image_attributes ) {
					$image_attributes[] = $a;
					$output = $image_attributes;
				}
			}
		}else{
			return false;
		}
		return $output;
	}
	function _metabox_select_value($post_id, $name, $group = ''){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$name}";
		}
		if($a = get_post_meta($post_id, $meta_name, true)){
			if($group != "" &&  isset($a[$name])){
				$a = $a[$name];
			}
			if(is_array($a)){
				return $a;
			}else{
				return (array)$a;
			}
		}
		return array();
	}
	function _metabox_text_value($post_id, $name, $group = '', $repeater = false){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$name}";
		}
		if($post_id && $a = get_post_meta($post_id, $meta_name, true)){
			if($group != ""){
				$a = isset($a[$name]) ? $a[$name] : '';
			}
			return $a;
		}
		return "";
	}
	function _metabox_term_text_value($term_id, $name, $group = '', $repeater = false){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$name}";
		}
		if($a = get_term_meta($term_id, $meta_name, true)){
			if($group != ""){
				$a = isset($a[$name]) ? $a[$name] : '';
			}
			return $a;
		}
		return "";
	}
	function _metabox_repeater_value($post_id, $id, $group = ''){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$id}";
		}
		if($a = get_post_meta($post_id, $meta_name, true)){
			if($group != ""){
				$a = isset($a[$id]) ? $a[$id] : '';
			}
			return $a;
		}
		return "";
	}
	protected function get_meta($post_id, $group = ''){
		$meta_name = '';
		$meta_name = "_meta_{$group}";
		if($a = get_post_meta($post_id, $meta_name, true)){
			return $a;
		}
		return "";
	}
	protected function get_term_meta($term_id, $taxonomy, $group = ''){
		$meta_name = '';
		$meta_name = "_meta_{$group}";
		if($a = get_term_meta($term_id, $meta_name, true)){
			return $a;
		}
		return "";
	}
	function get_meta_value($post_id, $name, $group = ''){
		$meta_name = '';
		if($group != ""){
			$meta_name = "_meta_{$group}";
		}else{
			$meta_name = "_meta_na_{$name}";
		}
		if($a = get_post_meta($post_id, $meta_name, true)){
			if($group != ""){
				$a = $a[$name];
			}
			return $a;
		}
		return "";
	}
}
/******************************
Example usage

function show_metabox must be implemented in the child class

class CNA_METABOXES extends NA_METABOXES{
	function show_metabox($post){
		?>
		<table class="form-table">
			<tbody>
				<tr class="form-field form-required term-name-wrap">
					<th scope="row"><label for="name">Choose images</label></th>
					<td><?php $this->_metabox_text($post->ID, 'test_txt', 'group'); ?>
					<p class="description">Choose your portfolio images, those images will appear in the portfolio page of your website.</p></td>
				</tr>
				<tr class="form-field term-slug-wrap">
					<th scope="row"><label for="slug">Slug</label></th>
					<td><?php $this->_metabox_image($post->ID, 'test_image', 'group'); ?>
					<p class="description">The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</p></td>
				</tr>
				<tr class="form-field term-parent-wrap">
					<th scope="row"><label for="parent">Parent</label></th>
					<td><?php $this->_metabox_select($post->ID, array('s', 's1', 's2', 's3'), 'test_select', 'group'); ?>
					<p class="description">The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</p>
					</td>
				</tr>
				<tr class="form-field term-description-wrap">
					<th scope="row"><label for="description">Description</label></th>
					<td><textarea name="description" id="description" rows="5" cols="50" class="large-text"></textarea>
					<p class="description">The description is not prominent by default; however, some themes may show it.</p></td>
				</tr>
			</tbody>
		</table>
		<?php
	}
}
new CNA_METABOXES(array('project', 'page'), 'test metabox');
***********************************/
?>
