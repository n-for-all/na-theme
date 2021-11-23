/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { mediaAndText as icon } from "@wordpress/icons";

/**
 * Internal dependencies
 */
import edit from "./edit";
import metadata from "./block.json";
import save from "./save";

const { name, title, category } = metadata;

export { metadata, name };

export const settings = {
	icon,
	title,
	category,
	example: {
		innerBlocks: [
			{
				name: "core/heading",
				attributes: {
					content: __("The wren<br>Earns his living<br>Noiselessly."),
				},
			},
			{
				name: "core/paragraph",
				attributes: {
					content: __("— Kobayashi Issa (一茶)"),
				},
			},
		],
	},
	edit,
	save,
};
