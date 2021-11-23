/**
 * WordPress dependencies
 */
import "@wordpress/core-data";
import "@wordpress/block-editor";
import { registerBlockTypeFromMetadata, setDefaultBlockName, setFreeformContentHandlerName, setUnregisteredTypeHandlerName, setGroupingBlockName } from "@wordpress/blocks";

/**
 * Internal dependencies
 */
import * as blockData from "./block.js";

/**
 * Function to register an individual block.
 *
 * @param {Object} block The block to be registered.
 *
 */
const registerBlock = (block) => {
	if (!block) { 
		return;
	}

	const { metadata, settings, name } = block;
	registerBlockTypeFromMetadata({ name, ...metadata }, settings);
};

registerBlock(blockData);
