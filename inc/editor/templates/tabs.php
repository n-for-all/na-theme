<?php

/**
 * Block attributes.
 *
 * The following attributes are available:
 *
 * @var $attributes array(
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

 /** @var array */
$classes = array('row');
if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    array_push($classes, $attributes['className']);
}
?>
<div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <?php echo $content; // phpcs:ignore 
    ?>
</div>