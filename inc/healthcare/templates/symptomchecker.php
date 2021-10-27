<?php

global $post;
$editable = false;

if (current_user_can('manage_options')) {
    $editable = 'data-tooltip-container';
}

$departments = get_posts([
    'post_type' => 'department',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'orderby' => 'title',
    'order' => 'asc',
    'suppress_filters' => false
]);
?>
<div class="symptom-checker" <?php echo $editable; ?> data="<?php echo json_encode($json); ?>">
    <svg preserveaspectratio="xMidYMid meet" class="top-background" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 1000 600">
        <image x="250" y="60" width="500" height="500" xlink:href="<?php echo get_template_directory_uri(); ?>/inc/healthcare/img/body.png" />
    </svg>
    <?php if ($editable) : ?>
        <div class="form-toolbar"></div>
        <div class="json-toolbar">
            <a href="#" class="btn btn-primary btn-data btn-sm">Toggle Data</a>
            <pre id="data-json" style="direction:ltr"></pre>
        </div>
        <div data-popup="department" class="popup-department">
            <h3 class="title"><?php _e("Select a department"); ?></h3>
            <select>
                <option value=""><?php _e("Select a department"); ?></option>
                <?php if ($departments) :
                    foreach ($departments as $dep) :
                        $meta = get_post_meta($dep->ID, '_meta_department', true);
                        $image_attributes = isset($meta['icon']) && !empty($meta['icon']) ? wp_get_attachment_image_src($meta['icon'], 'full') : null;
                ?>
                        <option data-url="<?php echo get_permalink($dep->ID); ?>" data-icon="<?php echo $image_attributes[0] ?? ''; ?>" value="<?php echo $dep->ID; ?>"><?php echo $dep->post_title; ?></option>
                <?php endforeach;
                endif ?>
            </select>
            <div class="form-actions">
                <a href="#!" class="btn btn-primary btn-save btn-sm"><?php _e("Add"); ?></a>
                <a href="#!" class="btn btn-primary btn-cancel btn-sm"><?php _e("Cancel"); ?></a>
            </div>
        </div>
    <?php endif; ?>
</div>