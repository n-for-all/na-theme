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
 *   'bgColor' (string) => Name of background color (eg. 'primary').
 *   'padding' (string) => Padding inside of column (eg. 'p-3').
 *   'contentVerticalAlignment' (string) => Vertical alignment of content.
 *   'className' (string) => Additional class names which should be added to block.
 * )
 */

$classes = ['item'];
$column_content_classes = array();

if ( array_key_exists( 'sizeXs', $attributes ) && $attributes['sizeXs'] > 0 ) {
	array_push( $classes, 'col-' . $attributes['sizeXs'] );
} else {
	array_push( $classes, 'col-12' );
}
if ( array_key_exists( 'sizeSm', $attributes ) && $attributes['sizeSm'] > 0 ) {
	array_push( $classes, 'col-sm-' . $attributes['sizeSm'] );
}
if ( array_key_exists( 'sizeMd', $attributes ) && $attributes['sizeMd'] > 0 ) {
	array_push( $classes, 'col-md-' . $attributes['sizeMd'] );
}
if ( array_key_exists( 'sizeLg', $attributes ) && $attributes['sizeLg'] > 0 ) {
	array_push( $classes, 'col-lg-' . $attributes['sizeLg'] );
}
if ( array_key_exists( 'sizeXl', $attributes ) && $attributes['sizeXl'] > 0 ) {
	array_push( $classes, 'col-xl-' . $attributes['sizeXl'] );
}

if ( array_key_exists( 'className', $attributes ) && ! empty( $attributes['className'] ) ) {
	array_push( $classes, $attributes['className'] );
}

if ( array_key_exists( 'contentVerticalAlignment', $attributes ) && ! empty( $attributes['contentVerticalAlignment'] ) ) {
	array_push( $column_content_classes, 'h-100' );
	array_push( $column_content_classes, 'd-flex' );
	array_push( $column_content_classes, 'flex-column' );

	if ( 'top' === $attributes['contentVerticalAlignment'] ) {
		array_push( $column_content_classes, 'justify-content-start' );
	}
	if ( 'center' === $attributes['contentVerticalAlignment'] ) {
		array_push( $column_content_classes, 'justify-content-center' );
	}
	if ( 'bottom' === $attributes['contentVerticalAlignment'] ) {
		array_push( $column_content_classes, 'justify-content-end' );
	}
}

if ( array_key_exists( 'bgColor', $attributes ) && ! empty( $attributes['bgColor'] ) ) {
	array_push( $column_content_classes, 'h-100' );
	array_push( $column_content_classes, 'bg-' . $attributes['bgColor'] );

	if ( array_key_exists( 'centerContent', $attributes ) && $attributes['centerContent'] ) {
		array_push( $column_content_classes, 'd-flex' );
		array_push( $column_content_classes, 'flex-column' );
		array_push( $column_content_classes, 'justify-content-center' );
	}
}

if ( array_key_exists( 'padding', $attributes ) && ! empty( $attributes['padding'] ) ) {
	array_push( $column_content_classes, $attributes['padding'] );
}

$column_content_classes = array_unique( $column_content_classes );

?>

<div class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>">
	<?php if ( ! empty( $column_content_classes ) ) : ?>
		<div class="<?php echo esc_attr( implode( ' ', $column_content_classes ) ); ?>">
			<?php echo $content; ?>
		</div>
	<?php else : ?>
		<?php echo $content; ?>
	<?php endif; ?>
</div>
