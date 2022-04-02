/**
 * External dependencies
 */
import classnames from "classnames";
import { map, filter } from "lodash";
import { compose } from "@wordpress/compose";
/**
 * WordPress dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { useSelect, withSelect } from "@wordpress/data";
import { useState, useRef, Component, Fragment } from "@wordpress/element";
import { InnerBlocks, BlockControls, BlockVerticalAlignmentControl, useInnerBlocksProps, InspectorControls, useBlockProps, store as blockEditorStore } from "@wordpress/block-editor";
import { PanelBody, RangeControl, TextareaControl, ToggleControl, ToolbarButton, TextControl, FocalPointPicker } from "@wordpress/components";
import { pullLeft, pullRight } from "@wordpress/icons";

/**
 * Constants
 */
const TEMPLATE_TEXT = [
	[
		"core/heading",
		{
			level: 2,
			fontSize: "default",
			className: "block-title",
			placeholder: _x("Title...", "content placeholder"),
		},
	],
	[
		"core/heading",
		{
			fontSize: "small",
			level: 4,
			className: "block-content",
			placeholder: _x("Content...", "content placeholder"),
		},
	],
];

function BackgroundEdit({ attributes, isSelected, setAttributes }) {
	const { start, step, end, prefix, suffix, seperator, duration } = attributes;

	const mediaTextGeneralSettings = (
		<PanelBody title={__("Settings")}>
			<TextControl
				label={__("Duration")}
				value={duration}
				onChange={(value) =>
					setAttributes({
						duration: value,
					})
				}
			/>
            <TextControl
				label={__("Start")}
				value={start}
				onChange={(value) =>
					setAttributes({
						start: value,
					})
				}
			/>
			<TextControl
				label={__("Step")}
				value={step}
				onChange={(value) =>
					setAttributes({
						step: value,
					})
				}
			/>
			<TextControl
				label={__("End")}
				value={end}
				onChange={(value) =>
					setAttributes({
						end: value,
					})
				}
			/>
			<TextControl
				label={__("Prefix")}
				value={prefix}
				onChange={(value) =>
					setAttributes({
						prefix: value,
					})
				}
			/>
			<TextControl
				label={__("Suffix")}
				value={suffix}
				onChange={(value) =>
					setAttributes({
						suffix: value,
					})
				}
			/>
			<TextControl
				label={__("Thousand Seperator")}
				value={seperator}
				onChange={(value) =>
					setAttributes({
						seperator: value,
					})
				}
			/>
		</PanelBody>
	);

	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps({ className: "wp-block-counter-text" }, { template: TEMPLATE_TEXT });

	return (
		<Fragment>
			<InspectorControls>{mediaTextGeneralSettings}</InspectorControls>
			<div>
				<div {...innerBlocksProps}>
					<InnerBlocks template={TEMPLATE_TEXT} templateLock="all" />
				</div>
			</div>
		</Fragment>
	);
}

export default BackgroundEdit;
