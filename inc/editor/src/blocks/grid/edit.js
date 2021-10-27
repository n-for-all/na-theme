// WordPress dependencies
import { __ } from "@wordpress/i18n";
import { CheckboxControl, PanelBody, SelectControl, RangeControl } from "@wordpress/components";
import { Component, Fragment } from "@wordpress/element";
import { withSelect, withDispatch } from "@wordpress/data";
import { compose } from "@wordpress/compose";
import { applyFilters } from "@wordpress/hooks";
import * as BlockEditor from "@wordpress/block-editor";
import * as Editor from "@wordpress/editor";
import times from "lodash.times";
import { createBlock } from "@wordpress/blocks";

const { InnerBlocks, InspectorControls } = BlockEditor || Editor;
const ALLOWED_BLOCKS = [ 'na-theme-blocks/grid-column' ];

const SizeRangeControl = ({ label, attributeName, value, setAttributes, onChange, ...props }) => {
	return (
		<RangeControl
			label={label}
			value={value}
			onChange={(selectedSize) => { 
				setAttributes({
					[attributeName]: selectedSize,
				});
				onChange(selectedSize);
			}}
			min={1}
			max={6}
			{...props}
		/>
	);
};

class BootstrapGridEdit extends Component { 
	render() {
		const { attributes, className, setAttributes, hasChildBlocks, clientId, replaceInnerBlocks, items } = this.props;
		const { columns } = attributes;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={__("Size", "na-theme")}>
						<SizeRangeControl
							label={__("Columns", "na-theme")}
							attributeName="columns"
							value={columns}
							setAttributes={setAttributes}
							onChange={(count) => {
								let inner_blocks = items;

								if (items.length < count) {
									inner_blocks = [...inner_blocks, ...times(count - items.length, () => createBlock("na-theme-blocks/grid-column"))];
								} else if (items.length > count) {
									inner_blocks = inner_blocks.slice(0, count);
								}

								replaceInnerBlocks(clientId, inner_blocks, false);
							}}
						/>
					</PanelBody>
				</InspectorControls>
				<div className={className}>
					<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } templateLock={false} renderAppender={items.length ? undefined : () => <InnerBlocks.ButtonBlockAppender />} />
				</div>
			</Fragment>
		);
	}
}


const applyWithSelect = withSelect( ( select, { clientId } ) => {
	const { getBlocksByClientId } =
		select( 'core/block-editor' ) || select( 'core/editor' ); // Fallback to 'core/editor' for backwards compatibility

	const items = getBlocksByClientId( clientId )[ 0 ]
		? getBlocksByClientId( clientId )[ 0 ].innerBlocks
		: [];

	return {
		items: select("core/block-editor").getBlocks(clientId),
	};
} );

const applyWithDispatch = withDispatch( ( dispatch ) => {
	const { updateBlockAttributes, replaceInnerBlocks } =
		dispatch( 'core/block-editor' ) || dispatch( 'core/editor' ); // Fallback to 'core/editor' for backwards compatibility

	return {
		updateBlockAttributes,
		replaceInnerBlocks,
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch
)( BootstrapGridEdit );