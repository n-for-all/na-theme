import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { label } = attributes;
	return <InnerBlocks.Content>{label}</InnerBlocks.Content>;
}
