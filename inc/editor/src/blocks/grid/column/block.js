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

const { InnerBlocks } = BlockEditor || Editor;

registerBlockType("na-theme-blocks/grid-column", {
	
	title: __("Grid Column", "na-theme"),
	icon: column,
	category: "na-theme",
	keywords: [__("Grid Column", "na-theme"), __("Bootstrap Column", "na-theme"), __("Bootstrap", "na-theme")],
	parent: ["na-theme-blocks/grid"],

	

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
