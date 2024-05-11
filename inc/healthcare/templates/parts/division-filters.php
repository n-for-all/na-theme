<?php

$departments = \NaTheme\Inc\Healthcare\Doctor::getDepartments();
$divisions = \NaTheme\Inc\Healthcare\Doctor::getDivisions();
?>
<div class="form-group division-filter">
    <h5><?php _e('Departments', 'na-theme'); ?></h5>
    <div class="form-check form-switch">
        <input class="form-check-input" type="radio" name="filter[division]" value="">
        <label class="form-check-label"><?php _e('All Departments', 'na-theme'); ?></label>
    </div>
    <?php foreach ($departments as $division) : ?>
        <div class="form-check form-switch">
            <input class="form-check-input" type="radio" name="filter[division]" value="<?php echo $division->ID; ?>">
            <label class="form-check-label"><?php echo $division->post_title; ?></label>
        </div>
    <?php endforeach; ?>
</div>