<?php
class Na_Fonts_Control extends WP_Customize_Control {
  private $endpoint = 'https://www.googleapis.com/webfonts/v1/webfonts';
  private $key = 'AIzaSyDWnyGI4Ca5-Yqwb4Ou6gVUm_0-8qRzSmw';
  public function call() {
    $transient = get_transient( __CLASS__ .'_' . __FUNCTION__ );
    if( ! empty( $transient )) {
      return json_decode($transient);
    } else {
      $array = array();
      $out = wp_remote_get($this->endpoint.'?key='.$this->key);
      try{
        set_transient( __CLASS__ .'_' . __FUNCTION__, $out['body'], DAY_IN_SECONDS );
        $array = json_decode($out['body']);
      }catch(Exception $e){}
      return $array;
    }
  }
  public function choices(){
    $list = self::call();
    $choices = array();
    $choices[] = array('-- Select Font --', array());
    if(!empty($list) && isset($list->items)){
      foreach($list->items as $item){
        $choices[$item->family] = array($item->family, $item->variants); 
      }
    }
    return $choices;
  }
  public function render_content() {
    $choices = $this->choices();
		
		$x = array_keys($this->settings);
		$array = $this->value($x[1]);
	?>
	<div class="font-control-wrap">
		<script>
			if(typeof(window.na_settings) == "undefined"){
				window.na_settings = [];
			}
			window.na_settings[na_settings.length] = <?php echo json_encode(array("id" => $this->id, "select" => $x)); ?>;
			
			jQuery("body").trigger("font-control-ready");
		</script>
		<label><?php echo esc_html( $this->label[0] ); ?></label>
		<label>
			<span class="customize-control-title"><?php echo esc_html( $this->label[1] ); ?></span>
			<select id="<?php echo $x[0]; ?>" class="font-family" <?php $this->link($x[0]); ?>>
				<?php
					foreach ( $choices as $value => $label ) {
						$selected = (  $value == $this->value($x[0]) ) ? selected( 1, 1, false ) : '';
						echo '<option variants="'.implode(',', $label[1]).'" value="' . esc_attr( $value ) . '"' . $selected . '>' . $label[0] . '</option>';
					}
				?>
			</select>
		</label>
		<label>
			<span class="customize-control-title"><?php echo esc_html( $this->label[2] ); ?></span>
      <select id="<?php echo $x[1]; ?>" class="font-variants" <?php $this->link($x[1]); ?> style="width:100%" multiple>
				<?php foreach($array as $key => $value): ?>
				<option value="<?php echo $key; ?>"><?php echo $value; ?></option>
				<?php endforeach; ?>
			</select>
		</label>
</div>
	<?php }
}
?>