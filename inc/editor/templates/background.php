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

$classes = [];
$column_content_classes = array();

?>
<?php echo $content; ?>
