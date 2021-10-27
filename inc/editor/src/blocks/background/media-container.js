/**
 * External dependencies
 */
import classnames from "classnames";
import { noop } from "lodash";

/**
 * WordPress dependencies
 */
import { ResizableBox, Spinner, withNotices } from "@wordpress/components";
import { BlockControls, BlockIcon, MediaPlaceholder, MediaReplaceFlow, store as blockEditorStore } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { useViewportMatch } from "@wordpress/compose";
import { useDispatch } from "@wordpress/data";
import { forwardRef } from "@wordpress/element";
import { isBlobURL } from "@wordpress/blob";

/**
 * Internal dependencies
 */
import icon from "./icon";

/**
 * Constants
 */
const ALLOWED_MEDIA_TYPES = ["image"];

export function imageFillStyles(url, imageFill, verticalAlignment, noRepeat) {
	return url
		? {
				backgroundImage: `url(${url})`,
				backgroundPosition: verticalAlignment,
				backgroundSize: imageFill ? "cover" : "contain",
				backgroundRepeat: noRepeat ? "no-repeat" : null,
		  }
		: {};
}

const ResizableBoxContainer = forwardRef(({ isSelected, isStackedOnMobile, ...props }, ref) => {
	const isMobile = useViewportMatch("small", "<");
	return <ResizableBox ref={ref} showHandle={isSelected && (!isMobile || !isStackedOnMobile)} {...props} />;
});

function ToolbarEditButton({ mediaId, mediaUrl, onSelectMedia }) {
	return (
		<BlockControls group="other">
			<MediaReplaceFlow mediaId={mediaId} mediaURL={mediaUrl} allowedTypes={ALLOWED_MEDIA_TYPES} accept="image/*" onSelect={onSelectMedia} />
		</BlockControls>
	);
}

function PlaceholderContainer({ className, noticeOperations, noticeUI, mediaUrl, onSelectMedia }) {
	const onUploadError = (message) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	};

	return (
		<MediaPlaceholder
			icon={<BlockIcon icon={icon} />}
			labels={{
				title: __("Media area"),
			}}
			className={className}
			onSelect={onSelectMedia}
			accept="image/*"
			allowedTypes={ALLOWED_MEDIA_TYPES}
			notices={noticeUI}
			onError={onUploadError}
			disableMediaButtons={mediaUrl}
		/>
	);
}

function MediaContainer(props, ref) {
	const { className, verticalAlignment, commitWidthChange, imageFill, isSelected, mediaId, mediaPosition, mediaUrl, mediaWidth, onSelectMedia, onWidthChange, noRepeat } = props;

	const isTemporaryMedia = !mediaId && isBlobURL(mediaUrl);

	const { toggleSelection } = useDispatch(blockEditorStore);

	if (mediaUrl) {
		const onResizeStart = () => {
			toggleSelection(false);
		};
		const onResize = (event, direction, elt) => {
			onWidthChange(parseInt(elt.style.width));
		};
		const onResizeStop = (event, direction, elt) => {
			toggleSelection(true);
			commitWidthChange(parseInt(elt.style.width));
		};
		const enablePositions = {
			right: mediaPosition === "left",
			left: mediaPosition === "right",
		};

		const backgroundStyles = imageFillStyles(mediaUrl, imageFill, verticalAlignment, noRepeat);

		let image = null;
		image = (
			<div className="wp-block-background-image" style={backgroundStyles}>
				<div className="wp-block-background-text">
					<PlaceholderContainer {...props} />
				</div>
			</div>
		);

		return (
			<>
				<ToolbarEditButton onSelectMedia={onSelectMedia} mediaUrl={mediaUrl} mediaId={mediaId} />
				{image}
				{isTemporaryMedia && <Spinner />}
			</>
		);
	}

	return <PlaceholderContainer {...props} />;
}

export default withNotices(forwardRef(MediaContainer));
