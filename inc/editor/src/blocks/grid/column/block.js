/**
 * BLOCK: na-theme/column
 */

// WordPress dependencies
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import * as BlockEditor from "@wordpress/block-editor";
import * as Editor from "@wordpress/editor";

import edit, { bgColorOptions } from "./edit";
import { column } from "../../../icons";

const { InnerBlocks } = BlockEditor || Editor; // Fallback to deprecated '@wordpress/editor' for backwards compatibility

registerBlockType("na-theme-blocks/grid-column", {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __("Grid Column", "na-theme"), // Block title.
	icon: column, // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: "na-theme", // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [__("Grid Column", "na-theme"), __("Bootstrap Column", "na-theme"), __("Bootstrap", "na-theme")],
	parent: ["na-theme-blocks/grid"],

	// attributes are defined server side with register_block_type(). This is needed to make default attributes available in the blocks render callback.

	getEditWrapperProps(attributes) {
		const { sizeXxl, sizeXl, sizeLg, sizeMd, sizeSm, sizeXs, bgColor, padding, contentVerticalAlignment } = attributes;

		// Prepare styles for selected background-color
		let style = {};
		if (bgColor) {
			const selectedBgColor = bgColorOptions.find((bgColorOption) => bgColorOption.name === bgColor);
			if (selectedBgColor) {
				style = {
					backgroundColor: selectedBgColor.color,
				};
			}
		}

		return {
			"data-size-xs": sizeXs,
			"data-size-sm": sizeSm,
			"data-size-md": sizeMd,
			"data-size-lg": sizeLg,
			"data-size-xl": sizeXl,
			"data-size-xxl": sizeXxl,
			"data-bg-color": bgColor,
			"data-padding": padding,
			"data-content-vertical-alignment": contentVerticalAlignment,
			style,
		};
	},

	edit,

	save() {
		return <InnerBlocks.Content />;
	},
});
