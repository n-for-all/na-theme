<?php

namespace NaTheme\Inc\Tools\Image;

class Image
{
    public function __construct()
    {
        add_action('admin_enqueue_scripts', [$this, 'scripts']);
        add_filter('getimagesize_mimes_to_exts', [$this, 'getimagesize_mimes_to_exts'], 10, 1);
        add_filter('wp_check_filetype_and_ext', [$this, 'wp_check_filetype_and_ext'], 10, 5);
        add_action('print_media_templates', array(&$this, 'print_media_templates'));
        add_action('wp_ajax_save_pasted_image', array(&$this, 'save_image'));
    }

    /**
     * Enqueue scripts and styles.
     *
     * @date 2022-10-04
     *
     * @return void
     */
    function scripts()
    {
        wp_enqueue_script('image-editor-script', get_template_directory_uri() . '/inc/tools/image/js/script.js', array('media'), '1.0.0', true);
    }

    public function getimagesize_mimes_to_exts($mimes)
    {
        return array_merge($mimes, array(
            'image/svg+xml' => 'svg',
        ));
    }

    public function wp_check_filetype_and_ext($return, $file, $filename, $mimes, $real_mime)
    {
        if ($return['ext'] === false) {
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if ($ext === 'svg') {
                $return['ext'] = 'svg';
                $return['type'] = 'image/svg+xml';
            }
        }
        return $return;
    }
    public function create_file($string)
    {
        $tmpfname = tempnam(sys_get_temp_dir(), 'svg');
        $fileObj = fopen($tmpfname, "w+");
        fwrite($fileObj, wp_unslash($string));
        \fclose($fileObj);
        return [
            'tmp_name' => $tmpfname,
            'size' => filesize($tmpfname),
            'type' => 'image/svg+xml',
            'error' => 0
        ];
    }
    public function save_image()
    {
        $type = in_array($_POST['type'], ['svg', 'png']) ? $_POST['type'] : 'png';
        $file = ($type == 'svg' ? $this->create_file($_POST['image']) : $_FILES['image']);
        $name = $_POST['name'];
        $title = $_POST['title'];
        if (!$name || trim($name) == "") {
            $name = \uniqid();
        } else {
            $name = sanitize_title($name);
        }

        if (empty($file) || !is_array($file) || $file['size'] == 0) {
            \wp_send_json(['status' => 'error', 'message' => 'Image data is empty']);
        } else {
            $filename = $name . '.' . $type;
            if (!function_exists('wp_handle_sideload')) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
            }

            if (!function_exists('wp_get_current_user')) {
                require_once(ABSPATH . 'wp-includes/pluggable.php');
            }


            $file['name'] = $filename;
            $allowed_mimes = array(
                'svg'            => 'image/svg+xml',
                'jpg|jpeg|jpe'   => 'image/jpeg',
                'gif'            => 'image/gif',
                'png'            => 'image/png',
            );

            $file_return = wp_handle_sideload($file, array(
                'test_form' => false,
                'mimes'        => $allowed_mimes,
                // 'unique_filename_callback' => array($this, 'rename_uploaded_file'),
            ), current_time('mysql'));

            if (isset($file_return['error'])) {
                \wp_send_json(['status' => 'error', 'message' => $file_return['error']]);
                die();
            }
            $filename = $file_return['file'];
            $attachment = array(
                'post_mime_type' => $file_return['type'],
                'post_title' => preg_replace('/\.[^.]+$/', '', $title && trim($title) != '' ? $title : basename($filename)),
                'post_content' => '',
                'post_status' => 'inherit',
                'guid' => $file_return['url']
            );

            $id = wp_insert_attachment($attachment, $filename);

            if ('png' === $type) {
                $attach_data = wp_generate_attachment_metadata($id, $filename);
                wp_update_attachment_metadata($id, $attach_data);
            }

            $src = wp_get_attachment_image_src($id, 'full');
            \wp_send_json([
                'status' => 'success', 'message' => 'Image saved successfully',
                "url" => $src[0],
                "width" => $src[1],
                "height" => $src[2],
                "name" => $name,
                "title" => $attachment['post_title'],
                "id" => $id
            ]);
        }
        die();
    }

    public static function rename_uploaded_file($dir, $name, $ext)
    {
        return \uniqid() . '-' . $name;
    }

    public function print_media_templates()
    {
?>
        <style>
            .media-toolbar-pasteimage {
                padding: 0 16px;
                display: flex;
                align-items: center;
                height: 72px;
            }

            .media-toolbar-pasteimage h4 {
                margin-right: 1rem;
            }

            #media-image-edit {
                background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwcHgiIGhlaWdodD0iMTAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgZmlsbD0iI0U2RTZFNiIgeD0iMCIgeT0iMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIj48L3JlY3Q+PHJlY3QgZmlsbD0iI0U2RTZFNiIgIHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIj48L3JlY3Q+PC9zdmc+') repeat top left/20px;
                background-size: 20px;
                display: flex;
                justify-content: center;
                cursor: default;
                color: transparent;
            }
        </style>
        <script type="text/html" id="tmpl-naimage-details">
            <div class="media-toolbar media-toolbar-pasteimage">
                <h4>Press CTRL + V or CMD + V to paste the image</h4>
                <span class="spinner"></span>
            </div>
            <div tabindex="-1" class="attachments" id="media-image-edit" contenteditable="true" oncut="return false" onpaste="return false" onkeydown="if(event.metaKey) return true; return false;">
            </div>
            <div class="media-sidebar">
            </div>
        </script>
        <script type="text/html" id="tmpl-naimage-details-item">
            <div class="attachment-preview js--select-attachment landscape" data-value="{{data.value}}">
                <div class="thumbnail">
                    <div class="centered">
                        <img src="<?php echo wp_mime_type_icon('archive'); ?>" class="icon" draggable="false" alt="">
                    </div>
                    <div class="filename">
                        <div>{{ data.label }}</div>
                    </div>
                </div>
            </div>
            <button type="button" class="check" tabindex="0">
                <span class="media-modal-icon"></span><span class="screen-reader-text">Deselect</span>
            </button>
        </script>
        <script type="text/html" id="tmpl-naimage-details-item-details">
            <h2>
                <?php _e('IMAGE Details'); ?>
            </h2>
            <span class="setting" data-setting="title">
                <label for="naimage-details-title" class="name"><?php _e('Title'); ?></label>
                <input type="text" id="naimage-details-title" value="{{ data.label }}" />
            </span>
            <span class="setting" data-setting="name">
                <label for="naimage-details-name" class="name"><?php _e('Name'); ?></label>
                <input type="text" id="naimage-details-name" value="{{ data.name }}" />
            </span>
            <span class="setting" data-setting="width">
                <label for="naimage-details-width" class="name"><?php _e('Width'); ?></label>
                <input type="text" id="naimage-details-width" value="{{ data.width }}" readonly />
            </span>
            <span class="setting" data-setting="height">
                <label for="naimage-details-height" class="name"><?php _e('Height'); ?></label>
                <input type="text" id="naimage-details-height" value="{{ data.height }}" readonly />
            </span>
            <span class="setting" data-setting="url">
                <label for="naimage-details-copy-link" class="name"><?php _e('File URL:'); ?></label>
                <input type="text" class="naimage-details-copy-link" id="naimage-details-copy-link" value="{{ data.value }}" readonly />
            </span>
            <div class="copy-to-clipboard-container">
                <button type="button" class="button button-primary button-save" data-clipboard-target="#naimage-details-copy-link"><?php _e('Save Image'); ?></button>
            </div>
        </script>
<?php
    }
}
