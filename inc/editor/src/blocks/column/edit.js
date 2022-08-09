// WordPress dependencies
import { __ } from '@wordpress/i18n';
import {
	CheckboxControl,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';

import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';

import {
	verticalAlignBottom,
	verticalAlignCenter,
	verticalAlignTop,
} from '../../icons';

const { InnerBlocks, InspectorControls, BlockControls, AlignmentToolbar } =
	BlockEditor || Editor;

const contentVerticalAlignmentControls = [
	{
		icon: verticalAlignTop,
		title: __( 'Align content top', 'na-theme' ),
		align: 'top',
	},
	{
		icon: verticalAlignCenter,
		title: __( 'Align content center', 'na-theme' ),
		align: 'center',
	},
	{
		icon: verticalAlignBottom,
		title: __( 'Align content bottom', 'na-theme' ),
		align: 'bottom',
	},
];

const ColumnSizeRangeControl = ( {
	label,
	attributeName,
	value,
	setAttributes,
	...props
} ) => {
	return (
		<RangeControl
			label={ label }
			value={ value }
			onChange={ ( selectedSize ) => {
				setAttributes( {
					[ attributeName ]: selectedSize,
				} );
			} }
			min={ 0 }
			max={ 12 }
			{ ...props }
		/>
	);
};

export let bgColorOptions = [
	{ name: 'primary', color: '#007bff' },
	{ name: 'secondary', color: '#6c757d' },
];

let paddingOptions = [
	{ label: __( 'None', 'na-theme' ), value: '' },
	{ label: __( 'Small', 'na-theme' ), value: 'p-2' },
	{ label: __( 'Medium', 'na-theme' ), value: 'p-3' },
	{ label: __( 'Large', 'na-theme' ), value: 'p-5' },
];

class BootstrapColumnEdit extends Component {
	render() {
		const {
			attributes,
			className,
			setAttributes,
			hasChildBlocks,
		} = this.props;
		const {
			sizeXxl,
			sizeXl,
			sizeLg,
			sizeMd,
			sizeSm,
			sizeXs,
			equalWidthXxl,
			equalWidthXl,
			equalWidthLg,
			equalWidthMd,
			equalWidthSm,
			equalWidthXs,
			bgColor,
			padding,
			centerContent,
			contentVerticalAlignment,
		} = attributes;

		// Migrate deprecated centerContent to new contentVerticalAlignment attribute
		if ( centerContent ) {
			setAttributes( {
				contentVerticalAlignment: 'center',
				centerContent: false,
			} );
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody
						title={ __( 'Column size', 'na-theme' ) }
						initialOpen={ false }
					>
						<ColumnSizeRangeControl
							label={ __(
								'Xs Column count',
								'na-theme'
							) }
							attributeName="sizeXs"
							value={ sizeXs }
							disabled={ equalWidthXs }
							setAttributes={ setAttributes }
						/>
						<CheckboxControl
							label={ __(
								'Xs equal-width',
								'na-theme'
							) }
							checked={ equalWidthXs }
							onChange={ ( isChecked ) =>
								setAttributes( { equalWidthXs: isChecked } )
							}
						/>
						<hr />
						<ColumnSizeRangeControl
							label={ __(
								'Sm Column count',
								'na-theme'
							) }
							attributeName="sizeSm"
							value={ sizeSm }
							disabled={ equalWidthSm }
							setAttributes={ setAttributes }
						/>
						<CheckboxControl
							label={ __(
								'Sm equal-width',
								'na-theme'
							) }
							checked={ equalWidthSm }
							onChange={ ( isChecked ) =>
								setAttributes( { equalWidthSm: isChecked } )
							}
						/>
						<hr />
						<ColumnSizeRangeControl
							label={ __(
								'Md Column count',
								'na-theme'
							) }
							attributeName="sizeMd"
							value={ sizeMd }
							disabled={ equalWidthMd }
							setAttributes={ setAttributes }
						/>
						<CheckboxControl
							label={ __(
								'Md equal-width',
								'na-theme'
							) }
							checked={ equalWidthMd }
							onChange={ ( isChecked ) =>
								setAttributes( { equalWidthMd: isChecked } )
							}
						/>
						<hr />
						<ColumnSizeRangeControl
							label={ __(
								'Lg Column count',
								'na-theme'
							) }
							attributeName="sizeLg"
							value={ sizeLg }
							disabled={ equalWidthLg }
							setAttributes={ setAttributes }
						/>
						<CheckboxControl
							label={ __(
								'Lg equal-width',
								'na-theme'
							) }
							checked={ equalWidthLg }
							onChange={ ( isChecked ) =>
								setAttributes( { equalWidthLg: isChecked } )
							}
						/>
						<hr />
						<ColumnSizeRangeControl
							label={ __(
								'Xl Column count',
								'na-theme'
							) }
							attributeName="sizeXl"
							value={ sizeXl }
							disabled={ equalWidthXl }
							setAttributes={ setAttributes }
						/>
						<CheckboxControl
							label={ __(
								'Xl equal-width',
								'na-theme'
							) }
							checked={ equalWidthXl }
							onChange={ ( isChecked ) =>
								setAttributes( { equalWidthXl: isChecked } )
							}
						/>
					</PanelBody>
					<PanelBody
						title={ __(
							'Background color',
							'na-theme'
						) }
						initialOpen={ false }
					>
						<ColorPalette
							colors={ bgColorOptions }
							value={ bgColor }
							onChange={ ( value ) => {
								// Value is undefined if color gets cleared
								if ( ! value ) {
									setAttributes( {
										bgColor: '',
										centerContent: false,
									} );
								} else {
									const selectedColor = bgColorOptions.find(
										( c ) => c.color === value
									);
									if ( selectedColor ) {
										setAttributes( {
											bgColor: selectedColor.name,
										} );
									}
								}
							} }
							disableCustomColors
						/>
					</PanelBody>
					<PanelBody
						title={ __(
							'Padding (inside column)',
							'na-theme'
						) }
						initialOpen={ false }
					>
						<SelectControl
							label={ __( 'Size', 'na-theme' ) }
							value={ padding }
							options={ paddingOptions }
							onChange={ ( value ) => {
								setAttributes( {
									padding: value,
								} );
							} }
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<AlignmentToolbar
						value={ contentVerticalAlignment }
						label={ __(
							'Change vertical alignment of content',
							'na-theme'
						) }
						onChange={ ( newContentVerticalAlignment ) =>
							setAttributes( {
								contentVerticalAlignment: newContentVerticalAlignment,
							} )
						}
						alignmentControls={ contentVerticalAlignmentControls }
					/>
				</BlockControls>
				<div className={ className }>
					<InnerBlocks
						templateLock={ false }
						renderAppender={
							hasChildBlocks
								? undefined
								: () => <InnerBlocks.ButtonBlockAppender />
						}
					/>
				</div>
			</Fragment>
		);
	}
}

export default compose(
	withSelect( ( select, ownProps ) => {
		const { clientId } = ownProps;
		const { getBlockOrder } =
			select( 'core/block-editor' ) || select( 'core/editor' ); // Fallback to 'core/editor' for backwards compatibility

		return {
			hasChildBlocks: getBlockOrder( clientId ).length > 0,
		};
	} )
)( BootstrapColumnEdit );
