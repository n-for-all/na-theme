/**
 * External dependencies
 */
import classnames from "classnames";
import { noop, isEmpty } from "lodash";

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { openByDefault } = attributes;
	return (
		<div
			{...useBlockProps.save({
				className: openByDefault ? "open" : "",
			})}>
			<InnerBlocks.Content />
		</div>
	);
}
