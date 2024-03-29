
import { Path, SVG } from '@wordpress/primitives';

export const alignCenter = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M16.4 4.2H7.6v1.5h8.9V4.2zM4 11.2v1.5h16v-1.5H4zm3.6 8.6h8.9v-1.5H7.6v1.5z" />
	</SVG>
);

export const alignLeft = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> 
		<Path d="M4 19.8h8.9v-1.5H4v1.5zm8.9-15.6H4v1.5h8.9V4.2zm-8.9 7v1.5h16v-1.5H4z" />
	</SVG>
);

export const alignRight = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M11.1 19.8H20v-1.5h-8.9v1.5zm0-15.6v1.5H20V4.2h-8.9zM4 12.8h16v-1.5H4v1.5z" />
	</SVG>
);

export const verticalAlignBottom = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M15 4H9v11h6V4zM4 18.5V20h16v-1.5H4z" />
	</SVG>
);

export const verticalAlignCenter = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M20 11h-5V4H9v7H4v1.5h5V20h6v-7.5h5z" />
	</SVG>
);

export const verticalAlignTop = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M9 20h6V9H9v11zM4 4v1.5h16V4H4z" />
	</SVG>
);

export const templateIconMissing = (
	<SVG
		width="48"
		height="48"
		viewBox="0 0 48 48"
		xmlns="http://www.w3.org/2000/svg"
	>
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M23.58 26.28c0-.600003.1499985-1.099998.45-1.5.3000015-.400002.7433304-.8399976 1.33-1.32.5600028-.4533356.9833319-.8699981 1.27-1.25s.43-.8433306.43-1.39c0-.5466694-.1733316-1.0566643-.52-1.53s-.986662-.71-1.92-.71c-1.1066722 0-1.8533314.2766639-2.24.83-.3866686.5533361-.58 1.1766632-.58 1.87 0 .1466674.0033333.2666662.01.36.0066667.0933338.01.1533332.01.18h-1.78c-.0133334-.0533336-.0266666-.146666-.04-.28-.0133334-.133334-.02-.2733326-.02-.42 0-.7733372.1766649-1.4666636.53-2.08.3533351-.6133364.8899964-1.0999982 1.61-1.46.7200036-.3600018 1.5999948-.54 2.64-.54 1.2133394 0 2.2033295.3233301 2.97.97s1.15 1.5099946 1.15 2.59c0 .7066702-.1033323 1.3033309-.31 1.79-.2066677.4866691-.4533319.8799985-.74 1.18-.2866681.3000015-.6566644.6233316-1.11.97-.4800024.3866686-.8333322.7166653-1.06.99-.2266678.2733347-.34.6233312-.34 1.05v.82h-1.74zm-.14 2.56h2V31h-2zM39 12c1.1046 0 2 .8954 2 2v20c0 1.1046-.8954 2-2 2H9c-1.10457 0-2-.8954-2-2V14c0-1.1046.89543-2 2-2h30zm0 22V14H9v20h30z"
		/>
	</SVG>
);

export const button = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path d="M19 6.5H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2zm.5 9c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-7c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v7zM8 13h8v-1.5H8V13z" />
	</SVG>
);

export const column = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M19 6H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM6 17.5c-.3 0-.5-.2-.5-.5V8c0-.3.2-.5.5-.5h3v10H6zm13.5-.5c0 .3-.2.5-.5.5h-3v-10h3c.3 0 .5.2.5.5v9z" />
	</SVG>
);

export const tab = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<Path d="M2.99707 5.5C2.99707 4.11929 4.11636 3 5.49707 3H14.4971C15.8778 3 16.9971 4.11929 16.9971 5.5V14.5C16.9971 15.8807 15.8778 17 14.4971 17H5.49707C4.11636 17 2.99707 15.8807 2.99707 14.5V5.5ZM15.9971 6V5.5C15.9971 4.67157 15.3255 4 14.4971 4H8.99707V5.5C8.99707 5.77614 9.22093 6 9.49707 6H15.9971ZM7.99707 4H5.49707C4.66864 4 3.99707 4.67157 3.99707 5.5V14.5C3.99707 15.3284 4.66864 16 5.49707 16H14.4971C15.3255 16 15.9971 15.3284 15.9971 14.5V7H9.49707C8.66864 7 7.99707 6.32843 7.99707 5.5V4Z" />
	</SVG>
);

export const tabs = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<Path d="M2.99707 5.5C2.99707 4.11929 4.11636 3 5.49707 3H14.4971C15.8778 3 16.9971 4.11929 16.9971 5.5V14.5C16.9971 15.8807 15.8778 17 14.4971 17H5.49707C4.11636 17 2.99707 15.8807 2.99707 14.5V5.5ZM15.9971 6V5.5C15.9971 4.67157 15.3255 4 14.4971 4H8.99707V5.5C8.99707 5.77614 9.22093 6 9.49707 6H15.9971ZM7.99707 4H5.49707C4.66864 4 3.99707 4.67157 3.99707 5.5V14.5C3.99707 15.3284 4.66864 16 5.49707 16H14.4971C15.3255 16 15.9971 15.3284 15.9971 14.5V7H9.49707C8.66864 7 7.99707 6.32843 7.99707 5.5V4Z" />
	</SVG>
);

export const columns = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path d="M19 6H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4.1 1.5v10H10v-10h4.9zM5.5 17V8c0-.3.2-.5.5-.5h2.5v10H6c-.3 0-.5-.2-.5-.5zm14 0c0 .3-.2.5-.5.5h-2.6v-10H19c.3 0 .5.2.5.5v9z" />
	</SVG>
);

export const stack = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M20.2 8v11c0 .7-.6 1.2-1.2 1.2H6v1.5h13c1.5 0 2.7-1.2 2.7-2.8V8zM18 16.4V4.6c0-.9-.7-1.6-1.6-1.6H4.6C3.7 3 3 3.7 3 4.6v11.8c0 .9.7 1.6 1.6 1.6h11.8c.9 0 1.6-.7 1.6-1.6zm-13.5 0V4.6c0-.1.1-.1.1-.1h11.8c.1 0 .1.1.1.1v11.8c0 .1-.1.1-.1.1H4.6l-.1-.1z" />
	</SVG>
);
