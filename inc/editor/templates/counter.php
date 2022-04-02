<?php
/**
 * Block attributes.
 *
 */

$classes = [];
$column_content_classes = array();

?>
<div class="counter" data-settings='<?php echo json_encode($attributes); ?>'>
    <?php echo $content; ?>
</div>
