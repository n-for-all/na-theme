import * as React from "react";
// import {useRef, useState} from "@wordpress/element";
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
const { useState, useRef } = wp.element;
declare let ajaxurl: string;
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
// Attached media sidebar
const attachedMediaCss = `
.na-attachment-div-container{
    padding:1rem;
}
.na-attachment-div {
    display: flex;
    flex-wrap: wrap;
}
.na-attachment-div>div {
    position: relative;
    width: 33%;
}
.na-attachment-div>div>img {
    width: 100%;
    border: 1px solid #ffffff;
    transition: 0.3s all linear;
}
.na-attachment-div>div:hover>img {
    border: 1px solid red;
}
.na-attachment-div .unattach-attachment {
    position: absolute;
    top: 2px;
    right: 1px;
    text-decoration: none;
    color: #4b4b4b;
}
.na-attachment-div .unattach-attachment:hover>span {
    color: #eee;
}
`;
let frame;
const Sidebar = () => {
	const [images, setImages] = useState(naThemeData.images);
	const ref = useRef(null);
	const uploadAttachment = (e: React.MouseEvent<HTMLInputElement>) => {
		e.preventDefault();
		wp.media.controller.Library.prototype.defaults.contentUserSetting = false;
		if (frame) {
			frame.open();
			return;
		}
		frame = wp.media({
			title: "Select or Upload Media Attachments",
			button: {
				text: "Use this media",
			},
			multiple: false,
		});
		frame.on("select", () => {
			let attachment = frame.state().get("selection").first().toJSON();
			attachAttachment(attachment.id, () => {
				setImages(images.concat([attachment]));
			});
		});
		frame.open();
	};
	const unattachAttachment = (e: React.MouseEvent<HTMLAnchorElement>, attachmentId: string) => {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", ajaxurl, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				try {
					let json = JSON.parse(xhr.responseText);
					if (json.status == "success") {
						setImages(images.filter((item) => item.id != attachmentId));
					} else {
						console.error(json.message);
					}
				} catch (err) {
					console.error("Something went wrong: " + err.message);
				}
			}
		};
		let confirmDelete = confirm("Are you sure you want to delete this attachment?");
		if (confirmDelete) {
			xhr.send("action=unattach_attachment&attachment_id=" + attachmentId);
		}
	};
	const attachAttachment = (attachmentId: string, callback) => {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", ajaxurl, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				try {
					let json = JSON.parse(xhr.responseText);
					if (json.status == "success") {
						callback();
					} else {
						console.error(json.message);
					}
				} catch (err) {
					console.error("Something went wrong: " + err.message);
				}
			}
		};
		xhr.send("action=attach_attachment&attachment_id=" + attachmentId + "&post_id=" + naThemeData.post_id);
	};
	return (
		<Fragment>
			<PluginSidebarMoreMenuItem target="sidebar-name">Attached Media</PluginSidebarMoreMenuItem>
			<PluginSidebar name="sidebar-name" title="Attached Media">
				<div className="na-attachment-div-container">
					<p>
						<input type="button" value="Upload Images" onClick={uploadAttachment} className="components-button is-primary" />
					</p>
					<div className="na-attachment-div">
						{images.map((image) => {
							return (
								<div key={image.id}>
									<img src={image.url} />
									<a href="#" className="unattach-attachment" onClick={(e) => unattachAttachment(e, image.id)} ref={ref}>
										<span className="dashicons dashicons-no"></span>
									</a>
								</div>
							);
						})}
						<style>{attachedMediaCss}</style>
					</div>
				</div>
			</PluginSidebar>
		</Fragment>
	);
};
registerPlugin("na-theme-sidebar", {
	icon: "palmtree",
	render: Sidebar,
});
addFilter("editor.BlockEdit", "editorskit/custom-advanced-control", withAdvancedControls);
// addAction("all", "editor", (name) => {
// 	console.log(name);
// });
