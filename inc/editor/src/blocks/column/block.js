/**
 * BLOCK: na-theme/column
 */

// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as BlockEditor from '@wordpress/block-editor';

import edit, { bgColorOptions } from './edit';
import { column } from '../../icons';

const { InnerBlocks } = BlockEditor;

registerBlockType( 'na-theme-blocks/column', {
	
	title: __( 'Column', 'na-theme' ),
	icon: column,
	category: 'na-theme',
	keywords: [
		__( 'Column', 'na-theme' ),
		__( 'Bootstrap Column', 'na-theme' ),
		__( 'Bootstrap', 'na-theme' ),
	],
	parent: [ 'na-theme-blocks/row' ],

	

	getEditWrapperProps( attributes ) {
		const {
			sizeXxl,
			sizeXl,
			sizeLg,
			sizeMd,
			sizeSm,
			sizeXs,
			equalWidthXxl,
			equalWidthXl,
			equalWidthLg,
			equalWidthMd,
			equalWidthSm,
			equalWidthXs,
			bgColor,
			padding,
			contentVerticalAlignment,
		} = attributes;

		// Prepare styles for selected background-color
		let style = {};
		if ( bgColor ) {
			const selectedBgColor = bgColorOptions.find(
				( bgColorOption ) => bgColorOption.name === bgColor
			);
			if ( selectedBgColor ) {
				style = {
					backgroundColor: selectedBgColor.color,
				};
			}
		}

		return {
			'data-size-xs':
				equalWidthXxl ||
				equalWidthXl ||
				equalWidthLg ||
				equalWidthMd ||
				equalWidthSm ||
				equalWidthXs
					? 0
					: sizeXs,
			'data-size-sm':
				equalWidthXxl ||
				equalWidthXl ||
				equalWidthLg ||
				equalWidthMd ||
				equalWidthSm
					? 0
					: sizeSm,
			'data-size-md':
				equalWidthXxl || equalWidthXl || equalWidthLg || equalWidthMd
					? 0
					: sizeMd,
			'data-size-lg':
				equalWidthXxl || equalWidthXl || equalWidthLg ? 0 : sizeLg,
			'data-size-xl': equalWidthXxl || equalWidthXl ? 0 : sizeXl,
			'data-size-xxl': equalWidthXxl ? 0 : sizeXxl,
			'data-bg-color': bgColor,
			'data-padding': padding,
			'data-content-vertical-alignment': contentVerticalAlignment,
			style,
		};
	},

	edit,

	save() {
		return <InnerBlocks.Content />;
	},
} );
