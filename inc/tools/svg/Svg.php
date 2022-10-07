<?php

namespace NaTheme\Inc\Tools\Svg;

class Svg
{
    public function __construct()
    {
        add_filter('wp_prepare_attachment_for_js', [$this, 'prepare_svg'], 10, 3);
        add_filter('wp_generate_attachment_metadata', [$this, 'metadata'], 10, 3);
        add_filter('wp_calculate_image_srcset', [$this, 'disable_srcset']);
        add_filter('wp_get_attachment_image_src', [$this, 'dimension_fallback'], 10, 4);

        add_filter('upload_mimes', [$this, 'upload_mimes'], 99);
        add_filter('wp_check_filetype_and_ext', [$this, 'upload_check'], 10, 4);
        add_filter('wp_check_filetype_and_ext', [$this, 'allow_svg_upload'], 10, 4);
        add_action('rest_api_init', [$this, 'rest_api_init']);

        add_action('admin_enqueue_scripts', [$this, 'scripts']);
        add_filter('image_downsize', [$this, 'image_downsize'], 10, 3);
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
        wp_enqueue_script('svg-editor', get_template_directory_uri() . '/inc/tools/svg/js/editor.js', array('media'), '1.0.0', true);
    }


    /**
     * Return always the same image whatever the size requested is
     *
     * @date 2022-10-06
     *
     * @param string $out
     * @param string $id
     * @param string $size
     *
     * @return array
     */
    function image_downsize($out, $id, $size)
    {
        $mime = get_post_mime_type($id);
        if ($mime == 'image/svg+xml') {
            $file = get_attached_file($id);
            $dimensions = self::get_dimensions($file);
            return [
                \wp_get_attachment_url($id),
                $dimensions['width'],
                $dimensions['height'],
                false
            ];
        }
        return $out;
    }

    /**
     * Register rest api endpoints
     *
     * @date 2022-10-04
     *
     * @return void
     */
    function rest_api_init()
    {
        register_rest_route('wp/v2', '/svg/(?P<id>[\d]+)', array(
            'methods' => 'POST',
            'callback' => [$this, 'save_svg'],
            'permission_callback'   => function () {
                return current_user_can('manage_options');
            }
        ));
    }

    /**
     * Save the SVG after editing
     *
     * @date 2022-10-04
     *
     * @param \WP_REST_Request $request
     *
     * @return \WP_REST_Response
     */
    public function save_svg($request)
    {
        $id = $request->get_param('id');
        $content = $request->get_param('content');
        $attachment = \get_attached_file($id);
        try {
            $result = \file_put_contents($attachment, $content);
            if ($result === false) {
                if (!is_writable($attachment)) {
                    if (rename($attachment, $attachment . "-backup")) {
                        $result = \file_put_contents($attachment, $content);
                        if ($result === false) {
                            return new \WP_REST_Response(array('status' => 'error', 'message' => 'The server don\'t have enough permission to overwrite or rename this file.'), 200);
                        }
                    }
                    return new \WP_REST_Response(array('status' => 'error', 'message' => 'The server don\'t have enough permission to overwrite this file.'), 200);
                }
                return new \WP_REST_Response(array('status' => 'error', 'message' => 'Writing the file failed'), 200);
            }
        } catch (\Exception $e) {
            return new \WP_REST_Response(array('status' => 'error', 'message' => $e->getMessage()), 200);
        }
        return new \WP_REST_Response(array('status' => 'success', 'message' => 'SVG content is updated'), 200);
    }

    /**
     * Prepare SVG for JS, return svg size always if not set
     *
     * @date 2022-10-04
     *
     * @param array    $response
     * @param \WP_POST $attachment
     * @param array    $meta
     *
     * @return array
     */
    function prepare_svg($response, $attachment, $meta)
    {
        if ($response['mime'] == 'image/svg+xml' && empty($response['sizes'])) {
            $svg_path = get_attached_file($attachment->ID);

            if (!file_exists($svg_path)) {
                $svg_path = $response['url'];
            }

            $dimensions = self::get_dimensions($svg_path);
            $response['sizes'] = array(
                'full' => array(
                    'url' => $response['url'],
                    'width' => $dimensions['width'],
                    'height' => $dimensions['height'],
                    'orientation' => $dimensions['width'] > $dimensions['height'] ? 'landscape' : 'portrait'
                )
            );
        }

        return $response;
    }

    /**
     * Get SVG dimensions
     *
     * @date 2022-10-04
     *
     * @param string $svg
     *
     * @return array
     */
    public static function get_dimensions($svg)
    {
        $svg = simplexml_load_file($svg);

        $width = null;
        $height = null;

        if ($svg !== false) {
            $attributes = $svg->attributes();
            $width = (string) $attributes->width;
            $height = (string) $attributes->height;
            if ((!$width || !$height) && $attributes->viewBox) {
                $viewBox = explode(' ', $attributes->viewBox);
                $width = $viewBox[2];
                $height = $viewBox[3];
            }
        }

        return array('width' => $width ?? "1", 'height' => $height ?? "1");
    }

