<?php

/**
 * Class to allow wrapping of shortcodes via popup
 */

class Na_Popup
{
    private $popup_shortcodes = [];
    function __construct(){
        add_shortcode( 'na_popup',  array(&$this, 'shortcode_popup') );
        add_shortcode( 'popup',  array(&$this, 'shortcode_popup') );
        add_action('wp_enqueue_scripts', array($this, 'scripts'));
        add_action('wp_footer', array($this, 'footer'));

        add_action('wp_ajax_popup', array($this, 'get_popup'));
        add_action('wp_ajax_nopriv_popup', array($this, 'get_popup'));
    }
    public function get_popup()
    {
        $output = array('status' => 'failure');
        $id = intval($_POST['id']);
        if ($id > 0) {
            global $post;
            $post = get_post($id);
            if($post){
                setup_postdata($post);
                $image = false;
                if (has_post_thumbnail()) {
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                }
                $pst = array(
                    'title' => get_the_title(),
                    'type' => $post->post_type,
                    'meta' => get_post_meta($post),
                    'content' => apply_filters('the_content', get_the_content()),
                    'image' => $image ? $image[0] : ''
                );
                $output = array('status' => 'success', 'post' => $pst);
            }
        }
        echo json_encode($output);
        die();
    }

    public function shortcode_popup($atts, $content){
        $atts = shortcode_atts( array(
            'title' => "",
            'name' => "",
            'template' => false,
            'width' => '500px'
        ), $atts );
        $output = do_shortcode($content);
        $output = '<div style="width:'.$atts['width'].'" id="popup-'.sanitize_title($atts['name']).'" class="popup"><a class="close-popup" href="#">&times;</a><div class="popup-content">'.$output.'</div></div>';
        $this->popup_shortcodes[] = array($output, $atts['template'] ? sanitize_title($atts['template']): false, sanitize_title($atts['name']));
        return '';
    }

    public function footer(){
        $_templates = array('general' => 'popup');
        ?>
        <script id="tmpl-popup" type="text/template">
            <?php include('template/popup.php'); ?>
        </script>

        <?php
        foreach($this->popup_shortcodes as $shortcode){
            if($shortcode[1]){
                $template = locate_template('inc/popup/template/'.$shortcode[1].'.php');
                if($template != ''){
                    $_templates[$shortcode[2]] = 'popup-'.$shortcode[1];
                ?>
                    <script id="tmpl-popup-<?php echo $shortcode[1]; ?>" type="text/template">
                        <?php include( $template ); ?>
                    </script>
                <?php }
            }
            echo $shortcode[0];
        }
        ?>
        <script type="text/javascript">
            var PopupSettings = <?php echo json_encode(array('url' => admin_url('admin-ajax.php'), 'templates' => $_templates)); ?>;
        </script>
        <?php
    }
    public function scripts()
    {
        wp_enqueue_style('popup-shortcode', get_template_directory_uri() . '/inc/popup/css/styles.css', array(), '1.0.0', 'screen');
        wp_enqueue_script('popup-shortcode', get_template_directory_uri() . '/inc/popup/js/scripts.js', array());
    }
}
new Na_Popup();
?>
