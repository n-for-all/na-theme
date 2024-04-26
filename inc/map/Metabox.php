<?php

namespace NaTheme\Inc\Map;

class Metabox
{
    protected $options = array(
        'clickableIcons' => array('Enable Clickable Icons', 'boolean', true, 'When disabled, map icons are not clickable. A map icon represents a point of interest, also known as a POI. By default map icons are clickable.'),
        'disableDefaultUI' => array('Disable Default UI', 'boolean', false, 'Enables/disables all default UI. May be overridden individually.'),
        'disableDoubleClickZoom' => array('Disable DoubleClick Zoom', 'boolean', false, 'Enables/disables zoom and center on double click. Enabled by default.'),
        'draggable' => array('Draggable', 'boolean', true, 'If false, prevents the map from being dragged. Dragging is enabled by default.'),
        'fullscreenControl' => array('Show Fullscreen Control', 'boolean', true, 'The enabled/disabled state of the Fullscreen control.'),
        'heading' => array('Heading', 'number', 0, 'The heading for aerial imagery in degrees measured clockwise from cardinal direction North. Headings are snapped to the nearest available angle for which imagery is available.'),
        'keyboardShortcuts' => array('Enable Keyboard Shortcuts', 'boolean', true, 'If false, prevents the map from being controlled by the keyboard. Keyboard shortcuts are enabled by default.'),
        'mapTypeControl' => array('Enable Map Type Control', 'boolean', true, 'The initial enabled/disabled state of the Map type control.'),
        'mapTypeId' => array('Initial Map Type', 'select', 'roadmap', 'The initial Map mapTypeId. Defaults to Roadmap.', array('roadmap' => 'Roadmap', 'hybrid' => 'Hybrid', 'satellite' => 'Satellite', 'terrain' => 'Terrain')),
        'zoom' => array('Zoom Level', 'number', 0, 'The initial Map zoom level. Valid values: Integers between zero, and up to the supported maximum zoom level (18).'),
        'minZoom' => array('Minimum Zoom Level', 'number', 0, 'The minimum zoom level which will be displayed on the map. If omitted, or set to null, the minimum zoom from the current map type is used instead. Valid values: Integers between zero, and up to the supported maximum zoom level(0).'),
        'maxZoom' => array('Maximum Zoom Level', 'number', 18, 'The maximum zoom level which will be displayed on the map. If omitted, or set to null, the maximum zoom from the current map type is used instead. Valid values: Integers between zero, and up to the supported maximum zoom level(18).'),
        'zoomControl' => array('Show Zoom Control', 'boolean', true, 'The enabled/disabled state of the Zoom control.'),
        'panControl' => array('Show Pan Control', 'boolean', true, 'The enabled/disabled state of the Pan control.'),
        'rotateControl' => array('Show Rotate Control', 'boolean', true, 'The enabled/disabled state of the Rotate control.'),
        'scaleControl' => array('Show Scale Control', 'boolean', true, 'The initial enabled/disabled state of the Scale control.'),
        'scrollwheel' => array('Enable Scroll Wheel', 'boolean', true, 'If false, disables scrollwheel zooming on the map. The scrollwheel is enabled by default.'),
        'signInControl' => array('Enable Sign In Control', 'boolean', false, 'The enabled/disabled state of the sign in control. This option only applies if signed_in=true has been passed as a URL parameter in the bootstrap request. You may want to use this option to hide the map\'s sign in control if you have provided another way for your users to sign in, such as the Google Sign-In button. This option does not affect the visibility of the Google avatar shown when the user is already signed in.'),
        'streetViewControl' => array('Enable StreetView Control', 'boolean', true, 'The initial enabled/disabled state of the Street View Pegman control. This control is part of the default UI, and should be set to false when displaying a map type on which the Street View road overlay should not appear (e.g. a non-Earth map type).'),
        'styles' => array('textarea', '', 'Styles to apply to each of the default map types. Note that for satellite/hybrid and terrain modes, these styles will only apply to labels and geometry.'),
        'tilt' => array('Tilt', 'select', 0, 'Controls the automatic switching behavior for the angle of incidence of the map. The only allowed values are 0 and 45. The value 0 causes the map to always use a 0° overhead view regardless of the zoom level and viewport. The value 45 causes the tilt angle to automatically switch to 45 whenever 45° imagery is available for the current zoom level and viewport, and switch back to 0 whenever 45° imagery is not available (this is the default behavior). 45° imagery is only available for satellite and hybrid map types, within some locations, and at some zoom levels. Note: getTilt returns the current tilt angle, not the value specified by this option. Because getTilt and this option refer to different things, do not bind() the tilt property; doing so may yield unpredictable effects.', array('0' => '0', '45' => '45')),

    );
    /**
     * Hook into the appropriate actions when the class is constructed.
     */
    public function __construct()
    {
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
        add_action('save_post', array($this, 'save'));
    }

