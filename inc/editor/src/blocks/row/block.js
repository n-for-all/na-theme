// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';

import edit from './edit';
import transforms from './transforms';
import { columns } from '../../icons';

const { InnerBlocks } = BlockEditor || Editor;

registerBlockType( 'na-theme-blocks/row', {
	
	title: __( 'Row', 'na-theme' ),
	icon: columns,
	category: 'na-theme',
	keywords: [
		__( 'Row', 'na-theme' ),
		__( 'Bootstrap Row', 'na-theme' ),
		__( 'Bootstrap', 'na-theme' ),
	],

	supports: {
		align: [ 'full' ],
	},

	transforms,

	

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
