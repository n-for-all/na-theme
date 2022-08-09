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

const { InnerBlocks } = BlockEditor || Editor;

registerBlockType( 'na-theme-blocks/container', {
	
	title: __( 'Container', 'na-theme' ),
	icon: stack,
	category: 'na-theme',
	keywords: [
		__( 'Container', 'na-theme' ),
		__( 'Bootstrap Container', 'na-theme' ),
		__( 'Bootstrap', 'na-theme' ),
	],

	supports: {
		align: false,
	},

	

	edit,

	save() {
		return <InnerBlocks.Content />;
	},
} );