    /**
     * Adds the meta box container.
     */
    public function add_meta_box($post_type)
    {
        $post_types = ['map'];     //limit meta box to certain post types
        if (in_array($post_type, $post_types)) {
            add_meta_box(
                'map-settings',
                __('Settings', 'na-theme'),
                array($this, 'render_meta_box_map_content'),
                $post_type,
                'advanced',
                'high'
            );
            add_meta_box(
                'map-markers',
                __('Markers', 'na-theme'),
                array($this, 'render_meta_box_content'),
                $post_type,
                'advanced',
                'high'
            );
        }
    }

    /**
     * Save the meta when the post is saved.
     *
     * @param int $post_id The ID of the post being saved.
     */
    public function save($post_id)
    {
        /*
         * We need to verify this came from the our screen and with proper authorization,
         * because save_post can be triggered at other times.
         */

        // Check if our nonce is set.
        if (!isset($_POST['natheme_inner_custom_box_nonce'])) {
            return $post_id;
        }

        $nonce = $_POST['natheme_inner_custom_box_nonce'];

        // Verify that the nonce is valid.
        if (!wp_verify_nonce($nonce, 'natheme_inner_custom_box')) {
            return $post_id;
        }

        // If this is an autosave, our form has not been submitted,
        //     so we don't want to do anything.
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return $post_id;
        }

        // Check the user's permissions.
        if ('page' == $_POST['post_type']) {
            if (!current_user_can('edit_page', $post_id)) {
                return $post_id;
            }
        } else {
            if (!current_user_can('edit_post', $post_id)) {
                return $post_id;
            }
        }

        /* OK, its safe for us to save the data now. */

