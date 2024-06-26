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

const ALLOWED_BLOCKS = [ 'na-theme-blocks/column' ];

const addMissingTemplateIcons = ( templates ) => {
	return templates.map( ( template ) => {
		return { icon: templateIconMissing, ...template };
	} );
};

let templates = [
	{
		name: '1-1',
		title: __( '2 Columns (1:1)', 'na-theme' ),
		icon: (
			<SVG
				width="48"
				height="48"
				viewBox="0 0 48 48"
				xmlns="http://www.w3.org/2000/svg"
			>
				<Path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H25V34H39ZM23 34H9V14H23V34Z"
				/>
			</SVG>
		),
		templateLock: 'all',
		template: [
			[
				'na-theme-blocks/column',
				{
					sizeMd: 6,
				},
			],
			[
				'na-theme-blocks/column',
				{
					sizeMd: 6,
				},
			],
		],
	},
	{
		name: '1-2',
		title: __( '2 Columns (1:2)', 'na-theme' ),
		icon: (
			<SVG
				width="48"
				height="48"
				viewBox="0 0 48 48"
				xmlns="http://www.w3.org/2000/svg"
			>
				<Path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H20V34H39ZM18 34H9V14H18V34Z"
				/>
			</SVG>
		),
		templateLock: 'all',
		template: [
			[
				'na-theme-blocks/column',
				{
					sizeMd: 4,
				},
			],
			[
				'na-theme-blocks/column',
				{
					sizeMd: 8,
				},
			],
		],
	},
	{
		name: '2-1',
		title: __( '2 Columns (2:1)', 'na-theme' ),
		icon: (
			<SVG
				width="48"
				height="48"
				viewBox="0 0 48 48"
				xmlns="http://www.w3.org/2000/svg"
			>
				<Path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H30V34H39ZM28 34H9V14H28V34Z"
				/>
			</SVG>
		),
		templateLock: 'all',
		template: [
			[
				'na-theme-blocks/column',
				{
					sizeMd: 8,
				},
			],
			[
				'na-theme-blocks/column',
				{
					sizeMd: 4,
				},
			],
		],
	},
	{
		name: '1-1-1',
		title: __( '3 Columns (1:1:1)', 'na-theme' ),
		icon: (
			<SVG
				width="48"
				height="48"
				viewBox="0 0 48 48"
				xmlns="http://www.w3.org/2000/svg"
			>
				<Path
					fillRule="evenodd"
					d="M41 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h30a2 2 0 0 0 2-2V14zM28.5 34h-9V14h9v20zm2 0V14H39v20h-8.5zm-13 0H9V14h8.5v20z"
				/>
			</SVG>
		),
		templateLock: 'all',
		template: [
			[
				'na-theme-blocks/column',
				{
					sizeMd: 4,
				},
			],
			[
				'na-theme-blocks/column',
				{
					sizeMd: 4,
				},
			],
			[
				'na-theme-blocks/column',
				{
					sizeMd: 4,
				},
			],
		],
	},
];

templates = addMissingTemplateIcons( templates );

export const enableCustomTemplate = applyFilters(
	'rm.row.enableCustomTemplate',
	true
);
if ( enableCustomTemplate ) {
	templates.push( {
		name: CUSTOM_TEMPLATE_NAME,
		title: __( 'Custom', 'na-theme' ),
		icon: templateIconMissing,
		templateLock: false,
		template: [ [ 'na-theme-blocks/column' ] ],
	} );
}

let horizontalGuttersOptions = [
	{
		label: __( 'None', 'na-theme' ),
		value: 'gx-0',
	},
	{
		label: __( 'Small', 'na-theme' ),
		value: 'gx-3',
	},
	{
		label: __( 'Large', 'na-theme' ),
		value: 'gx-5',
	},
];

horizontalGuttersOptions = [
	{
		label: __( 'Bootstrap Default', 'na-theme' ),
		value: '', 
	},
	...horizontalGuttersOptions,
];

let verticalGuttersOptions = [
	{
		label: __( 'Small', 'na-theme' ),
		value: 'gy-3',
	},
	{
		label: __( 'Large', 'na-theme' ),
		value: 'gy-5',
	},
];

verticalGuttersOptions = [
	{
		label: __( 'Bootstrap Default (None)', 'na-theme' ),
		value: '',
	},
	...verticalGuttersOptions,
];

const getColumnsTemplate = ( templateName ) => {
	const template = templates.find( ( t ) => t.name === templateName );
	return template ? template.template : [];
};
const getColumnsTemplateLock = ( templateName ) => {
	const template = templates.find( ( t ) => t.name === templateName );
	return template ? template.templateLock : false;
};

class BootstrapRowEdit extends Component {
	render() {
		const {
			className,
			attributes,
			setAttributes,
			columns,
			updateBlockAttributes,
		} = this.props;
		const {
			template: selectedTemplateName,
			noGutters,
			alignment,
			verticalAlignment,
			editorStackColumns,
			horizontalGutters,
			verticalGutters,
		} = attributes;

		const onTemplateChange = ( newSelectedTemplateName ) => {
			const template = templates.find(
				( t ) => t.name === newSelectedTemplateName
			);
			if ( template ) {
				// Update sizes to fit with selected template
				columns.forEach( ( column, index ) => {
					if ( template.template.length > index ) {
						const newAttributes = template.template[ index ][ 1 ];
						updateBlockAttributes( column.clientId, newAttributes );
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
				title: __( 'Align columns left', 'na-theme' ),
				align: 'left',
			},
			{
				icon: alignCenter,
				title: __( 'Align columns center', 'na-theme' ),
				align: 'center',
			},
			{
				icon: alignRight,
				title: __( 'Align columns right', 'na-theme' ),
				align: 'right',
			},
		];

		const verticalAlignmentControls = [
			{
				icon: verticalAlignTop,
				title: __( 'Align columns top', 'na-theme' ),
				align: 'top',
			},
			{
				icon: verticalAlignCenter,
				title: __( 'Align columns center', 'na-theme' ),
				align: 'center',
			},
			{
				icon: verticalAlignBottom,
				title: __( 'Align columns bottom', 'na-theme' ),
				align: 'bottom',
			},
		];

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody>
						<CheckboxControl
							label={ __(
								'Editor: Display columns stacked',
								'na-theme'
							) }
							description={ __(
								"Displays stacked columns in editor to enhance readability of block content. This option is only used in the editor and won't affect the output of the row.",
								'na-theme'
							) }
							checked={ editorStackColumns }
							onChange={ ( isChecked ) =>
								setAttributes( {
									editorStackColumns: isChecked,
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
					<PanelBody
						title={ __( 'Row options', 'na-theme' ) }
					>
						<CheckboxControl
							label={ __( 'No Gutters', 'na-theme' ) }
							checked={ noGutters }
							onChange={ ( isChecked ) =>
								setAttributes( { noGutters: isChecked } )
							}
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<AlignmentToolbar
						value={ alignment }
						label={ __(
							'Change horizontal alignment of columns',
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
							'Change vertical alignment of columns',
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
						template={ getColumnsTemplate( selectedTemplateName ) }
						templateLock={ getColumnsTemplateLock(
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

	const columns = getBlocksByClientId( clientId )[ 0 ]
		? getBlocksByClientId( clientId )[ 0 ].innerBlocks
		: [];

	return {
		columns,
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
)( BootstrapRowEdit );
