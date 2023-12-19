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
import {
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentControl,
	useInnerBlocksProps,
	InspectorControls,
	useBlockProps,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl, TextareaControl, ToggleControl, ToolbarButton, TextControl, FocalPointPicker } from "@wordpress/components";
import { pullLeft, pullRight } from "@wordpress/icons";


function BackgroundEdit({ attributes, isSelected, setAttributes }) {
	const { className, href, atts, label } = attributes;

	const mediaTextGeneralSettings = (
		<PanelBody title={__("Settings")}>
			<TextControl
				label={__("Label")}
				value={label}
				onChange={(value) =>
					setAttributes({
						label: value,
					})
				}
			/>
			<TextControl
				label={__("Class")}
				value={className}
				onChange={(value) =>
					setAttributes({
						className: value,
					})
				}
			/>
			<TextControl
				label={__("Href")}
				value={href}
				onChange={(value) =>
					setAttributes({
						href: value,
					})
				}
			/>
			<TextControl
				label={__("Attributes")}
				value={atts}
				onChange={(value) =>
					setAttributes({
						atts: value,
					})
				}
			/>
		</PanelBody>
	);

	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps({ className: "wp-block-button-link" });

	return (
		<Fragment>
			<InspectorControls>{mediaTextGeneralSettings}</InspectorControls>
			<div>
				<div {...innerBlocksProps}>
                    {label}
				</div>
			</div>
		</Fragment>
	);
}

export default BackgroundEdit;
