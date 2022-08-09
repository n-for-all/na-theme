/**
 * BLOCK: na-theme/grid
 */

// WordPress dependencies
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import * as BlockEditor from "@wordpress/block-editor";
import * as Editor from "@wordpress/editor";

import edit from "./edit";
import { stack } from "../../icons";

const { InnerBlocks } = BlockEditor || Editor;

registerBlockType("na-theme-blocks/grid", {
	title: __("Grid", "na-theme"),
	icon: stack,
	category: "na-theme", 
	keywords: [__("Grid", "na-theme"), __("Bootstrap Grid", "na-theme"), __("Bootstrap", "na-theme")],

	supports: {
		align: false,
	},

	getEditWrapperProps(attributes) {
		const { columns } = attributes;

		return {
			"data-columns": columns,
		};
	},
	edit,

	save() {
		return <InnerBlocks.Content />;
	},
});
