import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { start, step, end, prefix, suffix, seperator } = attributes;
	return (
		<div>
			<div className="wp-block-counter-text">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
