<?php

namespace NaTheme\Inc\Metaboxes\Admin;

class PostColumn {
	
	/**
	 * Hook into the appropriate actions when the class is constructed.
	 */
	
	private $column = "";
	private $order = -1;
	public function __construct($column_name, $column_label, $column_type, $post_type = "post", $order = -1) {
		$this->column = array("name" => $column_name, "label" => $column_label, "type" => $column_type);
		$this->order = $order;
		switch($post_type){
			case "post":
				$filter = "manage_posts_columns";
				$action = "manage_posts_custom_column";
				break;
			case "page":
				$filter = "manage_pages_columns";
				$action = "manage_pages_custom_column";
				break;
			default:
				$filter = "manage_{$post_type}_posts_columns";
				$action = "manage_{$post_type}_posts_custom_column";
		}
		add_filter($filter, array(&$this, 'head'));
		add_filter($action, array(&$this, 'content'), 10, 2);
	}
	
	function head($defaults) {
		if($this->column) {
			$defaults[$this->column["name"]] = $this->column["label"];
		}
		return $this->_order($defaults, $this->column);
	}
 
	function _order($defaults, $column) {
		if($this->order < 0 || $this->order >= sizeof($defaults)){
			$defaults[$this->column["name"]] = $this->column["label"];
			return $defaults;
		}
		$i = 0;
		
		$out = array();
		foreach($defaults as $key => $value) {	
			if ($i == $this->order){
				$out[$column['name']] = $column['label'];
			}
			$out[$key] = $value;
			$i ++;
		}
		return $out;
	}
	
	function content($column_name, $post_id) {
		if ($column_name == $this->column["name"]) {
			$this->show_content( $this->column, $post_id);
		}
	}
	function show_content($column, $post_id){
		// to be overrriden to show content
	}
}

/************************************
Example Usage

Show post thumbnail on the list of posts

class NA_POST_IMAGE extends NA_POST_COLUMN { 
	function show_content($column, $post_id) {
		if(has_post_thumbnail($post_id)) {
			echo get_the_post_thumbnail( $post_id );
		}
	}
}
$NA_POST_IMAGE = new NA_POST_IMAGE("slides-image", "Slides", "image", "slider", 2);
************************************/
?>