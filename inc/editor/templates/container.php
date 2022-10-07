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
/** @var array */
$classes = array();

if (array_key_exists('isFluid', $attributes) && $attributes['isFluid']) {
    if (array_key_exists('fluidBreakpoint', $attributes) && !empty($attributes['fluidBreakpoint'])) {
        array_push($classes, 'container-' . $attributes['fluidBreakpoint']);
    } else {
        array_push($classes, 'container-fluid');
    }
} else {
    array_push($classes, 'container');
}
if (array_key_exists('marginAfter', $attributes) && !empty($attributes['marginAfter'])) {
    array_push($classes, $attributes['marginAfter']);
}

$className = false;
if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    $className = $attributes['className'];
}

?>
<?php if ($className) : ?>
    <div class="<?php echo $className; ?>">
    <?php endif; ?>
    <div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
        <?php echo $content; // phpcs:ignore 
        ?>
    </div>
    <?php if ($className) : ?>
    </div>
<?php endif; ?>