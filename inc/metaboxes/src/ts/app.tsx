import * as React from "react";

declare let wp: any, naThemeMetaboxes: any;
/**
 * WordPress Dependencies
 */

const { registerPlugin } = wp.plugins;
const { Fragment } = wp.element;
const { compose } = wp.compose;
const { SelectControl, TextControl, TextareaControl } = wp.components;
const { withSelect, withDispatch } = wp.data;
const { PluginDocumentSettingPanel }  = wp.editPost;

var MetaTextControl = compose(
	withDispatch(function (dispatch, props) {
		let meta = Object.assign({}, wp.data.select("core/editor").getEditedPostAttribute("nameta"));
		return {
			setMetaValue: function (metaValue) {
				meta[props.name] = metaValue;
				dispatch("core/editor").editPost({ nameta: meta });
			},
		};
	}),
	withSelect(function (select, props) {
		let mt = select("core/editor").getEditedPostAttribute("nameta");
		return {
			metaValue: mt ? mt[props.name] : "",
		};
	})
)((props) => <TextControl name={props.name} label={props.label} value={props.metaValue} onChange={(content) => props.setMetaValue(content)} />);

var MetaTextAreaControl = compose(
	withDispatch(function (dispatch, props) {
		let meta = Object.assign({}, wp.data.select("core/editor").getEditedPostAttribute("nameta"));
		return {
			setMetaValue: function (metaValue) {
				meta[props.name] = metaValue;
				dispatch("core/editor").editPost({ nameta: meta });
			},
		};
	}),
	withSelect(function (select, props) {
		let mt = select("core/editor").getEditedPostAttribute("nameta");
		return {
			metaValue: mt ? mt[props.name] : "",
		};
	})
)((props) => <TextareaControl name={props.name} label={props.label} value={props.metaValue} onChange={(content) => props.setMetaValue(content)} />);

var MetaSelectControl = compose(
	withDispatch(function (dispatch, props) {
		return {
			setMetaValue: function (metaValue) {
				dispatch("core/editor").editPost({ nameta: { [props.name]: metaValue } });
			},
		};
	}),
	withSelect(function (select, props) {
		let mt = select("core/editor").getEditedPostAttribute("nameta");
		return {
			metaValue: mt ? mt[props.name] : "",
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

const SectionTemplate = () => {
	let sections = naThemeMetaboxes["sections"] || [];
	let metaboxes = naThemeMetaboxes["metaboxes"] || [];
	return (
		<Fragment>
			{sections.map((section, index) => {
				let metas = [];
				if (metaboxes[section.name]) {
					metas = metaboxes[section.name].map((metabox, indexMetabox) => {
						let control = null;
						if (metabox.type == "text") {
							control = <MetaTextControl name={`${metabox.name}`} label={metabox.label} />;
						}
						if (metabox.type == "textarea") {
							control = <MetaTextAreaControl name={`${metabox.name}`} label={metabox.label} />;
						}
						if (metabox.type == "select") {
							control = <MetaSelectControl name={`${metabox.name}`} label={metabox.label} options={metabox.options} />;
						}
						return <div key={"metabox-" + indexMetabox}>{control}</div>;
					});
				}
				return (
					<PluginDocumentSettingPanel
						key={"section-" + index}
						name={section.name}
						title={section.label}
						className={"na-metabox-section na-metabox-section-" + section.name}>
						{section.description && section.description != "" ? <p>{section.description}</p> : null}
						{metas}
					</PluginDocumentSettingPanel>
				);
			})}
		</Fragment>
	);
};

registerPlugin("na-theme-metabox", {
	render: SectionTemplate,
	icon: "palmtree",
});
