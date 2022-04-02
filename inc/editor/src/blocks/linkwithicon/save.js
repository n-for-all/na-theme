/**
 * External dependencies
 */
import classnames from "classnames";
import { noop, isEmpty } from "lodash";

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

/**
 * Internal dependencies
 */
import { imageFillStyles } from "./media-container";

const DEFAULT_MEDIA_WIDTH = 50;

export default function save({ attributes }) {
	const { mediaPosition, mediaUrl, mediaWidth, mediaId, verticalAlignment, imageFill, link } = attributes;
	const backgroundStyles = imageFillStyles(mediaUrl, imageFill, verticalAlignment);
	let image = null;
	image = (
		<a href={link} className="wp-block-background-text">
			<div className="wp-block-background-image" style={backgroundStyles}></div>
			<div className="wp-block-background-text">
				<InnerBlocks.Content />
			</div>
		</a>
	);
	const className = classnames({
		"has-media-on-the-right": "right" === mediaPosition,
	});

	return <div {...useBlockProps.save()}>{image}</div>;
}
