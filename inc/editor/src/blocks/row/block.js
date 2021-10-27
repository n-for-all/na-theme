/**
 * BLOCK: wp-bootstrap-blocks/row
 */

// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';

import edit from './edit';
import transforms from './transforms';
import { columns } from '../../icons';

const { InnerBlocks } = BlockEditor || Editor; // Fallback to deprecated '@wordpress/editor' for backwards compatibility

registerBlockType( 'na-theme-blocks/row', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Row', 'na-theme' ), // Block title.
	icon: columns, // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'na-theme', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'Row', 'na-theme' ),
		__( 'Bootstrap Row', 'na-theme' ),
		__( 'Bootstrap', 'na-theme' ),
	],

	supports: {
		align: [ 'full' ],
	},

	transforms,

	// attributes are defined server side with register_block_type(). This is needed to make default attributes available in the blocks render callback.

	getEditWrapperProps( attributes ) {
		return {
			'data-alignment': attributes.alignment,
			'data-vertical-alignment': attributes.verticalAlignment,
			'data-editor-stack-columns': attributes.editorStackColumns,
		};
	},

	edit,

	save() {
		return <InnerBlocks.Content />;
	},
} );
