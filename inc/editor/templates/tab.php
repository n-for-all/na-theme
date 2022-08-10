<?php

/**
 * Block attributes.
 *
 * The following attributes are available:
 *
 * @var $attributes array(
 *   'sizeXxl' (int) => Xxl column size.
 *   'sizeXl' (int) => Xl column size.
 *   'sizeLg' (int) => Lg column size.
 *   'sizeMd' (int) => Md column size.
 *   'sizeSm' (int) => Sm column size.
 *   'sizeXs' (int) => Xs column size.
 *   'equalWidthXxl' (boolean) => Xxl columns equal-width.
 *   'equalWidthXl' (boolean) => Xl columns equal-width.
 *   'equalWidthLg' (boolean) => Lg columns equal-width.
 *   'equalWidthMd' (boolean) => Md columns equal-width.
 *   'equalWidthSm' (boolean) => Sm columns equal-width.
 *   'equalWidthXs' (boolean) => Xs columns equal-width.
 *   'bgColor' (string) => Name of background color (eg. 'primary').
 *   'padding' (string) => Padding inside of column (eg. 'p-3').
 *   'contentVerticalAlignment' (string) => Vertical alignment of content.
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

 /** @var array */
$classes = [];
$column_content_classes = array();


if (array_key_exists('className', $attributes) && !empty($attributes['className'])) {
    array_push($classes, $attributes['className']);
}

if (array_key_exists('padding', $attributes) && !empty($attributes['padding'])) {
    array_push($column_content_classes, $attributes['padding']);
}
$tab_id = $attributes['tab_id'];
$column_content_classes = array_unique($column_content_classes);
?>
<div class="tab-pane fade <?php echo esc_attr(implode(' ', $classes)); ?>" :class="{'active show': show == '<?php echo $tab_id; ?>'}">
    <?php if (!empty($column_content_classes)) : ?>
        <div class="<?php echo esc_attr(implode(' ', $column_content_classes)); ?>">
            <?php echo $content; ?>
        </div>
    <?php else : ?>
        <?php echo $content; ?>
    <?php endif; ?>
</div>