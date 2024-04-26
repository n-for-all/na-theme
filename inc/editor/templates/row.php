<?php

/**
 * Block attributes.
 *
 * The following attributes are available:
 *
 * @var $attributes array(
 *   'template' (string) => Name of selected template.
 *   'noGutters' (boolean) => Defines if no gutters should be applied or not.
 *   'alignment' (string) => Horizontal alignment of inner columns.
 *   'verticalAlignment' (string) => Vertical alignment of inner columns.
 *   'horizontalGutters' (string) => Size of horizontal gutters.
 *   'verticalGutters' (string) => Size of vertical gutters.
 *   'align' (string) => If set to 'full' row should use full width of page.
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

$classes = array('row');
if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    array_push($classes, $attributes['className']);
}
if (array_key_exists('align', $attributes) && 'full' === $attributes['align']) {
    array_push($classes, 'alignfull');
}

if (array_key_exists('noGutters', $attributes) && $attributes['noGutters']) {
    array_push($classes, 'no-gutters');
} else {
    if (array_key_exists('horizontalGutters', $attributes) && $attributes['horizontalGutters']) {
        array_push($classes, $attributes['horizontalGutters']);
    }
    if (array_key_exists('verticalGutters', $attributes) && $attributes['verticalGutters']) {
        array_push($classes, $attributes['verticalGutters']);
    }
}
if (array_key_exists('alignment', $attributes)) {
    if ('left' === $attributes['alignment']) {
        array_push($classes, 'justify-content-start');
    }
    if ('center' === $attributes['alignment']) {
        array_push($classes, 'justify-content-center');
    }
    if ('right' === $attributes['alignment']) {
        array_push($classes, 'justify-content-end');
    }
}
if (array_key_exists('verticalAlignment', $attributes)) {
    if ('top' === $attributes['verticalAlignment']) {
        array_push($classes, 'align-items-start');
    }
    if ('center' === $attributes['verticalAlignment']) {
        array_push($classes, 'align-items-center');
    }
    if ('bottom' === $attributes['verticalAlignment']) {
        array_push($classes, 'align-items-end');
    }
}
?>
<div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <?php echo $content; // phpcs:ignore 
    ?>
</div>