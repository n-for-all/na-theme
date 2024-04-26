// WordPress dependencies
import { __ } from "@wordpress/i18n";
import { CheckboxControl, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl } from "@wordpress/components";
import { Component, Fragment } from "@wordpress/element";
import { withSelect } from "@wordpress/data";
import { compose } from "@wordpress/compose";
import { applyFilters } from "@wordpress/hooks";

import * as BlockEditor from "@wordpress/block-editor";
import * as Editor from "@wordpress/editor";

import { verticalAlignBottom, verticalAlignCenter, verticalAlignTop } from "../../icons";

const { InnerBlocks, InspectorControls, BlockControls, AlignmentToolbar } = BlockEditor || Editor;

const contentVerticalAlignmentControls = [
	{
		icon: verticalAlignTop,
		title: __("Align content top", "na-theme"),
		align: "top",
	},
	{
		icon: verticalAlignCenter,
		title: __("Align content center", "na-theme"),
		align: "center",
	},
	{
		icon: verticalAlignBottom,
		title: __("Align content bottom", "na-theme"),
		align: "bottom",
	},
];

const ColumnSizeRangeControl = ({ label, attributeName, value, setAttributes, ...props }) => {
	return (
		<RangeControl
			label={label}
			value={value}
			onChange={(selectedSize) => {
				setAttributes({
					[attributeName]: selectedSize,
				});
			}}
			min={0}
			max={12}
			{...props}
		/>
	);
};

export let bgColorOptions = [
	{ name: "primary", color: "#007bff" },
	{ name: "secondary", color: "#6c757d" },
];

let paddingOptions = [
	{ label: __("None", "na-theme"), value: "" },
	{ label: __("Small", "na-theme"), value: "p-2" },
	{ label: __("Medium", "na-theme"), value: "p-2 lg:p-3" },
	{ label: __("Large", "na-theme"), value: "p-2 lg:p-5" },
];

class BootstrapColumnEdit extends Component {
	render() {
		const { attributes, className, setAttributes, hasChildBlocks } = this.props;
		const { tab_id, label, bgColor, padding, centerContent, contentVerticalAlignment } = attributes;

		// Migrate deprecated centerContent to new contentVerticalAlignment attribute
		if (centerContent) {
			setAttributes({
				contentVerticalAlignment: "center",
				centerContent: false,
			});
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={__("Settings", "na-theme")} initialOpen={false}>
						<TextControl
							label={__("Tab Label")} 
							value={label}
                            required={true}
							onChange={(value) =>
								setAttributes({
									label: value,
								})
							}
						/>
						<TextControl
							label={__("Tab ID")} 
							value={tab_id}
                            required={true}
							onChange={(value) =>
								setAttributes({
									tab_id: value,
								})
							}
						/>
					</PanelBody>
					<PanelBody title={__("Padding (inside column)", "na-theme")} initialOpen={false}>
						<SelectControl
							label={__("Size", "na-theme")}
							value={padding}
							options={paddingOptions}
							onChange={(value) => {
								setAttributes({
									padding: value,
								});
							}}
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<AlignmentToolbar
						value={contentVerticalAlignment}
						label={__("Change vertical alignment of content", "na-theme")}
						onChange={(newContentVerticalAlignment) =>
							setAttributes({
								contentVerticalAlignment: newContentVerticalAlignment,
							})
						}
						alignmentControls={contentVerticalAlignmentControls}
					/>
				</BlockControls>
				<div className={className}>
					<InnerBlocks templateLock={false} renderAppender={hasChildBlocks ? undefined : () => <InnerBlocks.ButtonBlockAppender />} />
				</div>
			</Fragment>
		);
	}
}

export default compose(
	withSelect((select, ownProps) => {
		const { clientId } = ownProps;
		const { getBlockOrder } = select("core/block-editor") || select("core/editor"); // Fallback to 'core/editor' for backwards compatibility

		return {
			hasChildBlocks: getBlockOrder(clientId).length > 0,
		};
	})
)(BootstrapColumnEdit);
