/**
 * BLOCK: na-theme/container
 */

// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';

import edit from './edit';
import { stack } from '../../icons';

const { InnerBlocks } = BlockEditor || Editor; // Fallback to deprecated '@wordpress/editor' for backwards compatibility

registerBlockType( 'na-theme-blocks/container', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Container', 'na-theme' ), // Block title.
	icon: stack,
	category: 'na-theme', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'Container', 'na-theme' ),
		__( 'Bootstrap Container', 'na-theme' ),
		__( 'Bootstrap', 'na-theme' ),
	],

	supports: {
		align: false,
	},

	// attributes are defined server side with register_block_type(). This is needed to make default attributes available in the blocks render callback.

	edit,

	save() {
		return <InnerBlocks.Content />;
	},
} );
