// WordPress dependencies
import { __, _x } from "@wordpress/i18n";
import { CheckboxControl, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl } from "@wordpress/components";
import { useState, useRef, Component, Fragment } from "@wordpress/element";
import { withSelect } from "@wordpress/data";
import { compose } from "@wordpress/compose";
import { applyFilters } from "@wordpress/hooks";

import * as BlockEditor from "@wordpress/block-editor";
import { useInnerBlocksProps, useBlockProps } from "@wordpress/block-editor";

import { verticalAlignBottom, verticalAlignCenter, verticalAlignTop } from "../../icons";

const { InnerBlocks, InspectorControls, BlockControls, AlignmentToolbar } = BlockEditor;

/**
 * Constants
 */
const TEMPLATE_TEXT = [
	[
		"core/heading",
		{
			level: 3,
			fontSize: "default",
			className: "block-title",
			placeholder: _x("Title...", "content placeholder"),
		},
	],
	[
		"core/paragraph",
		{
			fontSize: "default",
			level: 4,
			className: "block-content",
			placeholder: _x("Block content...", "content placeholder"),
		},
	],
];

function AccordionEdit({ attributes, className, setAttributes, hasChildBlocks }) {
	const { openByDefault } = attributes;
	const innerBlocksProps = useInnerBlocksProps({ className: className }, { template: TEMPLATE_TEXT });
	const blockProps = useBlockProps({
		className: className,
	});
	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={__("Accordion Settings", "na-theme")} initialOpen={false}>
					<CheckboxControl label={__("Open By Default", "na-theme")} checked={openByDefault} onChange={(isChecked) => setAttributes({ openByDefault: isChecked })} />
				</PanelBody>
			</InspectorControls>
			<BlockControls group="block">
			</BlockControls>
			<div {...blockProps}>
				<div {...innerBlocksProps}>
					<InnerBlocks templateLock={"all"} template={TEMPLATE_TEXT} />
				</div>
			</div>
		</Fragment>
	);
}

export default AccordionEdit;
