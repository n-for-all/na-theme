// WordPress dependencies
import { __ } from '@wordpress/i18n';
import {
	CheckboxControl,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';


const { InnerBlocks, InspectorControls } = BlockEditor || Editor;

let marginAfterOptions = [
	{
		label: __( 'Small', 'na-theme' ),
		value: 'mb-2',
	},
	{
		label: __( 'Medium', 'na-theme' ),
		value: 'mb-3',
	},
	{
		label: __( 'Large', 'na-theme' ),
		value: 'mb-5',
	},
];

marginAfterOptions = [
	{
		label: __( 'None', 'na-theme' ),
		value: 'mb-0',
	},
	...marginAfterOptions,
];

let fluidBreakpointOptions = [
	{
		label: __( 'Xl', 'na-theme' ),
		value: 'xl',
	},
	{
		label: __( 'Lg', 'na-theme' ),
		value: 'lg',
	},
	{
		label: __( 'Md', 'na-theme' ),
		value: 'md',
	},
	{
		label: __( 'Sm', 'na-theme' ),
		value: 'sm',
	},
];

fluidBreakpointOptions = [
	{
		label: __( 'No breakpoint selected', 'na-theme' ),
		value: '',
	},
	...fluidBreakpointOptions,
];

class BootstrapContainerEdit extends Component {
	render() {
		const {
			attributes,
			className,
			setAttributes,
			hasChildBlocks,
		} = this.props;
		const { isFluid, fluidBreakpoint, marginAfter } = attributes;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Fluid', 'na-theme' ) }>
						<CheckboxControl
							label={ __( 'Fluid', 'na-theme' ) }
							checked={ isFluid }
							onChange={ ( isChecked ) => {
								setAttributes( { isFluid: isChecked } );
							} }
						/>
						<SelectControl
							label={ __(
								'Fluid Breakpoint',
								'na-theme'
							) }
							disabled={ ! isFluid }
							value={ fluidBreakpoint }
							options={ fluidBreakpointOptions }
							onChange={ ( selectedFluidBreakpoint ) => {
								setAttributes( {
									fluidBreakpoint: selectedFluidBreakpoint,
								} );
							} }
							help={ __(
								'Fluid breakpoints only work with Bootstrap v4.4+. The container will be 100% wide until the specified breakpoint is reached, after which max-widths for each of the higher breakpoints will be applied.',
								'na-theme'
							) }
						/>
					</PanelBody>
					<PanelBody title={ __( 'Margin', 'na-theme' ) }>
						<SelectControl
							label={ __(
								'Margin After',
								'na-theme'
							) }
							value={ marginAfter }
							options={ marginAfterOptions }
							onChange={ ( selectedMarginAfter ) => {
								setAttributes( {
									marginAfter: selectedMarginAfter,
								} );
							} }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ className }>
					<InnerBlocks
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
)( BootstrapContainerEdit );
