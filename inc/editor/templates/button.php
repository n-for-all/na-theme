<?php
/**
 * Block attributes.
 *
 */

$classes = [];
$column_content_classes = array();
?>
<a href="<?php echo $attributes['href'] ?? ''; ?>" class="<?php echo $attributes['className'] ?? ''; ?>" <?php echo $attributes['atts'] ?? ''; ?>>
    <?php echo $attributes['label'] ?? ''; ?>
</a>
