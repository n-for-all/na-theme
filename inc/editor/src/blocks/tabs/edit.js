// WordPress dependencies
import { __ } from '@wordpress/i18n';
import {
	IconButton,
	CheckboxControl,
	PanelBody,
	SelectControl,
	SVG,
	Path,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import * as BlockEditor from '@wordpress/block-editor';

import {
	alignCenter,
	alignLeft,
	alignRight,
	templateIconMissing,
	verticalAlignBottom,
	verticalAlignCenter,
	verticalAlignTop,
} from '../../icons';

const { InnerBlocks, InspectorControls, BlockControls, AlignmentToolbar } =
	BlockEditor;

export const CUSTOM_TEMPLATE_NAME = 'custom';

const ALLOWED_BLOCKS = [ 'na-theme-blocks/tab' ];

const addMissingTemplateIcons = ( templates ) => {
	return templates.map( ( template ) => {
		return { icon: templateIconMissing, ...template };
	} );
};

let templates = [
];

templates = addMissingTemplateIcons( templates );

export const enableCustomTemplate = applyFilters(
	'rm.tabs.enableCustomTemplate',
	true
);
if ( enableCustomTemplate ) {
	templates.push( {
		name: CUSTOM_TEMPLATE_NAME,
		title: __( 'Custom', 'na-theme' ),
		icon: templateIconMissing,
		templateLock: false,
		template: [ [ 'na-theme-blocks/tab' ] ],
	} );
}

const getTabsTemplate = ( templateName ) => {
	const template = templates.find( ( t ) => t.name === templateName );
	return template ? template.template : [];
};
const getTabsTemplateLock = ( templateName ) => {
	const template = templates.find( ( t ) => t.name === templateName );
	return template ? template.templateLock : false;
};

class BootstrapTabsEdit extends Component {
	render() {
		const {
			className,
			attributes,
			setAttributes,
			tabs,
			updateBlockAttributes,
		} = this.props;
		const {
			template: selectedTemplateName,
			alignment,
			verticalAlignment,
			editorStackTabs,
			horizontalGutters,
			verticalGutters,
		} = attributes;

		const onTemplateChange = ( newSelectedTemplateName ) => {
			const template = templates.find(
				( t ) => t.name === newSelectedTemplateName
			);
			if ( template ) {
				// Update sizes to fit with selected template
				tabs.forEach( ( tab, index ) => {
					if ( template.template.length > index ) {
						const newAttributes = template.template[ index ][ 1 ];
						updateBlockAttributes( tab.clientId, newAttributes );
					}
				} );

				setAttributes( {
					template: newSelectedTemplateName,
				} );
			}
		};

		const alignmentControls = [
			{
				icon: alignLeft,
				title: __( 'Align tabs left', 'na-theme' ),
				align: 'left',
			},
			{
				icon: alignCenter,
				title: __( 'Align tabs center', 'na-theme' ),
				align: 'center',
			},
			{
				icon: alignRight,
				title: __( 'Align tabs right', 'na-theme' ),
				align: 'right',
			},
		];

		const verticalAlignmentControls = [
			{
				icon: verticalAlignTop,
				title: __( 'Align tabs top', 'na-theme' ),
				align: 'top',
			},
			{
				icon: verticalAlignCenter,
				title: __( 'Align tabs center', 'na-theme' ),
				align: 'center',
			},
			{
				icon: verticalAlignBottom,
				title: __( 'Align tabs bottom', 'na-theme' ),
				align: 'bottom',
			},
		];

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody>
						<CheckboxControl
							label={ __(
								'Editor: Display tabs stacked',
								'na-theme'
							) }
							description={ __(
								"Displays stacked tabs in editor to enhance readability of block content. This option is only used in the editor and won't affect the output of the tabs.",
								'na-theme'
							) }
							checked={ editorStackTabs }
							onChange={ ( isChecked ) =>
								setAttributes( {
									editorStackTabs: isChecked,
								} )
							}
						/>
					</PanelBody>
					<PanelBody
						title={ __( 'Change layout', 'na-theme' ) }
					>
						<ul className="na-theme-blocks-template-selector-list">
							{ templates.map( (
								template,
								index // eslint-disable-line no-shadow
							) => (
								<li
									className="na-theme-blocks-template-selector-button"
									key={ index }
								>
									<IconButton
										label={ template.title }
										icon={ template.icon }
										onClick={ () => {
											onTemplateChange( template.name );
										} }
										className={
											selectedTemplateName ===
											template.name
												? 'is-active'
												: null
										}
									>
										<div className="na-theme-blocks-template-selector-button-label">
											{ template.title }
										</div>
									</IconButton>
								</li>
							) ) }
						</ul>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<AlignmentToolbar
						value={ alignment }
						label={ __(
							'Change horizontal alignment of tabs',
							'na-theme'
						) }
						onChange={ ( newAlignment ) =>
							setAttributes( { alignment: newAlignment } )
						}
						alignmentControls={ alignmentControls }
					/>
					<AlignmentToolbar
						value={ verticalAlignment }
						label={ __(
							'Change vertical alignment of tabs',
							'na-theme'
						) }
						onChange={ ( newVerticalAlignment ) =>
							setAttributes( {
								verticalAlignment: newVerticalAlignment,
							} )
						}
						alignmentControls={ verticalAlignmentControls }
					/>
				</BlockControls>
				<div className={ className }>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ getTabsTemplate( selectedTemplateName ) }
						templateLock={ getTabsTemplateLock(
							selectedTemplateName
						) }
						orientation="horizontal" 
					/>
				</div>
			</Fragment> 
		);
	}
}

const applyWithSelect = withSelect( ( select, { clientId } ) => {
	const { getBlocksByClientId } =
		select( 'core/block-editor' ) || select( 'core/editor' ); // Fallback to 'core/editor' for backwards compatibility

	const tabs = getBlocksByClientId( clientId )[ 0 ]
		? getBlocksByClientId( clientId )[ 0 ].innerBlocks
		: [];

	return {
		tabs,
	};
} );

const applyWithDispatch = withDispatch( ( dispatch ) => {
	const { updateBlockAttributes } =
		dispatch( 'core/block-editor' ) || dispatch( 'core/editor' ); // Fallback to 'core/editor' for backwards compatibility

	return {
		updateBlockAttributes,
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch
)( BootstrapTabsEdit );