        // Sanitize the user input.
        $data = $_POST['natheme'] ?? [];
        foreach ($this->options as $name => $control) {
            @list($label, $type, $default, $help, $choices) = $control;
            switch ($type) {
                case 'boolean':
                    if (isset($data["map"][$name])) {
                        $data["map"][$name] = (bool)$data["map"][$name];
                    }
                    break;
                case 'number':
                    if (isset($data["map"][$name])) {
                        $data["map"][$name] = (int)$data["map"][$name];
                    }
                default:
                    break;
            }
        }
        if (sizeof($data) > 0 && is_array($data)) {
            update_post_meta($post_id, 'natheme-map-markers', $data);
        }
    }


    /**
     * Render Meta Box content.
     *
     * @param WP_Post $post The post object.
     */
    public function render_meta_box_map_content($post)
    {
        $data = get_post_meta($post->ID, 'natheme-map-markers', true);
        array_walk($this->options, function (&$value, $key, $data) {
            if (isset($data['map'][$key])) {
                $value[2] = $data['map'][$key];
            }
        }, $data);
?>
        <table class="form-table">
            <?php
            foreach ($this->options as $name => $control) {
        
                @list($label, $type, $default, $help, $choices) = $control;
                switch ($type) {
                    case 'boolean':
            ?>
                        <tr>
                            <th><?php echo $label; ?></th>
                            <td>
                                <select name="natheme[map][<?php echo $name; ?>]">
                                    <option <?php echo $default; ?> <?php echo $default == true ? 'selected="selected"' : ''; ?> value="1">Yes</option>
                                    <option <?php echo $default == false ? 'selected="selected"' : ''; ?> value="0">No</option>
                                </select>
                                <p class="description"><?php echo $help; ?></p>
                            </td>
                        </tr>
                    <?php
                        break;
                    case 'select':
                    ?>
                        <tr>
                            <th><?php echo $label; ?></th>
                            <td>
                                <select name="natheme[map][<?php echo $name; ?>]">
                                    <?php foreach ($choices as $key => $choice) : ?>
                                        <option <?php echo $key == $default ? 'selected="selected"' : ''; ?> value="<?php echo $key; ?>"><?php echo $choice; ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <p class="description"><?php echo $help; ?></p>
                            </td>
                        </tr>
                    <?php
                        break;
                    case 'number':
                    ?>
                        <tr>
                            <th><?php echo $label; ?></th>
                            <td>
                                <input type="number" name="natheme[map][<?php echo $name; ?>]" value="<?php echo $default; ?>" />
                                <p class="description"><?php echo $help; ?></p>
                            </td>
                        </tr>
            <?php
                        break;
                    default:
                        break;
                }
            }
            ?>
        </table>
    <?php
    }
    public function render_meta_box_content($post)
    {

        // Add an nonce field so we can check for it later.
        wp_nonce_field('natheme_inner_custom_box', 'natheme_inner_custom_box_nonce');

        // Use get_post_meta to retrieve an existing value from the database.
        $data = (array)get_post_meta($post->ID, 'natheme-map-markers', true);
        $data['markers'] = isset($data['markers']) ? array_values($data['markers']) : [];
        $data['routes'] = array_values(isset($data['routes']) ? $data['routes'] : array());
        // Display the form, using the current value.

    ?>
        <style>
            ._options-ul li {
                background: #f8f8f8;
                border: 1px solid #eee;
                padding: 15px;
            }

            ._options-ul li label {
                display: block
            }

            ._options-ul li p {
                display: inline-block;
            }

            ._options-ul li p.full {
                display: block;
                width: 100%;
            }

            ._options-ul li p.full textarea {
                width: 100%;
            }

            ._options-ul li p._label {
                font-style: italic;
                font-size: 90%;
            }

            a.marker-delete {
                text-decoration: none;
                background: #9f5353;
                width: 20px;
                height: 20px;
                text-align: center;
                color: #fff;
                font-weight: bold;
                position: absolute;
                right: 12px;
                top: 0;
            }
        </style>
        <div id="marker-template" style="display:none">
            <h3 class="marker-title">Marker {i}</h3>
            <a class="marker-delete" href="#" onclick="return deleteMarker(this)">x</a>
            <input type="hidden" _name="natheme[markers][{i}][id]" value="{id}" />
            <p><label for="natheme_new_field"><?php _e('Title', 'na-theme'); ?></label>
                <input type="text" _name="natheme[markers][{i}][title]" placeholder="Marker title" value="{title}" />
            </p>
            <p><label for="natheme_new_field"><?php _e('Label', 'na-theme'); ?></label>
                <input type="text" _name="natheme[markers][{i}][label]" placeholder="Marker Label" value="{label}" />
            </p>
            <p><label for="natheme_new_field"><?php _e('Latitude', 'na-theme'); ?></label>
                <input class="_lat" type="text" _name="natheme[markers][{i}][lat]" value="{lat}" />
            </p>
            <p><label for="natheme_new_field"><?php _e('Longitude', 'na-theme'); ?></label>
                <input class="_lng" type="text" _name="natheme[markers][{i}][lng]" value="{lng}" />
            </p>
            <p class="full"><label for="natheme_new_field"><?php _e('Info Window', 'na-theme'); ?></label>
                <textarea _name="natheme[markers][{i}][info]">{info}</textarea>
            </p>
            <p class="full _label">
                <label for="natheme_new_field">
                    <input type="checkbox" _name="natheme[markers][{i}][oinfo]" {oinfo} />
                    <?php _e('Opened by default', 'na-theme'); ?>
                </label>
            </p>
            <p class="full"><label for="natheme_new_field"><?php _e('Callback', 'na-theme'); ?></label>
                <input type="text" _name="natheme[markers][{i}][callback]" placeholder="Marker Callback" value="{callback}" />
            </p>
        </div>
        <div id="route-template" style="display:none">
            <a class="marker-delete" href="#" onclick="return deleteMarker(this)">x</a>
            <input type="hidden" _name="natheme[routes][{i}][id]" value="{id}" />
            <input type="hidden" _name="natheme[routes][{i}][orig]" value="{orig}" />
            <input type="hidden" _name="natheme[routes][{i}][dest]" value="{dest}" />
            <h3 class="_rtitle">{rtitle}</h3>
            <p>
                <label for="natheme_new_field">
                    <?php _e('Color', 'na-theme'); ?>
                </label>
                <input type="text" _name="natheme[routes][{i}][col]" value="{col}" placeholder="Route color" />
            </p>
            </p>
        </div>
        <ul id="natheme-markers" class="_options-ul"></ul>
        <a href="#" class="button button-primary button-add-marker">
            <?php _e('Add Marker', 'na-theme'); ?>
        </a>
        <ul id="natheme-routes" class="_options-ul"></ul>
        <div id="natheme-routes-cont" class="_options-ul">
            <p>
                <select class="natheme-orig">
                    <option value="">Select an Origin</option>
                </select>
            </p>
            <p>
                <select class="natheme-dest">
                    <option value="">Select a Destination</option>
                </select>
            </p>
            <p>
                <a href="#" class="button button-primary button-add-route">
                    <?php _e('Add Route', 'na-theme'); ?>
                </a>
            </p>
        </div>
        <script type="text/javascript">
            var count = 0;
            var natheme = <?php echo json_encode($data); ?>;

            jQuery(document).ready(function() {
                if (typeof(natheme.markers) != "undefined" && natheme.markers != null) {
                    for (var i = 0; i < natheme.markers.length; i++) {
                        var html = jQuery("#marker-template").html();
                        html = html.replace('{id}', natheme.markers[i].id);
                        html = html.replace('{title}', natheme.markers[i].title);
                        html = html.replace('{callback}', natheme.markers[i].callback);
                        html = html.replace('{label}', natheme.markers[i].label);
                        html = html.replace('{lat}', natheme.markers[i].lat);
                        html = html.replace('{lng}', natheme.markers[i].lng);
                        html = html.replace('{info}', natheme.markers[i].info);
                        if (typeof(natheme.markers[i].oinfo) != "undefined") {
                            html = html.replace('{oinfo}', 'checked="checked"');
                        } else {
                            html = html.replace('{oinfo}', '');
                        }
                        jQuery("#natheme-markers").append("<li class='clear'>" + html.replace(/_name/ig, "name").replace(/{i}/ig, count) + "</li>");
                        count++;
                    }
                }
                if (typeof(natheme.routes) != "undefined" && natheme.routes != null) {
                    for (var i = 0; i < natheme.routes.length; i++) {
                        var html = jQuery("#route-template").html();
                        html = html.replace('{id}', natheme.routes[i].id);
                        html = html.replace('{orig}', natheme.routes[i].orig);
                        html = html.replace('{dest}', natheme.routes[i].dest);
                        html = html.replace('{col}', natheme.routes[i].col);
                        html = html.replace('{rtitle}', natheme.routes[i].orig + " to " + natheme.routes[i].dest);
                        jQuery("#natheme-routes").append("<li class='clear'>" + html.replace(/_name/ig, "name").replace(/{i}/ig, count) + "</li>");
                        count++;
                    }
                }
                jQuery(".button-add-marker").click(function() {
                    var html = jQuery("#marker-template").html();
                    html = html.replace('{id}', '0');
                    html = html.replace('{label}', '');
                    html = html.replace('{callback}', '');
                    html = html.replace('{title}', '');
                    html = html.replace('{lat}', '');
                    html = html.replace('{lng}', '');
                    html = html.replace('{info}', '');
                    html = html.replace('{oinfo}', '');

                    jQuery("#natheme-markers").append("<li class='clear'>" + html.replace(/_name/ig, "name").replace(/{i}/ig, count) + "</li>");
                    toggleRoutes();
                    count++;
                    return false;
                });
                jQuery(".button-add-route").click(function() {
                    var html = jQuery("#route-template").html();
                    var orig = jQuery(".natheme-orig option:selected").val();
                    var dest = jQuery(".natheme-dest option:selected").val();
                    html = html.replace('{id}', '0');
                    html = html.replace('{orig}', orig);
                    html = html.replace('{dest}', dest);
                    html = html.replace('{col}', '');
                    html = html.replace('{rtitle}', orig + ' to ' + dest);

                    jQuery("#natheme-routes").append("<li class='clear'>" + html.replace(/_name/ig, "name").replace(/{i}/ig, count) + "</li>");

                    count++;
                    return false;
                });
                toggleRoutes();
            });

            function toggleRoutes() {
                if (jQuery("#natheme-routes").length > 0) {
                    jQuery('#natheme-routes-cont').show();
                } else {
                    jQuery('#natheme-routes-cont').hide();
                    jQuery('#natheme-routes-cont #natheme-routes li').remove();
                }
                jQuery(".natheme-orig option").remove();
                jQuery("#natheme-markers li").each(function() {
                    jQuery(".natheme-orig").append('<option value="' + jQuery(this).find("._lat").val() + ',' + jQuery(this).find("._lng").val() + '">' + jQuery(this).find(".marker-title").html() + '</option>');
                });
                jQuery(".natheme-dest option").remove();
                jQuery("#natheme-markers li").each(function() {
                    jQuery(".natheme-dest").append('<option value="' + jQuery(this).find("._lat").val() + ',' + jQuery(this).find("._lng").val() + '">' + jQuery(this).find(".marker-title").html() + '</option>');
                });
            }

            function deleteMarker(element) {
                jQuery(element).parent().remove();
                return false;
            }
        </script>
<?php

    }
}