    /**
     * Return same size for all attachment if the mimetype is SVG
     *
     * @date 2022-10-04
     *
     * @param string $metadata
     * @param string $attachment_id
     *
     * @return array
     */
    function metadata($metadata, $attachment_id)
    {
        $mime = get_post_mime_type($attachment_id);
        if ($mime == 'image/svg+xml') {
            $svg_path = get_attached_file($attachment_id);
            $filename = basename($svg_path);

            $dimensions = self::get_dimensions($svg_path);

            $metadata = array(
                'width'        => intval($dimensions['width']),
                'height'    => intval($dimensions['height']),
                'file'        => $filename
            );

            $height = intval($dimensions['height']);
            $width = intval($dimensions['width']);

            $sizes = array();
            foreach (get_intermediate_image_sizes() as $s) {
                $sizes[$s] = array('width' => '', 'height' => '', 'crop' => false);
                if ($width !== 0 && $height !== 0) {
                    if (isset($_wp_additional_image_sizes[$s]['width'])) {
                        $width_current_size = intval($_wp_additional_image_sizes[$s]['width']);
                    } else {
                        $width_current_size = get_option("{$s}_size_w");
                    }
                    if ($width > $height) {
                        $ratio = round($width / $height, 2);
                        $new_height = round($width_current_size / $ratio);
                    } else {
                        $ratio = round($height / $width, 2);
                        $new_height = round($width_current_size * $ratio);
                    }
                    $sizes[$s]['width'] = $width_current_size;
                    $sizes[$s]['height'] = $new_height;
                    $sizes[$s]['crop'] = false;
                } else {
                    if (isset($_wp_additional_image_sizes[$s]['width'])) {
                        $sizes[$s]['width'] = intval($_wp_additional_image_sizes[$s]['width']);
                    } else {
                        $sizes[$s]['width'] = get_option("{$s}_size_w");
                    }

                    if (isset($_wp_additional_image_sizes[$s]['height'])) {
                        $sizes[$s]['height'] = intval($_wp_additional_image_sizes[$s]['height']);
                    } else {
                        $sizes[$s]['height'] = get_option("{$s}_size_h");
                    }

                    if (isset($_wp_additional_image_sizes[$s]['crop'])) {
                        $sizes[$s]['crop'] = intval($_wp_additional_image_sizes[$s]['crop']);
                    } else {
                        $sizes[$s]['crop'] = get_option("{$s}_crop");
                    }
                }

                $sizes[$s]['file'] =  $filename;
                $sizes[$s]['mime-type'] =  'image/svg+xml';
            }

            $metadata['sizes'] = $sizes;
        }

        return $metadata;
    }


    /**
     * Disable srcset for svg image
     *
     * @date 2022-10-04
     *
     * @param array $sources
     *
     * @return array
     */
    function disable_srcset($sources)
    {
        $first_element = reset($sources);
        if (isset($first_element) && !empty($first_element['url'])) {
            $ext = pathinfo(reset($sources)['url'], PATHINFO_EXTENSION);
            if (strtolower($ext) == 'svg') {
                return array();
            }
        }
        return $sources;
    }

    /**
     * Fallback to calculate the SVG dimensions incase it is zero
     *
     * @date 2022-10-04
     *
     * @param string $image
     * @param string $attachment_id
     * @param string $size
     * @param string $icon
     *
     * @return array
     */
    function dimension_fallback($image, $attachment_id, $size, $icon)
    {
        if (get_post_mime_type($attachment_id) == 'image/svg+xml') {
            if (isset($image[1]) && $image[1] === 0) {
                $image[1] = 50;
            }
            if (isset($image[2]) && $image[2] === 0) {
                $image[2] = 50;
            }
        }

        return $image;
    }

    /**
     * Allow svg and svgz mime types
     * 
     * @param $mimes The mime types array.
     * 
     * @return array Array of mime types.
     */
    function upload_mimes($mimes = array())
    {
        $mimes['svg|svgz'] = 'image/svg+xml';
        return $mimes;
    }


    /**
     * If the file is an image, and the file extension is not SVG, then WordPress will not allow the
     * file to be uploaded
     * 
     * @param $checked  The array of information about the file that has been uploaded.
     * @param $file     The file that was uploaded.
     * @param $filename The name of the file being uploaded.
     * @param $mimes    An array of valid extension to mime type pairs.
     * 
     * @return array
     */
    function upload_check($checked, $file, $filename, $mimes)
    {
        if (!$checked['type']) {
            $check_filetype = wp_check_filetype($filename, $mimes);
            $ext                = $check_filetype['ext'];
            $type                = $check_filetype['type'];
            $proper_filename    = $filename;

            if ($type && 0 === strpos($type, 'image/') && $ext !== 'svg') {
                $ext = $type = false;
            }

            $checked = compact('ext', 'type', 'proper_filename');
        }

        return $checked;
    }


    /**
     * Allow SVG Upload
     *
     * @date 2022-10-04
     *
     * @param string $data
     * @param string $file
     * @param string $filename
     * @param string $mimes
     *
     * @return array
     */
    function allow_svg_upload($data, $file, $filename, $mimes)
    {
        global $wp_version;
        if ($wp_version !== '4.7.1' || $wp_version !== '4.7.2') {
            return $data;
        }

        $filetype = wp_check_filetype($filename, $mimes);

        return [
            'ext'                => $filetype['ext'],
            'type'                => $filetype['type'],
            'proper_filename'    => $data['proper_filename']
        ];
    }
}
