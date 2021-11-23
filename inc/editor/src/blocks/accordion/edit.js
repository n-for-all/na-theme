// WordPress dependencies
import { __ } from "@wordpress/i18n";
import { CheckboxControl, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl } from "@wordpress/components";
import { Component, Fragment } from "@wordpress/element";
import { withSelect } from "@wordpress/data";
import { compose } from "@wordpress/compose";
import { applyFilters } from "@wordpress/hooks";

import * as BlockEditor from "@wordpress/block-editor";
import * as Editor from "@wordpress/editor";

import { verticalAlignBottom, verticalAlignCenter, verticalAlignTop } from "../../icons";

const { InnerBlocks, InspectorControls, BlockControls, AlignmentToolbar } = BlockEditor || Editor; // Fallback to deprecated '@wordpress/editor' for backwards compatibility

const AccordionTextareaControl = ({ value }) => {
	const [text, setText] = useState(value);

	return <TextareaControl label="Text" help="Enter some text" value={text} onChange={(value) => setText(value)} />;
};

const AccordionTextControl = ({ value }) => {
	const [text, setText] = useState(value);

	return <TextControl label="Text" help="Enter some text" value={text} onChange={(value) => setText(value)} />;
};

class AccordionEdit extends Component {
	render() {
		const { attributes, className, setAttributes, hasChildBlocks } = this.props;
		const { openByDefault, title, content } = attributes;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={__("Accordion Settings", "na-theme")} initialOpen={false}>
						<CheckboxControl label={__("Open By Default", "na-theme")} checked={openByDefault} onChange={(isChecked) => setAttributes({ openByDefault: isChecked })} />
						<hr />
						<AccordionTextControl label="Title" value={title} />
						<hr />
						<AccordionTextareaControl label="Content" value={content} />
					</PanelBody>
				</InspectorControls>
				<div className={className}>
					<InnerBlocks templateLock={false} renderAppender={hasChildBlocks ? undefined : () => <InnerBlocks.ButtonBlockAppender />} />
				</div>
			</Fragment>
		);
	}
}

export default compose(
	withSelect((select, ownProps) => {
		const { clientId } = ownProps;
		const { getBlockOrder } = select("core/block-editor") || select("core/editor"); // Fallback to 'core/editor' for backwards compatibility

		return {
			hasChildBlocks: getBlockOrder(clientId).length > 0,
		};
	})
)(AccordionEdit);
