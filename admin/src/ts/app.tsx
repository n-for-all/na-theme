import * as React from "react";

declare let wp: any, naThemeData: any;
/**
 * WordPress Dependencies
 */

if (!wp.plugins) {
	throw new Error("wp.plugin is not loaded");
}

const { addFilter, addAction } = wp.hooks;
const { registerPlugin } = wp.plugins;
const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { InspectorAdvancedControls } = wp.blockEditor;
const { createHigherOrderComponent, compose } = wp.compose;
const { ToggleControl, SelectControl, TextControl } = wp.components;
const { PluginDocumentSettingPanel, PluginSidebarMoreMenuItem, PluginSidebar } = wp.editPost;
const { withSelect, withDispatch } = wp.data;

/**
 * Add custom attribute for mobile visibility.
 *
 * @param {Object} settings Settings for the block.
 *
 * @return {Object} settings Modified settings.
 */
function addAttributes(settings) {
	//check if object exists for old Gutenberg version compatibility
	if (typeof settings.attributes !== "undefined") {
		settings.attributes = Object.assign(settings.attributes, {
			visibleOnMobile: {
				type: "boolean",
				default: true,
			},
		});
	}

	return settings;
}

addFilter("blocks.registerBlockType", "editorskit/custom-attributes", addAttributes);

/**
 * Add mobile visibility controls on Advanced Block Panel.
 *
 * @param {function} BlockEdit Block edit component.
 *
 * @return {function} BlockEdit Modified block edit component.
 */
const withAdvancedControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { attributes, setAttributes, isSelected } = props;

		const { visibleOnMobile } = attributes;

		return (
			<>
				<BlockEdit {...props} />
				{isSelected && (
					<InspectorAdvancedControls>
						<ToggleControl
							label={__("Mobile Devices Visibity")}
							checked={!!visibleOnMobile}
							onChange={() => setAttributes({ visibleOnMobile: !visibleOnMobile })}
							help={!!visibleOnMobile ? __("Showing on mobile devices.") : __("Hidden on mobile devices.")}
						/>
					</InspectorAdvancedControls>
				)}
			</>
		);
	};
}, "withAdvancedControls");

var MetaTextControl = compose(
	withDispatch(function (dispatch, props) {
		return {
			setMetaValue: function (metaValue) {
				dispatch("core/editor").editPost({ meta: { [props.name]: metaValue } });
			},
		};
	}),
	withSelect(function (select, props) {
		return {
			metaValue: select("core/editor").getEditedPostAttribute("meta")[props.name],
		};
	})
)((props) => <TextControl name={props.name} label={props.label} value={props.metaValue} onChange={(content) => props.setMetaValue(content)} />);

var MetaSelectControl = compose(
	withDispatch(function (dispatch, props) {
		return {
			setMetaValue: function (metaValue) {
				dispatch("core/editor").editPost({ meta: { [props.name]: metaValue } });
			},
		};
	}),
	withSelect(function (select, props) {
		return {
			metaValue: select("core/editor").getEditedPostAttribute("meta")[props.name],
		};
	})
)((props) => (
	<SelectControl
		name={props.name}
		label={props.label}
		value={props.metaValue}
		onChange={(content) => props.setMetaValue(content)}
		options={props.options}
	/>
));

const SectionTemplate = () => (
	<Fragment>
		<PluginDocumentSettingPanel name="section-template" title="Section Template" className="na-section-template">
			<p>This will only render on the sections page</p>
			<MetaSelectControl name={"_wp_page_template_part"} label={"Template Part"} options={naThemeData.templates} />
			<MetaSelectControl
				name={"_wp_page_template_layout"}
				label={"Template Layout"}
				options={[
					{ label: "None", value: "none" },
					{ label: "Boxed", value: "container" },
					{ label: "Boxed Offset", value: "container boxed-offset" },
					{ label: "Fluid", value: "container-fluid" },
				]}
			/>
			<MetaTextControl name={"_wp_section_id"} label={"Section ID"} />
			<MetaTextControl name={"_wp_section_class"} label={"Additional CSS Class"} />
		</PluginDocumentSettingPanel>
	</Fragment>
);

registerPlugin("na-theme", {
	render: SectionTemplate,
	icon: "palmtree",
});

const Sidebar = () => (
	<Fragment>
		<PluginSidebarMoreMenuItem target="sidebar-name">Attached Media</PluginSidebarMoreMenuItem>
		<PluginSidebar name="sidebar-name" title="Attached Media">
			<div style={{ display: "flex", flexWrap: "wrap" }}>
				{naThemeData.map((image) => {
					return <img src={image.url} style={{ maxWidth: "100%" }} />;
				})}
				Content of the sidebar
			</div>
			<a
				href="#"
				onClick={(e) => {
					e.preventDefault();
					let frame = wp.media({
						title: "Select or Upload Media Attachments",
						button: {
							text: "Use this media",
						},
						multiple: false, // Set to true to allow multiple files to be selected
					});
					frame.open();
				}}
				target="_blank">
				Upload Images
			</a>
		</PluginSidebar>
	</Fragment>
);

registerPlugin("na-theme-sidebar", {
	icon: "palmtree",
	render: Sidebar,
});

addFilter("editor.BlockEdit", "editorskit/custom-advanced-control", withAdvancedControls);
addAction("all", "editor", (name) => {
	console.log(name);
});
