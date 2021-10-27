<?php

/**
 * Block attributes.
 *
 * The following attributes are available:
 *
 * @var $attributes array(
 *   'isFluid' (boolean) => Defines if container should be fluid.
 *   'fluidBreakpoint' (string) => Defines till which breakpoint the container should be fluid.
 *   'marginAfter' (string) => Margin bottom class which should be added to the block (eg. 'mb-2').
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

$classes = array('grid');
if (array_key_exists('columns', $attributes) && !empty($attributes['columns'])) {
    array_push($classes, 'columns-' . $attributes['columns']);
} else {
    array_push($classes, 'columns-2');
}
if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    array_push($classes, $attributes['className']);
}
?>
<div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <div class="row">
        <?php echo $content; // phpcs:ignore 
        ?>
    </div>
</div>