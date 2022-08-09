// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as BlockEditor from '@wordpress/block-editor';
import * as Editor from '@wordpress/editor';

import edit from './edit';
import transforms from './transforms';
import { tabs } from '../../icons';

const { InnerBlocks } = BlockEditor || Editor;

registerBlockType( 'na-theme-blocks/tabs', {
	title: __( 'Tabs', 'na-theme' ),
	icon: tabs, 
	category: 'na-theme',
	keywords: [
		__( 'Tabs', 'na-theme' ),
		__( 'Bootstrap Tabs', 'na-theme' ),
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
