/**
 * External dependencies
 */
import classnames from "classnames";
import { map, filter } from "lodash";
import { compose } from "@wordpress/compose";
/**
 * WordPress dependencies
 */
import { __, _x } from "@wordpress/i18n";
import { useSelect, withSelect } from "@wordpress/data";
import { useState, useRef, Component, Fragment } from "@wordpress/element";
import { BlockControls, BlockVerticalAlignmentControl, useInnerBlocksProps, InspectorControls, useBlockProps, __experimentalImageURLInputUI as ImageURLInputUI, __experimentalImageSizeControl as ImageSizeControl, store as blockEditorStore } from "@wordpress/block-editor";
import { PanelBody, RangeControl, TextareaControl, ToggleControl, ToolbarButton, ExternalLink, FocalPointPicker, TextControl } from "@wordpress/components";
import { pullLeft, pullRight } from "@wordpress/icons";

/**
 * Internal dependencies
 */
import MediaContainer from "./media-container";
const DEFAULT_MEDIA_SIZE_SLUG = "full";

/**
 * Constants
 */
const TEMPLATE = [
	[
		"core/paragraph",
		{
			fontSize: "default",
			placeholder: _x("Content…", "content placeholder"),
		},
	],
];

// this limits the resize to a safe zone to avoid making broken layouts
const WIDTH_CONSTRAINT_PERCENTAGE = 15;
const applyWidthConstraints = (width) => Math.max(WIDTH_CONSTRAINT_PERCENTAGE, Math.min(width, 100 - WIDTH_CONSTRAINT_PERCENTAGE));

const LINK_DESTINATION_MEDIA = "media";
const LINK_DESTINATION_ATTACHMENT = "attachment";

function attributesFromMedia({ attributes, setAttributes }) {
	return (media) => {
		let src;

		src =
			media.sizes?.large?.url ||
			// eslint-disable-next-line camelcase
			media.media_details?.sizes?.large?.source_url;

		setAttributes({
			mediaId: media.id,
			mediaUrl: src || media.url,
			mediaLink: media.link || undefined,
		});
	};
}

function BackgroundEdit({ attributes, isSelected, setAttributes }) {
	const { imageFill, mediaId, mediaPosition, mediaUrl, mediaWidth, verticalAlignment, noRepeat, imageClassName } = attributes;

	const image = useSelect(
		(select) => {
			return mediaId && isSelected ? select("core").getMedia(mediaId) : null;
		},
		[isSelected, mediaId]
	);

	const refMediaContainer = useRef();

	const [temporaryMediaWidth, setTemporaryMediaWidth] = useState(null);

	const onSelectMedia = attributesFromMedia({ attributes, setAttributes });

	const onWidthChange = (width) => {
		setTemporaryMediaWidth(applyWidthConstraints(width));
	};
	const commitWidthChange = (width) => {
		setAttributes({
			mediaWidth: applyWidthConstraints(width),
		});
		setTemporaryMediaWidth(applyWidthConstraints(width));
	};

	const classNames = classnames({
		"has-media-on-the-right": "right" === mediaPosition,
		"is-selected": isSelected,
	});
	const widthString = `${temporaryMediaWidth || mediaWidth}%`;
	const onVerticalAlignmentChange = (alignment) => {
		setAttributes({ verticalAlignment: alignment });
	};

	const mediaTextGeneralSettings = (
		<PanelBody title={__("Media & Text settings")}>
			<ToggleControl
				label={__("Cover image")}
				checked={imageFill}
				onChange={() =>
					setAttributes({
						imageFill: !imageFill,
					})
				}
			/><ToggleControl
				label={__("No Repeat")}
				checked={noRepeat}
				onChange={() =>
					setAttributes({
						noRepeat: !noRepeat,
					})
				}
			/>
            <TextControl
				label={__("Image Class")}
				value={imageClassName}
				onChange={(value) =>
					setAttributes({
						imageClassName: value,
					})
				}
			/>
		</PanelBody>
	);

	const blockProps = useBlockProps({
		className: classNames,
	});

	const innerBlocksProps = useInnerBlocksProps({ className: "wp-block-background-text" }, { template: TEMPLATE });

	return (
		<Fragment>
			<InspectorControls>{mediaTextGeneralSettings}</InspectorControls>
			<BlockControls group="block">
				<BlockVerticalAlignmentControl onChange={onVerticalAlignmentChange} value={verticalAlignment} />
			</BlockControls>
			<div {...blockProps}>
				<MediaContainer
					className={"wp-block-background-image"}
					onSelectMedia={onSelectMedia}
					onWidthChange={onWidthChange}
					commitWidthChange={commitWidthChange}
					ref={refMediaContainer}
					{...{
						noRepeat,
                        imageClassName,
						imageFill,
						isSelected,
						mediaId,
                        verticalAlignment,
						mediaPosition,
						mediaUrl,
						mediaWidth,
					}}
				/>
				<div {...innerBlocksProps} />
			</div>
		</Fragment>
	);
}

export default BackgroundEdit;
